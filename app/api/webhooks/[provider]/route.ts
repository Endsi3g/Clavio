import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// Handles callbacks FROM n8n or other automation providers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params

    // Verify shared secret when configured (strongly recommended in production)
    if (WEBHOOK_SECRET) {
      const incomingSecret =
        request.headers.get('x-clavio-secret') ??
        request.headers.get('x-webhook-secret') ??
        new URL(request.url).searchParams.get('secret')

      if (incomingSecret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()

    const supabase = await createServerClient()

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: `webhooks/${provider}`,
      message: `Webhook received from ${provider}`,
      payload_json: body,
    })

    if (provider === 'n8n') {
      return handleN8nCallback(supabase, body)
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleN8nCallback(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>,
  body: {
    workflow_run_id?: string
    post_id?: string
    status?: 'success' | 'failed'
    platform_post_id?: string
    published_at?: string
    error_message?: string
    metrics?: {
      views?: number
      likes?: number
      comments?: number
      shares?: number
    }
  }
) {
  const { workflow_run_id, post_id, status, platform_post_id, published_at, error_message, metrics } = body

  if (!workflow_run_id || !post_id) {
    return NextResponse.json({ error: 'workflow_run_id and post_id required' }, { status: 400 })
  }

  // Update workflow run (workspace-scoped)
  await supabase.from('workflow_runs').update({
    status: status === 'success' ? 'published' : 'failed',
    output_json: { platform_post_id, published_at },
    error_message: error_message ?? null,
    finished_at: new Date().toISOString(),
  }).eq('id', workflow_run_id).eq('workspace_id', WORKSPACE_ID)

  if (status === 'success') {
    // Update post status (workspace-scoped)
    await supabase.from('posts').update({
      status: 'published',
      published_at: published_at ?? new Date().toISOString(),
    }).eq('id', post_id).eq('workspace_id', WORKSPACE_ID)

    // Insert initial metrics if provided
    if (metrics) {
      await supabase.from('post_metrics').insert({
        workspace_id: WORKSPACE_ID,
        post_id,
        views: metrics.views ?? 0,
        likes: metrics.likes ?? 0,
        comments: metrics.comments ?? 0,
        shares: metrics.shares ?? 0,
        collected_at: new Date().toISOString(),
      })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'webhooks/n8n',
      entity_type: 'post',
      entity_id: post_id,
      message: `Post published successfully. Platform ID: ${platform_post_id ?? 'unknown'}`,
      payload_json: { platform_post_id, metrics },
    })
  } else {
    await supabase.from('posts').update({ status: 'failed' }).eq('id', post_id).eq('workspace_id', WORKSPACE_ID)

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'error',
      source: 'webhooks/n8n',
      entity_type: 'post',
      entity_id: post_id,
      message: `Post publish failed: ${error_message ?? 'unknown error'}`,
      payload_json: { error_message },
    })
  }

  return NextResponse.json({ received: true })
}
