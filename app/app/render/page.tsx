import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Film, CheckCircle2, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import type { RenderJob } from '@/lib/types'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    processing: 'bg-blue-100 text-blue-700 animate-pulse',
    draft: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'failed' && <XCircle className="h-3 w-3" />}
      {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'draft' && <Clock className="h-3 w-3" />}
      <span className="capitalize">{status}</span>
    </span>
  )
}

export default async function RenderPage() {
  const supabase = await createServerClient()

  const [{ data: renderJobs }, { data: clips }] = await Promise.all([
    supabase
      .from('render_jobs')
      .select('*, clips(title, video_id)')
      .eq('workspace_id', WORKSPACE_ID)
      .order('started_at', { ascending: false })
      .limit(30),
    supabase
      .from('clips')
      .select('id, title, aspect_ratio, status')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const jobs = (renderJobs ?? []) as (RenderJob & { clips: { title: string; video_id: string } | null })[]
  const pendingCount = jobs.filter(j => j.status === 'processing' || j.status === 'draft').length
  const completedCount = jobs.filter(j => j.status === 'completed').length
  const failedCount = jobs.filter(j => j.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Render Engine</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Remotion + Clipify — render and reformat clips for social platforms.
          </p>
        </div>
        <Link
          href="/app/videos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Film className="h-4 w-4" />
          New Clip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Active</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Failed</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Render Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Render Jobs</CardTitle>
          <CardDescription>All render jobs — refresh to see live updates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="py-16 text-center">
              <Film className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No render jobs yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Open a clip in{' '}
                <Link href="/app/videos" className="text-blue-500 hover:underline">Videos</Link>{' '}
                and trigger a render.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {job.clips?.title ?? 'Untitled Clip'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {job.engine} · {job.composition_name ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      {job.started_at
                        ? formatDistanceToNow(new Date(job.started_at), { addSuffix: true })
                        : '—'}
                    </span>
                    {job.output_url && (
                      <a
                        href={job.output_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Clips to Render */}
      {clips && clips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Ready to Render</CardTitle>
            <CardDescription>Completed clips that can be rendered to social formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clips.map(clip => (
                <Link
                  key={clip.id}
                  href={`/app/clips/${clip.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{clip.title ?? 'Untitled'}</p>
                    <p className="text-xs text-slate-400 font-mono">{clip.aspect_ratio ?? '—'}</p>
                  </div>
                  <Film className="h-4 w-4 text-blue-400 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
