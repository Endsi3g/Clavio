import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Upload, MoreHorizontal, ExternalLink, Mic, Scissors, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import type { Video } from '@/lib/types'
import { RealtimeListener, RealtimeStatus } from '@/components/realtime-listener'
import { ImportVideoDialog } from '@/components/import-video-dialog'

export const dynamic = 'force-dynamic'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function VideosPage() {
  const supabase = await createServerClient()

  const [videosResult, clipsCountResult] = await Promise.all([
    supabase
      .from('videos')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false }),
    supabase
      .from('clips')
      .select('video_id')
      .eq('workspace_id', WORKSPACE_ID),
  ])

  if (videosResult.error) {
    return <ErrorState title="Failed to load videos" description={videosResult.error.message} />
  }

  const videos: Video[] = videosResult.data ?? []
  const clips = clipsCountResult.data ?? []
  const clipsPerVideo = clips.reduce<Record<string, number>>((acc, c) => {
    acc[c.video_id] = (acc[c.video_id] ?? 0) + 1
    return acc
  }, {})

  const processingCount = videos.filter(
    (v) => v.processing_status === 'processing' || v.transcription_status === 'processing'
  ).length

  return (
    <div className="space-y-5">
      <RealtimeListener tables={['videos']} channelName="videos-page" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Videos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
            {processingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                · {processingCount} processing
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RealtimeStatus channelName="videos-page" label="Live" />
          <div className="flex items-center gap-2">
            <ImportVideoDialog>
              <Button size="sm" variant="outline" className="gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Import from URL
              </Button>
            </ImportVideoDialog>
            <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
              <Upload className="h-3.5 w-3.5" />
              Upload video
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          description="Upload a source file to begin the video processing pipeline."
          action={
            <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
              <Upload className="h-3.5 w-3.5" />
              Upload video
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Transcription</TableHead>
                  <TableHead>Processing</TableHead>
                  <TableHead>Clips</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <Link
                        href={`/app/videos/${video.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {video.title}
                      </Link>
                      {video.source_url && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate font-mono">
                          {video.source_url}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {formatDuration(video.duration_seconds)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-slate-400" />
                        <StatusBadge status={video.transcription_status} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={video.processing_status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Scissors className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          {clipsPerVideo[video.id] ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={video.status} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">
                      {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/videos/${video.id}`}>
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Transcribe</DropdownMenuItem>
                          <DropdownMenuItem>Detect clips</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
