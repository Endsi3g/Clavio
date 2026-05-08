import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'
const N8N_API_KEY = process.env.N8N_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { post_id } = await request.json()

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!['draft', 'scheduled', 'failed'].includes(post.status)) {
      return NextResponse.json({ error: `Post cannot be published from status: ${post.status}` }, { status: 400 })
    }

    // Create a workflow_run record
    const { data: workflowRun, error: wrError } = await supabase
      .from('workflow_runs')
      .insert({
        workspace_id: WORKSPACE_ID,
        workflow_name: `publish_${post.platform}`,
        entity_type: 'post',
        entity_id: post_id,
        status: 'processing',
        input_json: {
          post_id,
          platform: post.platform,
          title: post.title,
          caption: post.caption,
          hashtags: post.hashtags,
          media_url: post.media_url,
          scheduled_for: post.scheduled_for,
        },
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (wrError) {
      return NextResponse.json({ error: 'Failed to create workflow run' }, { status: 500 })
    }

    // Update post status
    await supabase.from('posts').update({ status: 'processing' }).eq('id', post_id)

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'posts/publish',
      entity_type: 'post',
      entity_id: post_id,
      message: `Publish triggered via n8n for ${post.platform}: "${post.title}"`,
      payload_json: { workflow_run_id: workflowRun.id },
    })

    // Trigger n8n webhook
    const webhookUrl = `${N8N_BASE_URL}/webhook/clavio-publish`
    const webhookPayload = {
      workflow_run_id: workflowRun.id,
      post_id,
      platform: post.platform,
      title: post.title,
      caption: post.caption,
      hashtags: post.hashtags,
      media_url: post.media_url,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/n8n`,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY
    }

    try {
      const n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(10000),
      })

      if (!n8nRes.ok) {
        const errText = await n8nRes.text()
        await supabase.from('logs').insert({
          workspace_id: WORKSPACE_ID,
          severity: 'warning',
          source: 'posts/publish',
          entity_type: 'post',
          entity_id: post_id,
          message: `n8n webhook responded with ${n8nRes.status}: ${errText}`,
        })
      }
    } catch (n8nErr) {
      // n8n might not be running yet — log but don't fail
      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'warning',
        source: 'posts/publish',
        entity_type: 'post',
        entity_id: post_id,
        message: `n8n unreachable at ${webhookUrl}. Workflow queued locally.`,
        payload_json: { error: n8nErr instanceof Error ? n8nErr.message : String(n8nErr) },
      })
    }

    return NextResponse.json({ data: workflowRun })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
