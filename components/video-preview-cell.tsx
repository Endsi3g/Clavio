'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VideoPlayer } from '@/components/video-player'

interface Props {
  videoId: string
  title: string
  sourceUrl: string | null
  durationSeconds: number | null
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoPreviewCell({ videoId, title, sourceUrl, durationSeconds }: Props) {
  const [open, setOpen] = useState(false)

  if (!sourceUrl) {
    return (
      <div className="flex h-12 w-20 items-center justify-center rounded-md bg-slate-100 text-slate-300 text-xs">
        No file
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-900 focus:outline-none"
        title={`Preview: ${title}`}
      >
        <video
          src={sourceUrl}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          preload="metadata"
          muted
          playsInline
        />
        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow transition-transform group-hover:scale-110">
          <Play className="h-3.5 w-3.5 text-slate-800 translate-x-0.5" />
        </div>
        {durationSeconds && (
          <span className="absolute bottom-0.5 right-1 z-10 text-[9px] font-mono text-white/90">
            {formatDuration(durationSeconds)}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm font-medium truncate">{title}</DialogTitle>
          </DialogHeader>
          <VideoPlayer url={sourceUrl} />
        </DialogContent>
      </Dialog>
    </>
  )
}
