import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Mic,
  Scissors,
  Film,
  RotateCcw,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import type { Video, Transcript, Clip, RenderJob } from '@/lib/types'
import { VideoActions } from '@/components/video-actions'
import { RenderClipButton } from '@/components/render-clip-button'
import { VideoPlayer } from '@/components/video-player'

export const dynamic = 'force-dynamic'

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const [videoResult, transcriptResult, clipsResult, renderResult] = await Promise.all([
    supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .single(),
    supabase
      .from('transcripts')
      .select('*')
      .eq('video_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('clips')
      .select('*')
      .eq('video_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('start_ms', { ascending: true }),
    supabase
      .from('render_jobs')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .in(
        'clip_id',
        (await supabase.from('clips').select('id').eq('video_id', id)).data?.map((c) => c.id) ?? []
      )
      .order('started_at', { ascending: false }),
  ])

  if (!videoResult.data) notFound()

  const video: Video = videoResult.data
  const transcript: Transcript | null = transcriptResult.data
  const clips: Clip[] = clipsResult.data ?? []
  const renderJobs: RenderJob[] = renderResult.data ?? []

  // Get signed URL for playback
  let signedUrl = ''
  if (video.storage_path) {
    const { data: sData } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 3600)
    signedUrl = sData?.signedUrl ?? ''
  }

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/app/videos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Videos
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
              {video.title}
            </h1>
            {video.source_url && (
              <p className="mt-1 text-xs font-mono text-slate-400 truncate">{video.source_url}</p>
            )}
          </div>
          <VideoActions videoId={video.id} hasTranscript={!!transcript} />
        </div>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Processing</span>
          <StatusBadge status={video.processing_status} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Transcription</span>
          <StatusBadge status={video.transcription_status} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Status</span>
          <StatusBadge status={video.status} />
        </div>
        {video.duration_seconds && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s
          </div>
        )}
      </div>

      {/* Video Player Section */}
      {signedUrl && (
        <Card className="overflow-hidden border-none shadow-lg">
          <CardContent className="p-0">
            <VideoPlayer url={signedUrl} />
          </CardContent>
        </Card>
      )}

      {/* 2-col layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="transcript">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="clips">
                Clips{' '}
                {clips.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                    {clips.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="renders">
                Renders{' '}
                {renderJobs.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                    {renderJobs.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-4">
              {!transcript ? (
                <EmptyState
                  title="No transcript yet"
                  description="Run transcription to generate a transcript from this video."
                  action={
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Mic className="h-3.5 w-3.5" />
                      Transcribe
                    </Button>
                  }
                />
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Transcript
                      </CardTitle>
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {transcript.language}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto rounded bg-slate-50 p-4 font-mono text-xs">
                      {transcript.content}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="clips" className="mt-4">
              {clips.length === 0 ? (
                <EmptyState
                  title="No clips detected"
                  description="Run clip detection after transcription to generate clip candidates."
                  action={
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Scissors className="h-3.5 w-3.5" />
                      Detect clips
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {clips.map((clip) => (
                    <Card key={clip.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {clip.title}
                              </p>
                              {clip.aspect_ratio && (
                                <span className="text-xs font-mono text-slate-400">
                                  {clip.aspect_ratio}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">
                              {formatDuration(clip.start_ms)} → {formatDuration(clip.end_ms)}{' '}
                              <span className="text-slate-400">
                                ({formatDuration(clip.end_ms - clip.start_ms)})
                              </span>
                            </p>
                            {clip.caption && (
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                                {clip.caption}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={clip.status} />
                            <RenderClipButton clipId={clip.id} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="renders" className="mt-4">
              {renderJobs.length === 0 ? (
                <EmptyState
                  title="No render jobs"
                  description="Approve a clip and render it to see jobs here."
                />
              ) : (
                <div className="space-y-3">
                  {renderJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900 font-mono">
                              {job.composition_name ?? job.engine}
                            </span>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>
                        {job.status === 'processing' && (
                          <Progress value={45} className="h-1.5" />
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
                            className="text-xs text-blue-500 hover:text-blue-700 font-mono truncate block"
                          >
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
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Video details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Duration</span>
                <span className="font-mono text-slate-700">
                  {video.duration_seconds
                    ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, '0')}`
                    : '—'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Clips</span>
                <span className="font-mono text-slate-700">{clips.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Render jobs</span>
                <span className="font-mono text-slate-700">{renderJobs.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Created</span>
                <span className="font-mono text-slate-400">
                  {format(new Date(video.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Updated</span>
                <span className="font-mono text-slate-400">
                  {formatDistanceToNow(new Date(video.updated_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {video.storage_path && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-mono text-slate-500 break-all">{video.storage_path}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
