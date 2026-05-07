'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { Idea } from '@/lib/types'
import { Save } from 'lucide-react'

export function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description ?? '')
  const [prompt, setPrompt] = useState(idea.prompt ?? '')

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || null, prompt: prompt || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Unknown error')
      toast.success('Saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="idea-title">Title</Label>
          <Input
            id="idea-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="idea-description">Description</Label>
          <Textarea
            id="idea-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What is this idea about?"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="idea-prompt">AI Prompt / Angle</Label>
          <Textarea
            id="idea-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Angle, hook, or prompt for generation…"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-1.5 bg-blue-500 hover:bg-blue-600"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
