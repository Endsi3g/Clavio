import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { notifyStatusChange } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { title, status, processing_status, transcription_status } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (status !== undefined) updates.status = status
    if (processing_status !== undefined) updates.processing_status = processing_status
    if (transcription_status !== undefined) updates.transcription_status = transcription_status

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Trigger webhook if status changed
    if (status !== undefined) {
      notifyStatusChange('video', id, 'unknown', status, { title: data.title })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos',
      entity_type: 'video',
      entity_id: id,
      message: `Video updated: ${data.title}`,
    })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()

  // 1. Get storage path
  const { data: video } = await supabase
    .from('videos')
    .select('storage_path')
    .eq('id', id)
    .single()

  // 2. Delete from storage if exists
  if (video?.storage_path) {
    await supabase.storage.from('videos').remove([video.storage_path])
  }

  // 3. Delete from DB
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
