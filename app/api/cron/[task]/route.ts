import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task: string }> }
) {
  const { task } = await params
  const supabase = await createServerClient()

  switch (task) {
    case 'sync-metrics':
      return syncMetrics(supabase)
    case 'retry-failed-posts':
      return retryFailedPosts(supabase)
    case 'cleanup-processing':
      return cleanupStuckProcessing(supabase)
    default:
      return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 404 })
  }
}

async function syncMetrics(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>
) {
  // Trigger n8n workflow to collect metrics for recently published posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, platform, published_at')
    .eq('workspace_id', WORKSPACE_ID)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (!recentPosts || recentPosts.length === 0) {
    return NextResponse.json({ message: 'No published posts to sync' })
  }

  try {
    await fetch(`${N8N_BASE_URL}/webhook/clavio-sync-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_ids: recentPosts.map((p) => p.id),
        workspace_id: WORKSPACE_ID,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/n8n`,
      }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    // n8n might be offline — log and continue
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'cron/sync-metrics',
    message: `Metrics sync triggered for ${recentPosts.length} posts`,
  })

  return NextResponse.json({ synced: recentPosts.length })
}

async function retryFailedPosts(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>
) {
  const { data: failedPosts } = await supabase
    .from('posts')
    .select('id, title, platform')
    .eq('workspace_id', WORKSPACE_ID)
    .eq('status', 'failed')
    .order('updated_at', { ascending: false })
    .limit(5)

  if (!failedPosts || failedPosts.length === 0) {
    return NextResponse.json({ message: 'No failed posts to retry' })
  }

  const results = []
  for (const post of failedPosts) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id }),
      })
      const json = await res.json()
      results.push({ id: post.id, success: res.ok, error: json.error })
    } catch (err) {
      results.push({ id: post.id, success: false, error: err instanceof Error ? err.message : 'Unknown' })
    }
  }

  return NextResponse.json({ results })
}

async function cleanupStuckProcessing(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createServerClient>>
) {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago

  // Reset videos stuck in processing
  const { data: stuckVideos } = await supabase
    .from('videos')
    .update({ transcription_status: 'failed', updated_at: new Date().toISOString() })
    .eq('workspace_id', WORKSPACE_ID)
    .eq('transcription_status', 'processing')
    .lt('updated_at', cutoff)
    .select('id')

  // Reset render_jobs stuck in processing
  const { data: stuckJobs } = await supabase
    .from('render_jobs')
    .update({
      status: 'failed',
      error_message: 'Timed out — job was stuck in processing for >2h',
      finished_at: new Date().toISOString(),
    })
    .eq('workspace_id', WORKSPACE_ID)
    .eq('status', 'processing')
    .lt('started_at', cutoff)
    .select('id')

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'cron/cleanup-processing',
    message: `Cleanup: reset ${stuckVideos?.length ?? 0} stuck videos, ${stuckJobs?.length ?? 0} stuck render jobs`,
  })

  return NextResponse.json({
    stuck_videos_reset: stuckVideos?.length ?? 0,
    stuck_jobs_reset: stuckJobs?.length ?? 0,
  })
}
