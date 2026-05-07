import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

/**
 * POST /api/metrics/sync
 * Syncs post metrics from a payload into post_metrics table.
 * Expected body: { post_id, views, likes, comments, shares, saves, clicks, watch_time_seconds, retention_rate }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      post_id,
      views,
      likes,
      comments,
      shares,
      saves,
      clicks,
      watch_time_seconds,
      retention_rate,
    } = body

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verify the post exists in this workspace
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, platform')
      .eq('id', post_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('post_metrics')
      .insert({
        workspace_id: WORKSPACE_ID,
        post_id,
        views: views ?? null,
        likes: likes ?? null,
        comments: comments ?? null,
        shares: shares ?? null,
        saves: saves ?? null,
        clicks: clicks ?? null,
        watch_time_seconds: watch_time_seconds ?? null,
        retention_rate: retention_rate ?? null,
        collected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'metrics',
      entity_type: 'post',
      entity_id: post_id,
      message: `Metrics synced for "${post.title}" (${post.platform}): ${views ?? 0} views`,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
