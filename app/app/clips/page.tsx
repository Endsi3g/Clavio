import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { FilterBar } from '@/components/shared/filter-bar'
import { ClipRowActions } from './clip-row-actions'
import { VideoPreviewCell } from '@/components/videos/video-preview-cell'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Scissors } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

type ClipWithVideo = {
  id: string
  title: string
  start_ms: number
  end_ms: number
  aspect_ratio: string | null
  caption: string | null
  status: string
  created_at: string
  video_id: string
  videos: { title: string; source_url: string | null } | null
}

export default async function ClipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('clips')
    .select('*, videos(title, source_url)')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  let clips: ClipWithVideo[] = []
  let queryError = null

  try {
    const { data, error } = await query
    clips = (data ?? []) as ClipWithVideo[]
    queryError = error
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string }
    if (e?.message === 'fetch failed' || e?.name === 'TypeError') {
      return (
        <ErrorState
          title="Failed to connect to database"
          description="Could not reach the local Supabase server."
        />
      )
    }
    queryError = e
  }

  if (queryError) {
    return <ErrorState title="Failed to load clips" description={(queryError as { message?: string }).message ?? 'Unknown error'} />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Clip Browser</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {clips.length} clip{clips.length !== 1 ? 's' : ''} · review, approve, and queue for publishing
          </p>
        </div>
      </div>

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Review', value: 'review' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Archived', value: 'archived' },
            ],
          },
        ]}
      />

      {clips.length === 0 ? (
        <EmptyState
          title="No clips yet"
          description="Detect clips from a processed video to see them here."
          action={
            <Link
              href="/app/videos"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Scissors className="h-3.5 w-3.5" />
              Go to Videos
            </Link>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[88px]" />
                  <TableHead className="w-[28%]">Title</TableHead>
                  <TableHead>Source video</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Aspect</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clips.map((clip) => (
                  <TableRow key={clip.id}>
                    <TableCell className="py-2">
                      <VideoPreviewCell
                        videoId={clip.video_id}
                        title={clip.title}
                        sourceUrl={clip.videos?.source_url ?? null}
                        durationSeconds={Math.round((clip.end_ms - clip.start_ms) / 1000)}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900 line-clamp-1">{clip.title}</p>
                      {clip.caption && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{clip.caption}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {clip.video_id ? (
                        <Link
                          href={`/app/videos/${clip.video_id}`}
                          className="text-xs text-slate-600 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {clip.videos?.title ?? clip.video_id}
                        </Link>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {formatMs(clip.end_ms - clip.start_ms)}
                      <span className="text-slate-400 ml-1">
                        ({formatMs(clip.start_ms)}→{formatMs(clip.end_ms)})
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {clip.aspect_ratio ?? '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={clip.status as any} />
                    </TableCell>
                    <TableCell>
                      <ClipRowActions clipId={clip.id} videoId={clip.video_id} status={clip.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

