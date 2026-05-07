import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, format, platform, priority } = body

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        workspace_id: WORKSPACE_ID,
        title: title.trim(),
        description: description ?? null,
        format: format ?? null,
        platform: platform ?? null,
        priority: priority ?? null,
        status: 'draft',
        source_type: 'manual',
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/ideas]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the creation
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas',
      entity_type: 'idea',
      entity_id: data.id,
      message: `Idea created: ${title.trim()}`,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/ideas]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
