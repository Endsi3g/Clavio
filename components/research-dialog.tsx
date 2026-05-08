'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Search, Loader2, Sparkles } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (content: string) => void
}

export function ResearchDialog({ open, onOpenChange, onComplete }: Props) {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('Extract the key technical specs and main marketing angles from this product page.')
  const [loading, setLoading] = useState(false)

  async function handleResearch() {
    if (!url || !prompt) return
    setLoading(true)

    try {
      const res = await fetch('/api/research/scrapegraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Research failed')
      }

      const { result } = await res.json()
      
      // Convert result to readable string
      const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      
      toast.success('Research completed')
      onComplete(content)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Research (ScrapeGraph)
          </DialogTitle>
          <DialogDescription>
            Enter a URL and what you want to extract. Our AI will browse the site and summarize it for your script.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Target URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Extraction Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should I find?"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleResearch} disabled={!url || loading} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  Start Research
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
