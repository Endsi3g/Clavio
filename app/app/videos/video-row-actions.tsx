'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { MoreHorizontal, ExternalLink, Mic, Scissors, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteVideo } from '@/app/actions/videos'

interface Props {
  videoId: string
  videoTitle: string
  hasTranscript: boolean
}

export function VideoRowActions({ videoId, videoTitle, hasTranscript }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  async function handleDelete() {
    setBusy(true)
    const result = await deleteVideo(videoId)
    setBusy(false)
    if (result.success) {
      toast.success(`"${videoTitle}" deleted`)
    } else {
      toast.error(result.error ?? 'Delete failed')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={busy}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="More options"
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
              runAction('/api/videos/clipify', 'Clip detection')
            }}
          >
            <Scissors className="mr-2 h-3.5 w-3.5" />
            Detect clips
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{videoTitle}"</strong> along with all its
              transcripts, clips, and render jobs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
