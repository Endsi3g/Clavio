'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IdeaEditor as TiptapEditor } from '@/components/ideas/idea-editor'
import { toast } from 'sonner'
import type { Idea } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Sparkles, Search, BrainCircuit, Loader2 } from 'lucide-react'
import { ResearchDialog } from '@/components/shared/research-dialog'

export function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [expanding, setExpanding] = useState(false)
  const [content, setContent] = useState((idea as unknown as Record<string, unknown>).script as string ?? '')
  const [researchOpen, setResearchOpen] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: content }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Unknown error')
      toast.success('Script saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleExpand() {
    if (!content.trim() && !idea.description) {
      toast.error('Add some content or description before expanding')
      return
    }
    setExpanding(true)
    try {
      const res = await fetch('/api/ideas/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: idea.id,
          title: idea.title,
          description: idea.description,
          current_script: content,
          platform: idea.platform,
          format: idea.format,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Expansion failed')

      const expanded = json.data?.script ?? json.data?.hook ?? ''
      if (!expanded) throw new Error('No script returned from AI')

      setContent((prev) => prev ? `${prev}\n\n---\n\n${expanded}` : expanded)
      toast.success('Script expanded by AI')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Expansion failed')
    } finally {
      setExpanding(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6">
      <div className="space-y-4">
        <TiptapEditor
          content={content}
          onChange={setContent}
          onSave={handleSave}
          saving={saving}
        />
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium">Scripting Mode</p>
          <p className="mt-0.5 opacity-80">
            This content is stored as the master script for this idea.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-blue-500" />
            AI Actions
          </h3>
          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 text-slate-700"
              onClick={() => setResearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5 text-blue-500" />
              AI Research
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 text-slate-700"
              onClick={handleExpand}
              disabled={expanding}
            >
              {expanding ? (
                <Loader2 className="h-3.5 w-3.5 text-purple-500 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              )}
              {expanding ? 'Expanding…' : 'Expand script'}
            </Button>
          </div>
        </div>
      </div>

      <ResearchDialog
        open={researchOpen}
        onOpenChange={setResearchOpen}
        onComplete={(newContent) => {
          setContent((prev) => prev + `\n\n### Research Notes\n${newContent}`)
          toast.success('Research added to script')
        }}
      />
    </div>
  )
}
