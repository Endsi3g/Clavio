'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { format, isSameDay } from 'date-fns'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Props {
  posts: Post[]
}

export function PublishCalendar({ posts }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const scheduledPosts = posts.filter(p => p.scheduled_for)
  const postsOnSelectedDay = scheduledPosts.filter(p => 
    selectedDate && isSameDay(new Date(p.scheduled_for!), selectedDate)
  )

  const modifiers = {
    hasPost: (date: Date) => scheduledPosts.some(p => isSameDay(new Date(p.scheduled_for!), date))
  }

  const modifiersStyles = {
    hasPost: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: '#3b82f6'
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <CalendarIcon className="h-3.5 w-3.5" />
        Calendar view
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Content Calendar</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="border rounded-xl p-2 bg-slate-50/50">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>

              {postsOnSelectedDay.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No posts scheduled for this day.</p>
              ) : (
                <div className="space-y-2">
                  {postsOnSelectedDay.map(post => (
                    <Link
                      key={post.id}
                      href={`/app/publishing/${post.id}`}
                      className="block p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {format(new Date(post.scheduled_for!), 'HH:mm')}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">
                          {post.platform}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{post.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
