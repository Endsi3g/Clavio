import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
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
import { InstagramCarousel } from '@/components/instagram-carousel'

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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assets</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {allAssets.length} asset{allAssets.length !== 1 ? 's' : ''} in workspace
          </p>
        </div>
        <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
          <Upload className="h-3.5 w-3.5" />
          Upload asset
        </Button>
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
      {allAssets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <EmptyState
            title="No assets yet"
            description="Upload logos, fonts, music, b-roll, and templates to reuse across your content."
            action={
              <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                <Upload className="h-3.5 w-3.5" />
                Upload asset
              </Button>
            }
          />
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-semibold mb-4 text-center">Instagram Carousel Demo</h3>
            <InstagramCarousel images={[{ url: '', alt: '1' }, { url: '', alt: '2' }, { url: '', alt: '3' }]} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {allAssets.map((asset) => {
            const config = ASSET_TYPE_CONFIG[asset.asset_type] ?? ASSET_TYPE_CONFIG.other
            return (
              <Card key={asset.id} className="group overflow-hidden">
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
                          <button className="shrink-0 -mt-0.5 -mr-1 flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all">
                            <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={asset.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Copy URL</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
  )
}
