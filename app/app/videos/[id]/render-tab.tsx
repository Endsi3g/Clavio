'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Film, RotateCcw, AlertCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { RenderJob } from '@/lib/types'

type RenderJobStatus = Pick<
  RenderJob,
  'id' | 'status' | 'output_url' | 'error_message' | 'started_at' | 'finished_at'
>

const POLL_INTERVAL_MS = 4000

export function RenderTab({ initialJobs }: { initialJobs: RenderJob[] }) {
  const [jobs, setJobs] = useState<RenderJob[]>(initialJobs)

  const processingIds = jobs
    .filter((j) => j.status === 'processing' || j.status === 'draft')
    .map((j) => j.id)

  const pollJob = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/render-jobs/${id}/status`)
      if (!res.ok) return
      const updated: RenderJobStatus = await res.json()
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...updated } : j))
      )
    } catch {
      // silently ignore network errors during polling
    }
  }, [])

  useEffect(() => {
    if (processingIds.length === 0) return

    const interval = setInterval(() => {
      processingIds.forEach((id) => pollJob(id))
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [processingIds.join(','), pollJob])

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No render jobs"
        description="Approve a clip and render it to see jobs here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900 font-mono">
                  {(job as any).composition_name ?? job.engine}
                </span>
              </div>
              <StatusBadge status={job.status} />
            </div>
            {(job.status === 'processing' || job.status === 'draft') && (
              <div className="space-y-1">
                <Progress value={undefined} className="h-1.5 animate-pulse" />
                <p className="text-[10px] text-slate-400 font-mono">Processing…</p>
              </div>
            )}
            {job.error_message && (
              <div className="flex items-start gap-1.5 rounded bg-red-50 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{job.error_message}</p>
              </div>
            )}
            {job.output_url && (
              <a
                href={job.output_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-mono"
              >
                <ExternalLink className="h-3 w-3" />
                {job.output_url}
              </a>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-mono">
                {job.started_at
                  ? formatDistanceToNow(new Date(job.started_at), { addSuffix: true })
                  : '—'}
              </p>
              {job.status === 'failed' && (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
