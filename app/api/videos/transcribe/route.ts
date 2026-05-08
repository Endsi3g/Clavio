import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const WHISPER_API_URL = process.env.WHISPER_API_URL || 'http://localhost:9000'

export async function POST(request: NextRequest) {
  try {
    const { video_id } = await request.json()

    if (!video_id) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', video_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!video.storage_path) {
      return NextResponse.json({ error: 'Video has no storage path. Upload the file first.' }, { status: 400 })
    }

    // Mark transcription as processing
    await supabase
      .from('videos')
      .update({ transcription_status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', video_id)

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/transcribe',
      entity_type: 'video',
      entity_id: video_id,
      message: `Transcription started for: ${video.title}`,
    })

    // Get a signed URL from Supabase Storage to pass to Whisper
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.storage_path, 3600)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      await supabase.from('videos').update({ transcription_status: 'failed' }).eq('id', video_id)
      return NextResponse.json({ error: 'Failed to generate signed URL for video' }, { status: 500 })
    }

    // Download the video file from signed URL and pass as binary to Whisper.
    // whisper-asr-webservice /asr expects multipart `audio_file` (binary upload).
    // Passing a URL directly is non-standard and not supported by most builds.
    const videoFetchRes = await fetch(signedUrlData.signedUrl)
    if (!videoFetchRes.ok) {
      await supabase.from('videos').update({ transcription_status: 'failed' }).eq('id', video_id)
      return NextResponse.json({ error: 'Failed to download video for transcription' }, { status: 502 })
    }
    const videoBlob = await videoFetchRes.blob()

    const formData = new FormData()
    formData.append('audio_file', videoBlob, `${video_id}.mp4`)
    formData.append('task', 'transcribe')
    formData.append('language', 'auto')
    formData.append('output', 'json')

    const whisperRes = await fetch(`${WHISPER_API_URL}/asr`, {
      method: 'POST',
      body: formData,
    })

    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      await supabase.from('videos').update({ transcription_status: 'failed' }).eq('id', video_id)
      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'error',
        source: 'videos/transcribe',
        entity_type: 'video',
        entity_id: video_id,
        message: `Whisper failed: ${errText}`,
      })
      return NextResponse.json(
        { error: 'Whisper service unavailable. Ensure it is running at ' + WHISPER_API_URL },
        { status: 503 }
      )
    }

    const whisperData = await whisperRes.json()

    // whisper-asr-webservice returns { text, segments: [{id, start, end, text}] }
    const fullText: string = whisperData.text ?? ''
    const segments: unknown[] = whisperData.segments ?? []
    const detectedLanguage: string = whisperData.language ?? 'unknown'

    // Save transcript
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        workspace_id: WORKSPACE_ID,
        video_id,
        language: detectedLanguage,
        content: fullText,
        segments_json: segments,
      })
      .select()
      .single()

    if (transcriptError) {
      await supabase.from('videos').update({ transcription_status: 'failed' }).eq('id', video_id)
      return NextResponse.json({ error: transcriptError.message }, { status: 500 })
    }

    // Update video status
    await supabase
      .from('videos')
      .update({ transcription_status: 'review', updated_at: new Date().toISOString() })
      .eq('id', video_id)

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/transcribe',
      entity_type: 'video',
      entity_id: video_id,
      message: `Transcription completed (${detectedLanguage}). ${segments.length} segments.`,
      payload_json: { transcript_id: transcript.id, language: detectedLanguage, segment_count: segments.length },
    })

    return NextResponse.json({ data: transcript })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
