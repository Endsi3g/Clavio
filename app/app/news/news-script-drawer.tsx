'use client'

import * as React from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const FORMATS = [
  { id: 'short', label: 'Short (TikTok / Reel)', duration: '30–60s' },
  { id: 'medium', label: 'Medium (YouTube Short)', duration: '60–90s' },
  { id: 'long', label: 'Long (YouTube / Podcast)', duration: '5–10 min' },
]

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X']

interface Article {
  title: string
  description: string | null
  url: string
  source: { name: string }
}

export function NewsScriptDrawer({ article }: { article: Article }) {
  const [open, setOpen] = React.useState(false)
  const [format, setFormat] = React.useState('short')
  const [platform, setPlatform] = React.useState('TikTok')
  const [generating, setGenerating] = React.useState(false)
  const [result, setResult] = React.useState<{ title: string; description?: string } | null>(null)

  async function generateScript() {
    setGenerating(true)
    setResult(null)
    try {
      const subject = `${article.title}. ${article.description ?? ''}. Source: ${article.source.name}. Format: ${format} for ${platform}.`
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      const first = Array.isArray(data) ? data[0] : data
      setResult(first ?? null)
      if (!first) toast.error('No script generated. Check that Ollama is running.')
      else toast.success('Idea saved to your pipeline.')
    } catch {
      toast.error('Failed to generate script. Check that Ollama is running.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          Create Script
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Create Script from News</SheetTitle>
          <SheetDescription className="text-xs line-clamp-2">{article.title}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Format */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Format</p>
            <div className="grid gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm text-left transition-colors ${
                    format === f.id
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium">{f.label}</span>
                  <span className="text-xs text-slate-400">{f.duration}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Platform</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    platform === p
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateScript}
            disabled={generating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate & Save</>
            )}
          </Button>

          {result && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-1">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Saved to Ideas</p>
              <p className="text-sm font-medium text-slate-900">{result.title}</p>
              {result.description && (
                <p className="text-xs text-slate-500">{result.description}</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
