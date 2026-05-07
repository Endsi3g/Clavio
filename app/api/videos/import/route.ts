import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

// Uses the local docker-compose instance of Cobalt
// Node.js fetches may resolve localhost to IPv6 ::1, so 127.0.0.1 is safer for Docker.
// Cobalt v11+ uses the root endpoint.
const COBALT_API_URL = process.env.COBALT_API_URL || 'http://127.0.0.1:9001'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // 1. Request video from Cobalt
    const cobaltRes = await fetch(COBALT_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Optional: Some public instances require a specific Accept or API key header
      },
      body: JSON.stringify({
        url,
        isAudioOnly: false,
        vCodec: 'h264',
        filenamePattern: 'nerdy'
      })
    })

    if (!cobaltRes.ok) {
      const errorText = await cobaltRes.text()
      console.error('[Cobalt Error]', errorText)
      return NextResponse.json({ error: 'Failed to fetch video from Cobalt API' }, { status: 500 })
    }

    const cobaltData = await cobaltRes.json()

    // Cobalt usually returns { status: 'stream' | 'redirect' | 'error', url: '...' }
    if (cobaltData.status === 'error') {
      return NextResponse.json({ error: cobaltData.text || 'Cobalt returned an error' }, { status: 400 })
    }

    const videoUrl = cobaltData.url
    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL returned from Cobalt' }, { status: 500 })
    }

    // 2. Fetch the actual video stream
    const videoStreamRes = await fetch(videoUrl)
    if (!videoStreamRes.ok) {
      return NextResponse.json({ error: 'Failed to download the video stream' }, { status: 500 })
    }

    const buffer = await videoStreamRes.arrayBuffer()

    // 3. Upload to Supabase Storage
    const fileName = `imports/${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
    
    const { error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(fileName, buffer, {
        contentType: 'video/mp4',
        upsert: false
      })

    if (uploadError) {
      console.error('[Supabase Storage Error]', uploadError)
      return NextResponse.json({ error: 'Failed to save video to storage' }, { status: 500 })
    }

    // 4. Create record in `videos` table
    const { data: videoRecord, error: dbError } = await supabase
      .from('videos')
      .insert({
        workspace_id: WORKSPACE_ID,
        title: `Imported from ${new URL(url).hostname}`,
        source_url: url,
        storage_path: fileName,
        status: 'pending',
        processing_status: 'pending',
        transcription_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Supabase DB Error]', dbError)
      return NextResponse.json({ error: 'Failed to create database record' }, { status: 500 })
    }

    // 5. Create a log entry
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      level: 'info',
      event: 'video_imported',
      message: `Video imported successfully from ${url}`,
      entity_id: videoRecord.id,
      entity_type: 'videos'
    })

    return NextResponse.json({ success: true, video: videoRecord })
  } catch (error: any) {
    console.error('[Video Import API Error]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
