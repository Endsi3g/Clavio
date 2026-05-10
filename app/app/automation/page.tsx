import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Webhook, ExternalLink, CheckCircle2, XCircle, Clock, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { checkIntegrationStatus } from '@/lib/integrations-check'
import { WebhookCopyButton } from './webhook-copy-button'
import type { WorkflowRun, Log } from '@/lib/types'

export const dynamic = 'force-dynamic'

const N8N_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function AutomationBridgePage() {
  const supabase = await createServerClient()

  const [n8nStatus, { data: workflowRuns }, { data: logs }] = await Promise.all([
    checkIntegrationStatus('n8n'),
    supabase
      .from('workflow_runs')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('started_at', { ascending: false })
      .limit(20),
    supabase
      .from('logs')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('source', 'n8n')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const runs = (workflowRuns ?? []) as WorkflowRun[]
  const webhookUrl = `${APP_URL}/api/webhooks/n8n`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Automation Bridge</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            n8n webhooks — status-triggered publishing and workflow automation.
          </p>
        </div>
        <Button asChild className="gap-1.5 bg-orange-500 hover:bg-orange-600">
          <a href={N8N_URL} target="_blank" rel="noreferrer">
            Open n8n
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Webhook className="h-5 w-5 text-orange-500" />
              Bridge Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-medium text-slate-900">n8n Instance</p>
                <p className="text-sm text-slate-500 font-mono">{N8N_URL}</p>
              </div>
              {n8nStatus === 'connected' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400" />
                  Offline
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Inbound Webhook URL</CardTitle>
            <CardDescription>Configure this URL in n8n as the callback destination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg">
              <code className="flex-1 text-xs text-emerald-300 font-mono truncate">{webhookUrl}</code>
              <WebhookCopyButton url={webhookUrl} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              n8n sends POST callbacks to this URL when workflows complete. Clavio updates post status and logs accordingly.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Workflow Runs</CardTitle>
          <CardDescription>All automation runs triggered from Clavio</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {runs.length === 0 ? (
            <div className="py-16 text-center">
              <Webhook className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No workflow runs yet.</p>
              <p className="text-xs text-slate-400 mt-1">Publish a post or trigger a workflow to see activity here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {runs.map(run => (
                <div key={run.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 capitalize truncate">
                      {run.workflow_name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {run.entity_type ? <span className="capitalize">{run.entity_type}</span> : '—'}
                      {run.started_at && ` · ${formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-4">
                    {run.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {run.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    {!['completed', 'failed'].includes(run.status) && <Clock className="h-4 w-4 text-amber-500" />}
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

      {/* n8n Webhook Logs */}
      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Inbound Webhook Logs</CardTitle>
            <CardDescription>Callbacks received from n8n</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(logs as Log[]).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 text-sm">
                  <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
                    log.severity === 'error' ? 'bg-red-100 text-red-700' :
                    log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{log.severity}</span>
                  <span className="text-slate-700 flex-1 min-w-0 break-words">{log.message}</span>
                  <span className="shrink-0 text-xs text-slate-400 font-mono">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
