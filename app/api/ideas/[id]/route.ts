import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, prompt, status, priority, format, platform, pillar } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (prompt !== undefined) updates.prompt = prompt
    if (status !== undefined) updates.status = status
    if (priority !== undefined) updates.priority = priority
    if (format !== undefined) updates.format = format
    if (platform !== undefined) updates.platform = platform
    if (pillar !== undefined) updates.pillar = pillar

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas',
      entity_type: 'idea',
      entity_id: id,
      message: `Idea updated: ${data.title}`,
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
    .from('ideas')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
