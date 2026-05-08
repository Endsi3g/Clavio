'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Loader2 } from 'lucide-react'
import { bulkSchedulePosts } from '@/app/actions/posts'
import { toast } from 'sonner'

export function BulkScheduleDialog({
  postIds,
  onDone,
}: {
  postIds: string[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [scheduledFor, setScheduledFor] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSchedule() {
    if (!scheduledFor) return
    setLoading(true)
    const res = await bulkSchedulePosts(postIds, new Date(scheduledFor).toISOString())
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`${postIds.length} posts scheduled`)
      setOpen(false)
      onDone()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Schedule {postIds.length} posts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Bulk schedule posts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-500">
            Set a publish date and time for all {postIds.length} selected posts.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="scheduled-at" className="text-xs">
              Scheduled for
            </Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!scheduledFor || loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
