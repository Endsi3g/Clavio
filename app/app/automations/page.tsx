import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Settings, Play, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { checkIntegrationStatus } from '@/lib/integrations-check'
import { WorkflowSetupDialog } from './workflow-setup-dialog'

export const dynamic = 'force-dynamic'

const N8N_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'

export default async function AutomationsPage() {
  const supabase = await createServerClient()

  const [{ data: workflowRuns }, n8nStatus] = await Promise.all([
    supabase
      .from('workflow_runs')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('started_at', { ascending: false })
      .limit(20),
    checkIntegrationStatus('n8n'),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Automations</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage your AI workflows and publishing sequences via n8n.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <a href={N8N_URL} target="_blank" rel="noreferrer">
              Open n8n Studio
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Engine Status
            </CardTitle>
            <CardDescription>Connection to local n8n instance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-medium text-slate-900">n8n Node</p>
                <p className="text-sm text-slate-500 font-mono">{N8N_URL}</p>
              </div>
              {n8nStatus === 'connected' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Starter Workflows</CardTitle>
            <CardDescription>Templates ready to be imported into n8n</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Auto-publish to Instagram</p>
                <p className="text-xs text-slate-500">Triggers when a post is marked scheduled.</p>
              </div>
              <WorkflowSetupDialog workflowId="auto-publish-instagram" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Idea AI Enrichment</p>
                <p className="text-xs text-slate-500">Uses Ollama to expand short ideas.</p>
              </div>
              <WorkflowSetupDialog workflowId="idea-ai-enrichment" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Workflow Runs</CardTitle>
          <CardDescription>History of automations triggered by Clavio</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!workflowRuns || workflowRuns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">
                No recent runs found. Trigger a workflow to see logs here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Workflow</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium text-slate-900 capitalize">
                      {run.workflow_name.replace(/-/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {run.status === 'completed' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : run.status === 'failed' ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span className={`text-xs font-medium capitalize ${
                          run.status === 'completed' ? 'text-emerald-700' :
                          run.status === 'failed' ? 'text-red-700' :
                          'text-amber-700'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {run.entity_type ? (
                        <span className="capitalize">{run.entity_type}</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {run.finished_at && run.started_at
                        ? `${Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {run.started_at ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true }) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

