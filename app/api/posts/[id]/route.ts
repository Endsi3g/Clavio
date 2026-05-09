import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, post_metrics(*)')
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const body = await req.json()

  const allowed = ['title', 'caption', 'hashtags', 'scheduled_for', 'platform', 'status', 'approval_status']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'posts',
    entity_type: 'post',
    entity_id: id,
    message: `Post updated: ${Object.keys(updates).filter((k) => k !== 'updated_at').join(', ')}`,
  })

  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'posts',
    entity_type: 'post',
    entity_id: id,
    message: 'Post deleted',
  })

  return NextResponse.json({ success: true })
}
