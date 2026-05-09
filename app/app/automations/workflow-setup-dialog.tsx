'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink } from 'lucide-react'

interface WorkflowSetupDialogProps {
  workflowId: 'auto-publish-instagram' | 'idea-ai-enrichment'
}

const WORKFLOW_DOCS: Record<
  WorkflowSetupDialogProps['workflowId'],
  {
    title: string
    description: string
    steps: string[]
    webhookPath: string
    n8nTemplate: string
  }
> = {
  'auto-publish-instagram': {
    title: 'Auto-publish to Instagram',
    description:
      'Triggers automatically when a post is marked as scheduled in Clavio and publishes it to Instagram via the Graph API.',
    steps: [
      'Open your n8n instance and create a new workflow',
      'Add a Webhook node — set method to POST, path to /clavio/publish-instagram',
      'Add an HTTP Request node that calls POST https://graph.facebook.com/v19.0/{ig_user_id}/media with your caption and media URL',
      'Add a second HTTP Request node to POST /media/publish with the container ID',
      'Set CLAVIO_WEBHOOK_SECRET in your n8n environment and match it in Clavio Settings → Integrations',
      'Activate the workflow — Clavio will POST to your webhook on every scheduled Instagram post',
    ],
    webhookPath: '/clavio/publish-instagram',
    n8nTemplate: 'https://n8n.io/workflows/',
  },
  'idea-ai-enrichment': {
    title: 'Idea AI Enrichment',
    description:
      'Uses Ollama (local LLM) to automatically expand short idea titles into full briefs, hooks, and script outlines.',
    steps: [
      'Open your n8n instance and create a new workflow',
      'Add a Webhook node — set method to POST, path to /clavio/enrich-idea',
      'Add an HTTP Request node that calls POST http://localhost:11434/api/generate with the idea title as the prompt',
      'Parse the streamed Ollama response and extract the generated text',
      'Add a final HTTP Request node to PATCH /api/ideas/{id} with the expanded description',
      'Set CLAVIO_WEBHOOK_SECRET in your n8n environment and activate the workflow',
    ],
    webhookPath: '/clavio/enrich-idea',
    n8nTemplate: 'https://n8n.io/workflows/',
  },
}

export function WorkflowSetupDialog({ workflowId }: WorkflowSetupDialogProps) {
  const [open, setOpen] = useState(false)
  const doc = WORKFLOW_DOCS[workflowId]

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => setOpen(true)}
      >
        View Setup
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{doc.title}</DialogTitle>
            <DialogDescription>{doc.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Webhook path:</span>
              <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-800">
                {doc.webhookPath}
              </code>
            </div>

            <ol className="space-y-2.5">
              {doc.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                <a href="http://localhost:5678" target="_blank" rel="noreferrer">
                  Open n8n
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <p className="text-xs text-slate-400">
                Set <code className="font-mono bg-slate-100 px-1 rounded">N8N_BASE_URL</code> in your
                .env to change the n8n URL.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
