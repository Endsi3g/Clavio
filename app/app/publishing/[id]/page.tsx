import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { WorkflowTimeline } from '@/components/workflow-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Globe, Clock, Calendar, BarChart2, Link2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Post, PostMetrics } from '@/lib/types'
import { PublishPostButton } from '@/components/publish-post-button'
import { PostPreview } from '@/components/post-preview'
import { ApprovalPanel } from './approval-panel'
import { PostEditDelete } from './post-edit-delete'

export const dynamic = 'force-dynamic'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const [postResult, metricsResult, workflowResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .single(),
    supabase
      .from('post_metrics')
      .select('*')
      .eq('post_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('collected_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('workflow_runs')
      .select('id,workflow_name,status,started_at,finished_at,error_message')
      .eq('entity_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('started_at', { ascending: true }),
  ])

  if (!postResult.data) notFound()

  const post: Post = postResult.data
  const metrics: PostMetrics | null = metricsResult.data
  const workflowRuns = workflowResult.data ?? []

  const { data: commentsData } = await supabase
    .from('post_comments')
    .select('id, body, author_name, created_at')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  type StepStatus = 'success' | 'failed' | 'processing' | 'pending'
  const toStepStatus = (s: string): StepStatus => {
    if (s === 'published' || s === 'completed') return 'success'
    if (s === 'failed') return 'failed'
    if (s === 'processing') return 'processing'
    return 'pending'
  }

  const timelineSteps = [
    { label: 'Created', timestamp: post.created_at, status: 'success' as const },
    ...(post.scheduled_for
      ? [
          {
            label: 'Scheduled',
            timestamp: post.scheduled_for,
            status: (post.status === 'scheduled' || post.status === 'published'
              ? 'success'
              : 'pending') as StepStatus,
          },
        ]
      : []),
    // Real workflow steps from DB
    ...workflowRuns.map((run) => ({
      id: run.id,
      label: run.workflow_name.replace(/_/g, ' ').replace(/^publish /, 'Published via '),
      timestamp: run.finished_at ?? run.started_at,
      status: toStepStatus(run.status),
      message: run.error_message ?? undefined,
    })),
    // If no workflow runs yet but post is published, show it
    ...(post.published_at && workflowRuns.length === 0
      ? [{ label: 'Published', timestamp: post.published_at, status: 'success' as const }]
      : []),
    ...(metrics
      ? [{ label: 'Metrics synced', timestamp: metrics.collected_at, status: 'success' as const }]
      : []),
  ]

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/app/publishing"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Publishing
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
              {post.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500 capitalize">{post.platform}</span>
              <span className="text-slate-300">·</span>
              <StatusBadge status={post.status} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <PostEditDelete post={post} />
            <PostPreview post={post} />
            {(post.status === 'draft' || post.status === 'scheduled' || post.status === 'failed') && (
              <PublishPostButton postId={post.id} />
            )}
          </div>
        </div>
      </div>

      {/* 3-col layout with approval panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-4 lg:col-start-1">
          {/* Caption */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Caption</CardTitle>
            </CardHeader>
            <CardContent>
              {post.caption ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.caption}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">No caption</p>
              )}
            </CardContent>
          </Card>

          {/* Hashtags */}
          {post.hashtags && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono text-blue-600">{post.hashtags}</p>
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {post.media_url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Media</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={post.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 font-mono"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{post.media_url}</span>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          {metrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <MetricStat label="Views" value={metrics.views} />
                  <MetricStat label="Likes" value={metrics.likes} />
                  <MetricStat label="Saves" value={metrics.saves} />
                  <MetricStat label="Shares" value={metrics.shares} />
                  <MetricStat label="Comments" value={metrics.comments} />
                  <MetricStat label="Clicks" value={metrics.clicks} />
                  <MetricStat
                    label="Watch time"
                    value={
                      metrics.watch_time_seconds != null
                        ? `${Math.round(metrics.watch_time_seconds / 60)}m`
                        : null
                    }
                  />
                  <MetricStat
                    label="Retention"
                    value={
                      metrics.retention_rate != null
                        ? `${Math.round(metrics.retention_rate * 100)}%`
                        : null
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <WorkflowTimeline steps={timelineSteps} />
        </div>

        {/* Middle: metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Post details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Platform
                </span>
                <span className="font-medium text-slate-700 capitalize">{post.platform}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={post.status} />
              </div>
              {post.scheduled_for && (
                <>
                  <Separator />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Scheduled
                    </span>
                    <span className="font-mono text-slate-700">
                      {format(new Date(post.scheduled_for), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </>
              )}
              {post.published_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Published
                  </span>
                  <span className="font-mono text-slate-700">
                    {format(new Date(post.published_at), 'MMM d, HH:mm')}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Created</span>
                <span className="font-mono text-slate-400">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {post.published_url && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Live URL
                    </span>
                    <a
                      href={post.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 font-mono truncate max-w-[120px]"
                    >
                      View post →
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {post.idea_id && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/app/ideas/${post.idea_id}`}
                  className="text-xs text-blue-500 hover:text-blue-700 font-mono"
                >
                  View idea →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: approval panel */}
        <div className="min-h-[400px] rounded-xl border border-slate-200 overflow-hidden">
          <ApprovalPanel
            postId={post.id}
            initialApprovalStatus={((post as unknown) as Record<string, unknown>).approval_status as string ?? 'none'}
            initialComments={commentsData ?? []}
          />
        </div>
      </div>
    </div>
  )
}

function MetricStat({ label, value }: { label: string; value: number | string | null | undefined }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold font-mono text-slate-900">
        {value != null ? (typeof value === 'number' ? value.toLocaleString() : value) : '—'}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
