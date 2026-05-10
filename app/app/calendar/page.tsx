import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import type { Post } from '@/lib/types'
import { ErrorState } from '@/components/shared/error-state'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarClient } from './calendar-client'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500',
  tiktok: 'bg-slate-900',
  instagram: 'bg-pink-500',
  linkedin: 'bg-blue-600',
  twitter: 'bg-sky-500',
  x: 'bg-sky-500',
}

function parseMonth(monthParam: string | undefined): { year: number; month: number } {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split('-').map(Number)
    if (year >= 2020 && year <= 2100 && month >= 1 && month <= 12) {
      return { year, month }
    }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function buildCalendarGrid(year: number, month: number, posts: Post[]): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstOfMonth = new Date(year, month - 1, 1)
  const lastOfMonth = new Date(year, month, 0)

  const startDay = new Date(firstOfMonth)
  const dayOfWeek = startDay.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDay.setDate(startDay.getDate() + diffToMonday)

  const endDay = new Date(lastOfMonth)
  const endDayOfWeek = endDay.getDay()
  const diffToSunday = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
  endDay.setDate(endDay.getDate() + diffToSunday)

  const postsByDate = new Map<string, Post[]>()
  for (const post of posts) {
    const dateStr = (post.scheduled_for ?? post.published_at)?.slice(0, 10)
    if (!dateStr) continue
    if (!postsByDate.has(dateStr)) postsByDate.set(dateStr, [])
    postsByDate.get(dateStr)!.push(post)
  }

  const grid: CalendarDay[] = []
  const cursor = new Date(startDay)

  while (cursor <= endDay) {
    const dateStr = format(cursor, 'yyyy-MM-dd')
    const normalizedCursor = new Date(cursor)
    normalizedCursor.setHours(0, 0, 0, 0)
    const isToday = normalizedCursor.getTime() === today.getTime()
    const isCurrentMonth = cursor.getMonth() === month - 1 && cursor.getFullYear() === year

    grid.push({
      date: new Date(cursor),
      isCurrentMonth,
      isToday,
      posts: postsByDate.get(dateStr) ?? [],
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return grid
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function adjacentMonth(year: number, month: number, delta: -1 | 1): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { year, month } = parseMonth(params.month)

  const rangeStart = `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`
  const lastDay = new Date(year, month, 0).getDate()
  const rangeEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`

  const supabase = await createServerClient()

  let posts: Post[] = []
  let fetchError: string | null = null

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .in('status', ['scheduled', 'published'])
      .or(`scheduled_for.gte.${rangeStart},scheduled_for.lte.${rangeEnd},published_at.gte.${rangeStart},published_at.lte.${rangeEnd}`)
      .order('scheduled_for', { ascending: true, nullsFirst: false })

    if (error) fetchError = error.message
    else posts = data ?? []
  } catch (err) {
    const e = err as { message?: string; name?: string }
    if (e?.message === 'fetch failed' || e?.name === 'TypeError') {
      return (
        <ErrorState
          title="Failed to connect to database"
          description="Could not reach the local Supabase server."
        />
      )
    }
    fetchError = e?.message ?? 'Unknown error'
  }

  if (fetchError) {
    return <ErrorState title="Failed to load calendar" description={fetchError} />
  }

  const calendarDays = buildCalendarGrid(year, month, posts)
  const prevMonth = adjacentMonth(year, month, -1)
  const nextMonth = adjacentMonth(year, month, 1)
  const todayParam = formatMonthParam(new Date().getFullYear(), new Date().getMonth() + 1)
  const prevParam = formatMonthParam(prevMonth.year, prevMonth.month)
  const nextParam = formatMonthParam(nextMonth.year, nextMonth.month)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-slate-400" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Content Calendar</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {posts.length} post{posts.length !== 1 ? 's' : ''} this month · Drag scheduled posts to reschedule
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/app/calendar?month=${todayParam}`}>
            <Button variant="outline" size="sm" className="text-xs h-8">Today</Button>
          </Link>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
            <Link href={`/app/calendar?month=${prevParam}`}>
              <button className="flex items-center justify-center h-8 w-8 text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-200">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </Link>
            <span className="px-4 text-sm font-medium text-slate-700 min-w-[140px] text-center">
              {getMonthLabel(year, month)}
            </span>
            <Link href={`/app/calendar?month=${nextParam}`}>
              <button className="flex items-center justify-center h-8 w-8 text-slate-500 hover:bg-slate-50 transition-colors border-l border-slate-200">
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <CalendarClient initialDays={calendarDays} />

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="font-medium">Platforms:</span>
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <span key={platform} className="flex items-center gap-1 capitalize">
            <span className={cn('h-2 w-2 rounded-full', color)} />
            {platform}
          </span>
        ))}
      </div>
    </div>
  )
}

