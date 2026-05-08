'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ExternalLink, Archive } from 'lucide-react'
import Link from 'next/link'
import { archiveIdea } from '@/app/actions/ideas'
import { toast } from 'sonner'

export function IdeaRowActions({ ideaId, status }: { ideaId: string; status: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/ideas/${ideaId}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open
          </Link>
        </DropdownMenuItem>
        {status !== 'archived' && (
          <DropdownMenuItem
            className="text-slate-600"
            onSelect={async () => {
              await archiveIdea(ideaId)
              toast.success('Idea archived')
            }}
          >
            <Archive className="mr-2 h-3.5 w-3.5" />
            Archive
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
