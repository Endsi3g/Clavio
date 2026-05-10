import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Upload, MoreHorizontal, Image, Music, Film, File, Type, Layout } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Asset } from '@/lib/types'
import { InstagramCarousel } from '@/components/publishing/instagram-carousel'
import { AssetsUploadButton } from './assets-upload-button'
import { AssetRowActions } from './asset-row-actions'
import { getDictionary } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

const ASSET_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  logo: { label: 'Logo', icon: <Image className="h-4 w-4" />, color: 'bg-blue-50 text-blue-700' },
  font: { label: 'Font', icon: <Type className="h-4 w-4" />, color: 'bg-violet-50 text-violet-700' },
  music: { label: 'Music', icon: <Music className="h-4 w-4" />, color: 'bg-emerald-50 text-emerald-700' },
  'b-roll': { label: 'B-Roll', icon: <Film className="h-4 w-4" />, color: 'bg-amber-50 text-amber-700' },
  template: { label: 'Template', icon: <Layout className="h-4 w-4" />, color: 'bg-pink-50 text-pink-700' },
  thumbnail: { label: 'Thumbnail', icon: <Image className="h-4 w-4" />, color: 'bg-rose-50 text-rose-700' },
  other: { label: 'Other', icon: <File className="h-4 w-4" />, color: 'bg-slate-50 text-slate-700' },
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const t = await getDictionary()
  const params = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('assets')
    .select('*')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })

  if (params.type) query = query.eq('asset_type', params.type)

  const { data: assets, error } = await query

  if (error) {
    return <ErrorState title="Failed to load assets" description={error.message} />
  }

  const allAssets: Asset[] = assets ?? []

  // Group by type for count
  const typeGroups = allAssets.reduce<Record<string, number>>((acc, a) => {
    acc[a.asset_type] = (acc[a.asset_type] ?? 0) + 1
    return acc
  }, {})

  const assetTypes = Object.keys(ASSET_TYPE_CONFIG)
  const activeType = params.type ?? null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.assets.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {allAssets.length} asset{allAssets.length !== 1 ? 's' : ''} {t.dashboard.subtitle.split(' ').slice(-1)}
          </p>
        </div>
        <AssetsUploadButton />
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/app/assets"
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !activeType
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          All
          <span className="text-slate-400">{allAssets.length}</span>
        </a>
        {assetTypes.map((type) => {
          const config = ASSET_TYPE_CONFIG[type]
          const count = typeGroups[type] ?? 0
          if (count === 0 && !activeType) return null
          return (
            <a
              key={type}
              href={`/app/assets?type=${type}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeType === type
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {config.icon}
              {config.label}
              {count > 0 && <span className="text-slate-400">{count}</span>}
            </a>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          {allAssets.length === 0 ? (
            <EmptyState
              title="No assets yet"
              description="Upload logos, fonts, music, b-roll, and templates to reuse across your content."
              action={<AssetsUploadButton />}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {allAssets.map((asset) => {
                const config = ASSET_TYPE_CONFIG[asset.asset_type] ?? ASSET_TYPE_CONFIG.other
                return (
                  <Card key={asset.id} className="group overflow-hidden border-slate-200">
                    <CardContent className="p-0">
                      {/* Preview area */}
                      <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100">
                        {asset.mime_type?.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`rounded-full p-3 ${config.color}`}>{config.icon}</div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium text-slate-900 truncate leading-tight">
                            {asset.name}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button 
                                className="shrink-0 -mt-0.5 -mr-1 flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all"
                                aria-label="Asset options"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AssetRowActions assetId={asset.id} assetName={asset.name} assetUrl={asset.url} />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatBytes(asset.size_bytes)}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 font-mono">
                          {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar systems */}
        <div className="space-y-6">
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-900">
                <Layout className="h-4 w-4" />
                Brand Kit
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Primary Color</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500 border border-white shadow-sm" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">#3b82f6</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Secondary Color</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-900 border border-white shadow-sm" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">#0f172a</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs h-8 border-blue-200 text-blue-700 bg-white hover:bg-blue-50">
                Edit Brand Settings
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-semibold mb-4 text-center text-slate-400 uppercase tracking-wider">Preview Engine</h3>
            <InstagramCarousel images={[{ url: '', alt: '1' }, { url: '', alt: '2' }, { url: '', alt: '3' }]} />
            <p className="mt-4 text-[10px] text-center text-slate-500 italic">
              Dynamic preview using Remotion render engine
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

