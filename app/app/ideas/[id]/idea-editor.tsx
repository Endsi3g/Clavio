'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IdeaEditor as TiptapEditor } from '@/components/idea-editor'
import { toast } from 'sonner'
import type { Idea } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Sparkles, Search, BrainCircuit } from 'lucide-react'
import { ResearchDialog } from '@/components/research-dialog'

export function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState((idea as any).script || '')
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
              disabled
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              Expand script
            </Button>
          </div>
        </div>
      </div>

      <ResearchDialog 
        open={researchOpen} 
        onOpenChange={setResearchOpen}
        onComplete={(newContent) => {
          setContent((prev: string) => prev + `\n\n### Research Notes\n${newContent}`)
          toast.success('Research added to script')
        }}
      />
    </div>
  )
}
