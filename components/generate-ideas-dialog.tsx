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
import { toast } from 'sonner'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateIdeasDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [platform, setPlatform] = useState('')
  const [format, setFormat] = useState('')
  const [count, setCount] = useState('5')
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    if (!subject.trim()) {
      toast.error('Enter a subject for generation')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          platform: platform || undefined,
          format: format || undefined,
          count: parseInt(count, 10),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')

      const n = json.data?.length ?? 0
      toast.success(`${n} idea${n !== 1 ? 's' : ''} generated successfully`)
      onOpenChange(false)
      setSubject('')
      setPlatform('')
      setFormat('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !generating && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Generate ideas with AI
          </DialogTitle>
          <DialogDescription>
            Ollama will generate content ideas based on your subject.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="gen-subject">Subject / Topic *</Label>
            <Input
              id="gen-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Personal finance for beginners"
              disabled={generating}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform} disabled={generating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat} disabled={generating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="short">Short video</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="listicle">Listicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Number of ideas</Label>
            <Select value={count} onValueChange={setCount} disabled={generating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ideas</SelectItem>
                <SelectItem value="5">5 ideas</SelectItem>
                <SelectItem value="8">8 ideas</SelectItem>
                <SelectItem value="10">10 ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!subject.trim() || generating}
              className="bg-blue-500 hover:bg-blue-600 gap-1.5"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate {count} ideas
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
