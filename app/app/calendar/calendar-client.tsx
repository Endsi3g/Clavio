'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { reschedulePost } from '@/app/actions/calendar'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import { format } from 'date-fns'

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500',
  tiktok: 'bg-slate-900',
  instagram: 'bg-pink-500',
  linkedin: 'bg-blue-600',
  twitter: 'bg-sky-500',
  x: 'bg-sky-500',
}

function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] ?? 'bg-slate-400'
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

function DraggablePostChip({ post }: { post: Post }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id })
  const colorClass = getPlatformColor(post.platform)
  const displayTitle = post.title.length > 20 ? post.title.slice(0, 20) + '…' : post.title

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-100 cursor-grab active:cursor-grabbing select-none transition-opacity',
        isDragging && 'opacity-0'
      )}
      title={post.title}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colorClass)} aria-hidden />
      <span className="truncate">{displayTitle}</span>
    </div>
  )
}

function StaticPostChip({ post }: { post: Post }) {
  const colorClass = getPlatformColor(post.platform)
  const displayTitle = post.title.length > 20 ? post.title.slice(0, 20) + '…' : post.title
  return (
    <Link
      href={`/app/publishing/${post.id}`}
      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colorClass)} aria-hidden />
      <span className="truncate">{displayTitle}</span>
    </Link>
  )
}

function DroppableDayCell({
  day,
  posts,
  activeId,
}: {
  day: CalendarDay
  posts: Post[]
  activeId: string | null
}) {
  const dateStr = format(day.date, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })
  const MAX_VISIBLE = 3
  const visible = posts.slice(0, MAX_VISIBLE)
  const overflow = posts.length - MAX_VISIBLE

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[100px] p-2 flex flex-col gap-1 border-b border-r border-slate-100 transition-colors',
        !day.isCurrentMonth && 'bg-slate-50/60',
        isOver && 'bg-blue-50 ring-1 ring-inset ring-blue-200'
      )}
    >
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium leading-none self-start',
          day.isToday
            ? 'bg-blue-500 text-white font-semibold'
            : day.isCurrentMonth
            ? 'text-slate-700'
            : 'text-slate-300'
        )}
      >
        {day.date.getDate()}
      </span>

      <div className="flex flex-col gap-0.5 min-w-0">
        {visible.map((post) =>
          post.status === 'scheduled' ? (
            <DraggablePostChip key={post.id} post={post} />
          ) : (
            <StaticPostChip key={post.id} post={post} />
          )
        )}
        {overflow > 0 && (
          <span className="text-[10px] text-slate-400 pl-1">+{overflow} more</span>
        )}
      </div>
    </div>
  )
}

export function CalendarClient({ initialDays }: { initialDays: CalendarDay[] }) {
  const [days, setDays] = useState(initialDays)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const activePost = activeId
    ? days.flatMap((d) => d.posts).find((p) => p.id === activeId)
    : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over || active.id === over.id) return

      const postId = active.id as string
      const newDateStr = over.id as string // format: yyyy-MM-dd

      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDateStr)) return

      // Optimistically update UI
      setDays((prev) => {
        const post = prev.flatMap((d) => d.posts).find((p) => p.id === postId)
        if (!post) return prev

        const newScheduledFor = `${newDateStr}T12:00:00.000Z`

        return prev.map((day) => {
          const dayStr = format(day.date, 'yyyy-MM-dd')
          const oldPosts = day.posts.filter((p) => p.id !== postId)
          if (dayStr === newDateStr) {
            return { ...day, posts: [...oldPosts, { ...post, scheduled_for: newScheduledFor }] }
          }
          return { ...day, posts: oldPosts }
        })
      })

      setRescheduling(true)
      const result = await reschedulePost(postId, `${newDateStr}T12:00:00.000Z`)
      setRescheduling(false)

      if (!result.success) {
        // Revert on failure
        setDays(initialDays)
      }
    },
    [initialDays]
  )

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-3">
      {rescheduling && (
        <p className="text-xs text-blue-600 animate-pulse">Saving changes…</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide border-r last:border-r-0 border-slate-100"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => (
              <DroppableDayCell
                key={day.date.toISOString()}
                day={day}
                posts={day.posts}
                activeId={activeId}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activePost && (
            <div className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-slate-700 bg-white border border-slate-200 shadow-lg cursor-grabbing">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', getPlatformColor(activePost.platform))} />
              <span>{activePost.title.slice(0, 25)}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
