import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const MAX_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `File too large. Maximum size is 500 MB.` }, { status: 413 })
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 })
    }

    const supabase = await createServerClient()

    const ext = file.name.split('.').pop() ?? 'mp4'
    const storagePath = `uploads/${WORKSPACE_ID}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const videoTitle = title?.trim() || file.name.replace(/\.[^/.]+$/, '')

    const { data: videoRecord, error: dbError } = await supabase
      .from('videos')
      .insert({
        workspace_id: WORKSPACE_ID,
        title: videoTitle,
        source_url: null,
        storage_path: storagePath,
        status: 'draft',
        processing_status: 'draft',
        transcription_status: 'draft',
      })
      .select()
      .single()

    if (dbError) {
      // Attempt to clean up storage on DB failure
      await supabase.storage.from('videos').remove([storagePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/upload',
      entity_type: 'video',
      entity_id: videoRecord.id,
      message: `Video uploaded: ${videoTitle} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
      payload_json: { storage_path: storagePath, size_bytes: file.size, type: file.type },
    })

    return NextResponse.json({ data: videoRecord }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
