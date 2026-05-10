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
import { Link as LinkIcon, Mic, Scissors, Upload } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Video } from '@/lib/types'
import { RealtimeListener, RealtimeStatus } from '@/components/realtime-listener'
import { ImportVideoDialog } from '@/components/import-video-dialog'
import { VideosUploadButton } from './videos-upload-button'
import { VideoRowActions } from './video-row-actions'
import { VideoPreviewCell } from '@/components/video-preview-cell'
import { getDictionary } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function VideosPage() {
  const supabase = await createServerClient()
  const t = await getDictionary()

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
    return <ErrorState title={t.errorStates.loadFailed.title} description={videosResult.error.message} />
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.videos.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {videos.length} {t.videos.title.toLowerCase()}
            {processingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                · {processingCount} {t.videos.processing}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RealtimeStatus channelName="videos-page" label={t.common.live} />
          <div className="flex items-center gap-2">
            <ImportVideoDialog>
              <Button size="sm" variant="outline" className="gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                {t.videos.importUrl}
              </Button>
            </ImportVideoDialog>
            <VideosUploadButton />
          </div>
        </div>
      </div>

      {/* Table */}
      {videos.length === 0 ? (
        <EmptyState
          title={t.emptyStates.noVideos.title}
          description={t.emptyStates.noVideos.description}
          action={<VideosUploadButton />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[88px]" />
                  <TableHead className="w-[28%]">{t.common.title}</TableHead>
                  <TableHead>{t.common.duration}</TableHead>
                  <TableHead>{t.common.transcription}</TableHead>
                  <TableHead>{t.common.processing}</TableHead>
                  <TableHead>{t.common.clips}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.common.created}</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="py-2">
                      <VideoPreviewCell
                        videoId={video.id}
                        title={video.title}
                        sourceUrl={video.source_url}
                        durationSeconds={video.duration_seconds}
                      />
                    </TableCell>
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
                      <VideoRowActions
                        videoId={video.id}
                        videoTitle={video.title}
                        hasTranscript={false}
                      />
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
