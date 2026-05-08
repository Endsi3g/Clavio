'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, ExternalLink, Calendar, Archive, Send } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import type { Post } from '@/lib/types'
import { archivePost, publishPostNow } from '@/app/actions/posts'
import { BulkScheduleDialog } from './bulk-schedule-dialog'
import { toast } from 'sonner'

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-50 text-red-700 border-red-200',
  tiktok: 'bg-slate-900 text-white border-slate-700',
  instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  linkedin: 'bg-blue-50 text-blue-700 border-blue-200',
  twitter: 'bg-sky-50 text-sky-700 border-sky-200',
}

export function PostTableClient({ items }: { items: Post[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing here"
        description="Posts in this state will appear here."
        className="py-12"
      />
    )
  }

  const allSelected = selected.size === items.length
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)))
  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
          <span className="text-xs font-medium text-blue-700">{selected.size} selected</span>
          <BulkScheduleDialog postIds={Array.from(selected)} onDone={() => setSelected(new Set())} />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-slate-600"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
            </TableHead>
            <TableHead className="w-[35%]">Title</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Scheduled for</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((post) => (
            <TableRow key={post.id} data-state={selected.has(post.id) ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={selected.has(post.id)}
                  onCheckedChange={() => toggle(post.id)}
                  aria-label={`Select ${post.title}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/app/publishing/${post.id}`}
                  className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
                {post.caption && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{post.caption}</p>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                    PLATFORM_COLORS[post.platform] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {post.platform}
                </span>
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-500">
                {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d, HH:mm') : '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={post.status} />
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-400">
                {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors"
                      aria-label="Post options"
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/app/publishing/${post.id}`}>
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={async () => {
                        await publishPostNow(post.id)
                        toast.success('Post queued for publishing')
                      }}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      Publish now
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={async () => {
                        await archivePost(post.id)
                        toast.success('Post archived')
                      }}
                    >
                      <Archive className="mr-2 h-3.5 w-3.5" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
