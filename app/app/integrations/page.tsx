import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

import { BrandIcon, BrandType } from '@/components/brand-icon'

const PLATFORMS = [
  { id: 'youtube' as BrandType, name: 'YouTube', description: 'Publish videos, Shorts, and manage your channel.', icon: <BrandIcon brand="youtube" />, cardCls: 'border-red-200 bg-red-50', iconBg: 'bg-red-500', docsUrl: 'https://developers.google.com/youtube/v3' },
  { id: 'instagram' as BrandType, name: 'Instagram', description: 'Post Reels, carousels, and stories via the Graph API.', icon: <BrandIcon brand="instagram" />, cardCls: 'border-pink-200 bg-pink-50', iconBg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600', docsUrl: 'https://developers.facebook.com/docs/instagram-api' },
  { id: 'tiktok' as BrandType, name: 'TikTok', description: 'Publish videos to your TikTok creator account.', icon: <BrandIcon brand="tiktok" />, cardCls: 'border-slate-200 bg-slate-50', iconBg: 'bg-slate-900', docsUrl: 'https://developers.tiktok.com' },
  { id: 'linkedin' as BrandType, name: 'LinkedIn', description: 'Share posts and articles with your professional network.', icon: <BrandIcon brand="linkedin" />, cardCls: 'border-blue-200 bg-blue-50', iconBg: 'bg-blue-700', docsUrl: 'https://developer.linkedin.com' },
  { id: 'twitter' as BrandType, name: 'Twitter / X', description: 'Post tweets and threads, upload media.', icon: <BrandIcon brand="twitter" />, cardCls: 'border-sky-200 bg-sky-50', iconBg: 'bg-black', docsUrl: 'https://developer.twitter.com' },
]

const LOCAL_SERVICES = [
  { name: 'Supabase', url: 'http://127.0.0.1:54321', label: 'Database + Auth' },
  { name: 'Ollama', url: 'http://localhost:11434', label: 'LLM (idea generation)' },
  { name: 'Whisper', url: 'http://localhost:9000', label: 'Speech-to-text' },
  { name: 'n8n', url: 'http://localhost:5678', label: 'Workflow automation' },
]

async function checkLocalService(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return res.ok || res.status < 500
  } catch {
    return false
  }
}

import { getDictionary } from '@/lib/i18n/server'

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const t = await getDictionary()
  const params = await searchParams
  const connectedProvider = params.connected
  const errorMsg = params.error

  const supabase = await createServerClient()
  const { data: integrations } = await supabase
    .from('integrations')
    .select('provider, status, platform_user_id, token_expires_at')
    .eq('workspace_id', WORKSPACE_ID)

  const integrationMap = Object.fromEntries((integrations ?? []).map((i: Record<string, unknown>) => [i.provider, i]))

  const localStatuses = await Promise.all(
    LOCAL_SERVICES.map(async (svc) => ({ ...svc, online: await checkLocalService(svc.url) }))
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.integrations.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{t.integrations.subtitle}</p>
      </div>

      {connectedProvider && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <strong className="capitalize">{connectedProvider}</strong> {t.integrations.connected.toLowerCase()}.
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          {t.common.failed}: {decodeURIComponent(errorMsg)}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.integrations.social}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const integration = integrationMap[platform.id] as Record<string, unknown> | undefined
            const connected = integration?.status === 'connected'
            const expired = integration?.token_expires_at
              ? new Date(integration.token_expires_at as string) < new Date()
              : false

            return (
              <Card key={platform.id} className={`border ${platform.cardCls}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold ${platform.iconBg}`}>
                      {platform.icon}
                    </div>
                    {connected ? (
                      <Badge className={expired ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
                        {expired ? t.integrations.tokenExpired : t.integrations.connected}
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200">{t.integrations.notConnected}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold mt-3">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-500">{platform.description}</p>
                  {connected && !!integration?.platform_user_id && (
                    <p className="text-xs text-slate-400 font-mono">ID: {String(integration.platform_user_id)}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    {connected ? (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link href={`/api/oauth/${platform.id}`}>{t.common.reconnect}</Link>
                        </Button>
                        <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1">
                          {t.common.docs} <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    ) : (
                      <Button size="sm" className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white" asChild>
                        <Link href={`/api/oauth/${platform.id}`}>{t.common.connect}</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.integrations.local}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {localStatuses.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{svc.name}</p>
                <p className="text-xs text-slate-400">{svc.label} · <span className="font-mono text-[11px]">{svc.url}</span></p>
              </div>
              {svc.online ? (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Online</span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><AlertCircle className="h-3.5 w-3.5" /> Offline</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
