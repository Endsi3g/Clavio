import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      idea_id,
      clip_id,
      platform,
      title,
      caption,
      hashtags,
      media_url,
      scheduled_for,
    } = body

    if (!platform || !title) {
      return NextResponse.json(
        { error: 'platform and title are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const status = scheduled_for ? 'scheduled' : 'draft'

    const { data, error } = await supabase
      .from('posts')
      .insert({
        workspace_id: WORKSPACE_ID,
        idea_id: idea_id ?? null,
        clip_id: clip_id ?? null,
        platform,
        title,
        caption: caption ?? null,
        hashtags: hashtags ?? null,
        media_url: media_url ?? null,
        status,
        scheduled_for: scheduled_for ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'publishing',
      entity_type: 'post',
      entity_id: data.id,
      message: `Post ${status}: ${title} → ${platform}`,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
