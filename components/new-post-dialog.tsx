'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Send } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewPostDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!title) return
    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          platform, 
          caption,
          status: 'draft'
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to create post')
      }

      toast.success('Post created as draft')
      onOpenChange(false)
      setTitle('')
      setCaption('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>
            Create a new post draft. You can link media later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monday Motivation"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title || loading} className="bg-blue-500 hover:bg-blue-600 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {loading ? 'Creating…' : 'Create post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
