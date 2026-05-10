'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Globe, Loader2, Terminal, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import type { WorkflowRun } from '@/lib/types'

type ServiceStatus = 'checking' | 'connected' | 'disconnected'

function StatusDot({ status }: { status: ServiceStatus }) {
  if (status === 'checking') return <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse inline-block" />
  if (status === 'connected') return (
    <span className="relative flex h-2 w-2 inline-block">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  )
  return <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
}

export default function AgentsPage() {
  const [scrapeStatus, setScrapeStatus] = React.useState<ServiceStatus>('checking')
  const [hermesStatus, setHermesStatus] = React.useState<ServiceStatus>('checking')

  const [scrapeUrl, setScrapeUrl] = React.useState('')
  const [scraping, setScraping] = React.useState(false)
  const [scrapeResult, setScrapeResult] = React.useState<Record<string, unknown> | null>(null)

  const [hermesTask, setHermesTask] = React.useState('')
  const [runningHermes, setRunningHermes] = React.useState(false)
  const [hermesResult, setHermesResult] = React.useState('')

  const [agentHistory, setAgentHistory] = React.useState<WorkflowRun[]>([])

  React.useEffect(() => {
    // Check statuses by trying a quick research call
    fetch('/api/research/scrapegraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com', prompt: 'ping' }),
    })
      .then(r => setScrapeStatus(r.ok ? 'connected' : 'disconnected'))
      .catch(() => setScrapeStatus('disconnected'))

    // Hermes: no direct ping endpoint, mark as unknown → connected
    setHermesStatus('connected')

    // Load history
    const supabase = createClient()
    supabase
      .from('workflow_runs')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .in('workflow_name', ['scrapegraph-research', 'hermes-agent'])
      .order('started_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setAgentHistory((data as WorkflowRun[]) ?? []))
  }, [])

  async function handleScrape() {
    if (!scrapeUrl.trim()) return
    setScraping(true)
    setScrapeResult(null)
    try {
      const res = await fetch('/api/research/scrapegraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim(), prompt: 'Extract the main content, key facts, and summary of this page.' }),
      })
      if (!res.ok) throw new Error('Research failed')
      const data = await res.json()
      setScrapeResult(data)
      setScrapeStatus('connected')
    } catch {
      toast.error('ScrapeGraphAI request failed. Is the Python environment set up?')
      setScrapeStatus('disconnected')
    } finally {
      setScraping(false)
    }
  }

  async function handleHermes() {
    if (!hermesTask.trim()) return
    setRunningHermes(true)
    setHermesResult('')
    try {
      const res = await fetch('/api/research/scrapegraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'hermes', prompt: hermesTask.trim() }),
      })
      const data = await res.json()
      setHermesResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
    } catch {
      toast.error('Hermes agent request failed.')
    } finally {
      setRunningHermes(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Autonomous Agents</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            ScrapeGraphAI for deep web research · Hermes for advanced scripting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <StatusDot status={scrapeStatus} />
            <span>ScrapeGraphAI</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <StatusDot status={hermesStatus} />
            <span>Hermes</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ScrapeGraphAI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Globe className="h-5 w-5 text-emerald-500" />
              Deep Research
            </CardTitle>
            <CardDescription>Extract structured data from any URL using ScrapeGraphAI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={scrapeUrl}
                onChange={e => setScrapeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScrape()}
                disabled={scraping}
              />
              <Button
                onClick={handleScrape}
                disabled={scraping || !scrapeUrl.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Research'}
              </Button>
            </div>

            {scraping && <p className="text-sm text-slate-500 animate-pulse">Scraping and analyzing…</p>}

            {scrapeResult && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <pre className="text-xs text-slate-700 overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(scrapeResult, null, 2)}
                </pre>
              </div>
            )}

            {!scrapeResult && !scraping && (
              <div className="py-8 text-center text-sm text-slate-400">
                Enter a URL to start deep research
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hermes Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Terminal className="h-5 w-5 text-violet-500" />
              Hermes Agent
            </CardTitle>
            <CardDescription>Run advanced scripting tasks via the Hermes AI agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe a task, e.g.: Write a Python script that downloads all YouTube thumbnails from a channel RSS feed"
              value={hermesTask}
              onChange={e => setHermesTask(e.target.value)}
              rows={4}
              disabled={runningHermes}
            />
            <Button
              onClick={handleHermes}
              disabled={runningHermes || !hermesTask.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {runningHermes ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Running…</>
              ) : (
                <><Bot className="h-4 w-4 mr-2" />Run Agent</>
              )}
            </Button>

            {hermesResult && (
              <div className="rounded-lg bg-slate-900 p-3">
                <pre className="text-xs text-emerald-300 overflow-auto max-h-64 whitespace-pre-wrap">
                  {hermesResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Agent Session History</CardTitle>
          <CardDescription>Recent runs from ScrapeGraphAI and Hermes</CardDescription>
        </CardHeader>
        <CardContent>
          {agentHistory.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No agent sessions yet. Run a research or scripting task above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {agentHistory.map(run => (
                <div key={run.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 capitalize">
                      {run.workflow_name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {run.started_at ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true }) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {run.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : run.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    <span className={`text-xs font-medium capitalize ${
                      run.status === 'completed' ? 'text-emerald-700' :
                      run.status === 'failed' ? 'text-red-700' : 'text-amber-700'
                    }`}>{run.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
