import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Settings, Play, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Note: n8n local instance URL from .env.local
const N8N_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'

export default async function AutomationsPage() {
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Connected
              </div>
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
              <Button size="sm" variant="outline" className="h-7 text-xs">View Setup</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Idea AI Enrichment</p>
                <p className="text-xs text-slate-500">Uses Ollama to expand short ideas.</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">View Setup</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Runs (Placeholder for Realtime) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Workflow Runs</CardTitle>
          <CardDescription>History of automations triggered by Clavio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
              No recent runs found. Trigger a workflow to see logs here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
