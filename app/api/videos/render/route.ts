import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const { clip_id, composition = 'ClavioClip', brand_color, engine = 'clipify' } = await request.json()

    if (!clip_id) {
      return NextResponse.json({ error: 'clip_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: clip, error: clipError } = await supabase
      .from('clips')
      .select('*, videos(*)')
      .eq('id', clip_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (clipError || !clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    const video = (clip as unknown as { videos: { storage_path: string; title: string } }).videos
    if (!video?.storage_path) {
      return NextResponse.json({ error: 'Source video has no storage file' }, { status: 400 })
    }

    // Gate Remotion engine — requires @remotion/bundler and @remotion/renderer
    if (engine === 'remotion') {
      const remotionAvailable = await checkRemotionAvailable()
      if (!remotionAvailable) {
        return NextResponse.json(
          {
            error:
              'Remotion engine is not installed. Run: npm install @remotion/bundler @remotion/renderer — or use engine="clipify" instead.',
          },
          { status: 503 }
        )
      }
    }

    // Gate Clipify engine — requires Python scripts in lib/clipify/scripts/
    if (engine === 'clipify') {
      const { checkClipifyAvailable } = await import('@/lib/clipify-engine')
      const { available, missing } = checkClipifyAvailable()
      if (!available) {
        return NextResponse.json(
          { error: `Clipify engine is missing Python scripts: ${missing.join(', ')}. See lib/clipify/scripts/.` },
          { status: 503 }
        )
      }
    }

    const { data: signedUrlData } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.storage_path, 7200)

    if (!signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to get signed URL for source video' }, { status: 500 })
    }

    const { data: renderJob, error: jobError } = await supabase
      .from('render_jobs')
      .insert({
        workspace_id: WORKSPACE_ID,
        clip_id,
        engine,
        composition_name: composition,
        status: 'processing',
        input_json: {
          clip_id,
          composition,
          brand_color: brand_color ?? '#60A5FA',
          start_ms: clip.start_ms,
          end_ms: clip.end_ms,
        },
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError || !renderJob) {
      return NextResponse.json({ error: 'Failed to create render job' }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/render',
      entity_type: 'render_job',
      entity_id: renderJob.id,
      message: `Render started (engine=${engine}) for clip: ${clip.title}`,
    })

    runRender({
      supabase,
      renderJobId: renderJob.id,
      clipId: clip_id,
      videoUrl: signedUrlData.signedUrl,
      clip,
      composition,
      brandColor: brand_color ?? '#60A5FA',
      engine: engine as 'remotion' | 'clipify',
    }).catch(async (err) => {
      await supabase
        .from('render_jobs')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : String(err),
          finished_at: new Date().toISOString(),
        })
        .eq('id', renderJob.id)
      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'error',
        source: 'videos/render',
        entity_type: 'render_job',
        entity_id: renderJob.id,
        message: `Render failed: ${err instanceof Error ? err.message : String(err)}`,
      })
    })

    return NextResponse.json({ data: renderJob })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function checkRemotionAvailable(): Promise<boolean> {
  try {
    await import('@remotion/bundler')
    return true
  } catch {
    return false
  }
}

async function runRender({
  supabase,
  renderJobId,
  clipId,
  videoUrl,
  clip,
  composition,
  brandColor,
  engine,
}: {
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>
  renderJobId: string
  clipId: string
  videoUrl: string
  clip: { video_id: string; title: string; caption: string | null; start_ms: number; end_ms: number }
  composition: string
  brandColor: string
  engine: 'remotion' | 'clipify'
}) {
  if (engine === 'clipify') {
    const { clipifyEngine } = await import('@/lib/clipify-engine')

    const leftROI = '400:400:400:300'
    const rightROI = '1120:400:400:300'

    const speakerTimeline = await clipifyEngine.analyzeSpeakerMotion(videoUrl, leftROI, rightROI)
    const leftX = 400 - 304
    const rightX = 1120 - 304
    const panExpr = await clipifyEngine.buildPanExpression(JSON.stringify(speakerTimeline), leftX, rightX)

    const { data: transcript } = await supabase
      .from('transcripts')
      .select('*')
      .eq('video_id', clip.video_id)
      .single()

    let assContent = ''
    if (transcript) {
      assContent = await clipifyEngine.buildAssSubtitles(JSON.stringify(transcript.segments_json), 'opus')
    }

    const outputPath = path.join(os.tmpdir(), `clipify-${renderJobId}.mp4`)
    const duration = (clip.end_ms - clip.start_ms) / 1000
    const startSec = clip.start_ms / 1000
    const filter = `[0:v]crop=608:1080:x='${panExpr}':y=0,scale=1080:1920:flags=lanczos[v]`
    const ffmpegCmd = `ffmpeg -y -ss ${startSec} -i "${videoUrl}" -t ${duration} -filter_complex "${filter}" -map "[v]" -map 0:a -c:v libx264 -preset fast -crf 20 -c:a aac "${outputPath}"`

    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    await promisify(exec)(ffmpegCmd)

    await uploadAndFinish({ supabase, renderJobId, clipId, outputPath })
    return
  }

  // Remotion engine (requires @remotion/bundler + @remotion/renderer)
  const { bundle } = await import('@remotion/bundler')
  const { renderMedia, selectComposition } = await import('@remotion/renderer')

  const remotionRoot = path.join(process.cwd(), 'remotion', 'Root.tsx')
  const bundled = await bundle({ entryPoint: remotionRoot })

  const durationSeconds = (clip.end_ms - clip.start_ms) / 1000
  const fps = 30
  const durationInFrames = Math.ceil(durationSeconds * fps)

  const inputProps = {
    videoUrl,
    caption: clip.caption ?? clip.title,
    title: clip.title,
    brandColor,
    showProgressBar: true,
    showCaption: true,
  }

  const comp = await selectComposition({ serveUrl: bundled, id: composition, inputProps })

  const outputPath = path.join(os.tmpdir(), `render-${renderJobId}.mp4`)

  await renderMedia({
    composition: { ...comp, durationInFrames },
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
  })

  await uploadAndFinish({ supabase, renderJobId, clipId, outputPath })
}

async function uploadAndFinish({
  supabase,
  renderJobId,
  clipId,
  outputPath,
}: {
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>
  renderJobId: string
  clipId: string
  outputPath: string
}) {
  const { readFile, unlink } = await import('fs/promises')
  const fileBuffer = await readFile(outputPath)
  const storagePath = `renders/${renderJobId}.mp4`

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(storagePath, fileBuffer, { contentType: 'video/mp4', upsert: true })

  await unlink(outputPath).catch(() => null)

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  const { data: publicData } = supabase.storage.from('videos').getPublicUrl(storagePath)

  await supabase
    .from('render_jobs')
    .update({
      status: 'published',
      output_url: publicData.publicUrl,
      finished_at: new Date().toISOString(),
    })
    .eq('id', renderJobId)

  await supabase.from('clips').update({ status: 'published' }).eq('id', clipId)

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'videos/render',
    entity_type: 'render_job',
    entity_id: renderJobId,
    message: `Render completed: ${publicData.publicUrl}`,
    payload_json: { output_url: publicData.publicUrl },
  })
}
