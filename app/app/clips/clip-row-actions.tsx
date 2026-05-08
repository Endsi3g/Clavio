'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Check, X, Send, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { approveClip, rejectClip, sendClipToPublish } from '@/app/actions/clips'
import { toast } from 'sonner'

export function ClipRowActions({
  clipId,
  videoId,
  status,
}: {
  clipId: string
  videoId: string
  status: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors"
          aria-label="Clip options"
        >
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/videos/${videoId}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            View in video
          </Link>
        </DropdownMenuItem>
        {status !== 'archived' && status !== 'review' && (
          <DropdownMenuItem
            onSelect={async () => {
              await approveClip(clipId)
              toast.success('Clip approved')
            }}
          >
            <Check className="mr-2 h-3.5 w-3.5 text-emerald-500" />
            Approve
          </DropdownMenuItem>
        )}
        {status !== 'archived' && (
          <DropdownMenuItem
            onSelect={async () => {
              await sendClipToPublish(clipId, videoId)
              toast.success('Draft post created from clip')
            }}
          >
            <Send className="mr-2 h-3.5 w-3.5 text-blue-500" />
            Send to publish queue
          </DropdownMenuItem>
        )}
        {status !== 'archived' && (
          <DropdownMenuItem
            className="text-red-600"
            onSelect={async () => {
              await rejectClip(clipId)
              toast.info('Clip rejected')
            }}
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Reject
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
