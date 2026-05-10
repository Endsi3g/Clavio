'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ImportVideoDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const res = await fetch('/api/videos/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import video')
      }

      toast.success('Video imported successfully!')
      setOpen(false)
      setUrl('')
      // RealtimeListener will handle the refresh, but we can push to the new video if we want
      // router.push(`/app/videos/${data.video.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleImport}>
          <DialogHeader>
            <DialogTitle>Import from Social Media</DialogTitle>
            <DialogDescription>
              Paste a URL from YouTube, TikTok, Instagram, or X (Twitter) to download the video directly into your workspace using Cobalt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Video URL</Label>
              <Input
                id="url"
                placeholder="https://www.tiktok.com/@user/video/123..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !url} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Import Video
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
