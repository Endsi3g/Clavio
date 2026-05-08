import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { title, platform, caption, status = 'draft' } = await request.json()

    if (!title || !platform) {
      return NextResponse.json({ error: 'Title and platform are required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        workspace_id: WORKSPACE_ID,
        title,
        platform,
        caption,
        status,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
