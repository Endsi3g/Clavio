import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Cpu,
  Mic,
  Film,
  Globe,
  Webhook,
  Plus,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { Integration } from '@/lib/types'
import { checkIntegrationStatus } from '@/lib/integrations-check'

export const dynamic = 'force-dynamic'

const PROVIDER_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; description: string }
> = {
  supabase: {
    label: 'Supabase',
    icon: <Database className="h-5 w-5" />,
    description: 'Postgres database and file storage',
  },
  ollama: {
    label: 'Ollama',
    icon: <Cpu className="h-5 w-5" />,
    description: 'Local AI model serving',
  },
  whisper: {
    label: 'Whisper',
    icon: <Mic className="h-5 w-5" />,
    description: 'Local speech-to-text transcription',
  },
  remotion: {
    label: 'Remotion',
    icon: <Film className="h-5 w-5" />,
    description: 'Programmatic video rendering',
  },
  n8n: {
    label: 'n8n',
    icon: <Webhook className="h-5 w-5" />,
    description: 'Self-hosted workflow automation',
  },
  youtube: {
    label: 'YouTube',
    icon: <Globe className="h-5 w-5" />,
    description: 'YouTube publishing and analytics',
  },
  tiktok: {
    label: 'TikTok',
    icon: <Globe className="h-5 w-5" />,
    description: 'TikTok publishing',
  },
  instagram: {
    label: 'Instagram',
    icon: <Globe className="h-5 w-5" />,
    description: 'Instagram and Reels publishing',
  },
  scrapegraph: {
    label: 'ScrapeGraphAI',
    icon: <Database className="h-5 w-5" />,
    description: 'Autonomous LLM-based web scraping',
  },
  hermes: {
    label: 'Hermes Agent',
    icon: <Cpu className="h-5 w-5" />,
    description: 'Advanced multi-step reasoning agent',
  },
  cobalt: {
    label: 'Cobalt',
    icon: <Globe className="h-5 w-5" />,
    description: 'Local video downloader service',
  },
}

function StatusIndicator({ status }: { status: Integration['status'] }) {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-emerald-600">Connected</span>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="text-xs font-medium text-red-600">Error</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <span className="text-xs font-medium text-slate-500">Disconnected</span>
    </div>
  )
}

export default async function IntegrationsPage() {
  const supabase = await createServerClient()

  let integrations = null
  let queryError = null

  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('provider')
    
    integrations = data
    queryError = error
  } catch (err: any) {
    if (err?.message === 'fetch failed' || err?.name === 'TypeError') {
      return (
        <ErrorState
          title="Failed to connect to database"
          description="Could not reach the local Supabase server. Please ensure you have run 'npx supabase start' or 'supabase start' in your terminal."
        />
      )
    }
    queryError = err
  }

  if (queryError) {
    return <ErrorState title="Failed to load integrations" description={queryError.message || 'Unknown error'} />
  }

  const allIntegrations: Integration[] = integrations ?? []
  
  // Auto-detect status for local services
  for (const integration of allIntegrations) {
    if (['ollama', 'whisper', 'n8n', 'cobalt'].includes(integration.provider.toLowerCase())) {
      integration.status = await checkIntegrationStatus(integration.provider)
    }
  }

  const connected = allIntegrations.filter((i) => i.status === 'connected').length

  // Build a complete list: configured + available to add
  const configuredProviders = new Set(allIntegrations.map((i) => i.provider))
  const allProviders = Object.keys(PROVIDER_CONFIG)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Integrations</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {connected} connected · {allIntegrations.length} configured
          </p>
        </div>
      </div>

      {/* Configured integrations */}
      {allIntegrations.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Configured
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allIntegrations.map((integration) => {
              const config = PROVIDER_CONFIG[integration.provider]
              return (
                <Card key={integration.id} className="relative">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                          {config?.icon ?? <Globe className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {config?.label ?? integration.provider}
                          </p>
                          <StatusIndicator status={integration.status} />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Configure
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {config?.description ?? integration.provider}
                    </p>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Last updated</span>
                      <span className="font-mono text-slate-400">
                        {formatDistanceToNow(new Date(integration.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available to configure */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Available
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allProviders
            .filter((p) => !configuredProviders.has(p))
            .map((provider) => {
              const config = PROVIDER_CONFIG[provider]
              return (
                <Card key={provider} className="border-dashed bg-slate-50/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400">
                          {config.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">{config.label}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-slate-200" />
                            <span className="text-xs text-slate-400">Not configured</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                        <a href={`/api/auth/callback/${provider}`}>
                          <Plus className="h-3 w-3" />
                          Add
                        </a>
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{config.description}</p>
                  </CardContent>
                </Card>
              )
            })}
        </div>
        {allProviders.filter((p) => !configuredProviders.has(p)).length === 0 && (
          <p className="text-sm text-slate-400 italic">All providers are configured.</p>
        )}
      </div>
    </div>
  )
}
