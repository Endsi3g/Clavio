'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { MoreHorizontal, ExternalLink, Mic, Scissors } from 'lucide-react'
import Link from 'next/link'

interface Props {
  videoId: string
  videoTitle: string
  hasTranscript: boolean
}

export function VideoRowActions({ videoId, videoTitle, hasTranscript }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function runAction(endpoint: string, label: string) {
    setBusy(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `${label} failed`)
      toast.success(`${label} started for "${videoTitle}"`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={busy}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/videos/${videoId}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction('/api/videos/transcribe', 'Transcription')}>
          <Mic className="mr-2 h-3.5 w-3.5" />
          Transcribe
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (!hasTranscript) {
              toast.error('Run transcription first')
              return
            }
            runAction('/api/videos/clip', 'Clip detection')
          }}
        >
          <Scissors className="mr-2 h-3.5 w-3.5" />
          Detect clips
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
