import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { VideoPreviewCell } from '@/components/video-preview-cell'
import { ArrowLeft, Clock, Layers, Calendar, CheckCircle, XCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { ClipDetailActions } from './clip-detail-actions'

export const dynamic = 'force-dynamic'

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default async function ClipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const [clipResult, renderJobsResult] = await Promise.all([
    supabase
      .from('clips')
      .select('*, videos(id, title, source_url, storage_path)')
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .single(),
    supabase
      .from('render_jobs')
      .select('*')
      .eq('clip_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('started_at', { ascending: false }),
  ])

  if (!clipResult.data) notFound()

  const clip = clipResult.data
  const video = clip.videos as { id: string; title: string; source_url: string | null; storage_path: string | null } | null
  const renderJobs = renderJobsResult.data ?? []
  const durationSeconds = Math.round((clip.end_ms - clip.start_ms) / 1000)

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/app/clips"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clips
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
              {clip.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={clip.status} />
              {clip.aspect_ratio && (
                <span className="text-xs font-mono text-slate-400">{clip.aspect_ratio}</span>
              )}
            </div>
          </div>
          <ClipDetailActions clipId={clip.id} videoId={clip.video_id} status={clip.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: preview + caption */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <VideoPreviewCell
                  videoId={clip.video_id}
                  title={clip.title}
                  sourceUrl={video?.source_url ?? null}
                  durationSeconds={durationSeconds}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">{clip.title}</p>
                  <p className="text-xs font-mono text-slate-500">
                    {formatMs(clip.start_ms)} → {formatMs(clip.end_ms)}
                    <span className="ml-2 text-slate-400">({formatMs(clip.end_ms - clip.start_ms)})</span>
                  </p>
                  {video && (
                    <Link
                      href={`/app/videos/${video.id}`}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      {video.title}
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caption */}
          {clip.caption && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Caption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {clip.caption}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Render jobs */}
          {renderJobs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Render Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {job.status === 'completed' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : job.status === 'failed' ? (
                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {job.engine} {job.composition_name ? `· ${job.composition_name}` : ''}
                        </p>
                        {job.error_message && (
                          <p className="text-xs text-red-500 truncate">{job.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={job.status} />
                      {job.output_url && (
                        <a
                          href={job.output_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 font-mono"
                        >
                          Download →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Layers className="h-3.5 w-3.5 text-slate-400" /> Status
                </span>
                <StatusBadge status={clip.status} />
              </div>
              {clip.aspect_ratio && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Aspect ratio</span>
                  <span className="text-xs font-mono text-slate-700">{clip.aspect_ratio}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Duration</span>
                <span className="text-xs font-mono text-slate-700">{formatMs(clip.end_ms - clip.start_ms)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">In / Out</span>
                <span className="text-xs font-mono text-slate-700">
                  {formatMs(clip.start_ms)} → {formatMs(clip.end_ms)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Created
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {format(new Date(clip.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Updated
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {formatDistanceToNow(new Date(clip.updated_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {video && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Source Video</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/app/videos/${video.id}`}
                  className="text-xs text-blue-500 hover:text-blue-700 font-mono"
                >
                  {video.title}
                </Link>
              </CardContent>
            </Card>
          )}

          {renderJobs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Render Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  {renderJobs.length} job{renderJobs.length !== 1 ? 's' : ''} · {renderJobs.filter(j => j.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
