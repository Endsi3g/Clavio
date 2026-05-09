'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import type { Post } from '@/lib/types'
import { updatePostStatus } from '@/app/actions/posts'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { GripVertical, ExternalLink } from 'lucide-react'

type Status = 'draft' | 'scheduled' | 'published' | 'failed'

const COLUMNS: { id: Status; label: string; color: string; header: string }[] = [
  { id: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-600', header: 'bg-slate-50 border-slate-200' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700', header: 'bg-blue-50 border-blue-200' },
  { id: 'published', label: 'Published', color: 'bg-emerald-100 text-emerald-700', header: 'bg-emerald-50 border-emerald-200' },
  { id: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700', header: 'bg-red-50 border-red-200' },
]

function PostCard({ post, isDragging = false }: { post: Post; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-white p-3 shadow-sm space-y-2 transition-shadow ${
        isDragging ? 'opacity-0' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
            {post.title || 'Untitled post'}
          </p>
          {post.platform && (
            <p className="text-[11px] text-slate-400 capitalize mt-0.5">{post.platform}</p>
          )}
        </div>
        <Link
          href={`/app/publishing/${post.id}`}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      {post.scheduled_for && (
        <p className="text-[11px] text-slate-400 font-mono pl-6">
          {formatDistanceToNow(new Date(post.scheduled_for), { addSuffix: true })}
        </p>
      )}
    </div>
  )
}

function DraggedCard({ post }: { post: Post }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-xl space-y-2 w-64 rotate-2 opacity-95">
      <p className="text-sm font-medium text-slate-900 line-clamp-2">
        {post.title || 'Untitled post'}
      </p>
      {post.platform && (
        <p className="text-[11px] text-slate-400 capitalize">{post.platform}</p>
      )}
    </div>
  )
}

function KanbanColumn({
  column,
  posts,
}: {
  column: (typeof COLUMNS)[0]
  posts: Post[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col min-w-0">
      <div className={`rounded-t-lg border px-3 py-2 flex items-center gap-2 ${column.header}`}>
        <span className="text-xs font-semibold text-slate-700">{column.label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${column.color}`}>
          {posts.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border border-t-0 p-2 space-y-2 min-h-[120px] transition-colors ${
          isOver ? 'bg-blue-50/60' : 'bg-slate-50'
        }`}
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-slate-400">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}

export function PublishingKanban({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const postsByStatus = useCallback(
    (status: Status) => posts.filter((p) => p.status === status),
    [posts]
  )

  const activePost = activeId ? posts.find((p) => p.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const postId = active.id as string
    const newStatus = over.id as Status

    const prevPosts = posts
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
    )

    const result = await updatePostStatus(postId, newStatus)
    if (!result.success) {
      setPosts(prevPosts)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} posts={postsByStatus(col.id)} />
        ))}
      </div>

      <DragOverlay>
        {activePost && <DraggedCard post={activePost} />}
      </DragOverlay>
    </DndContext>
  )
}
