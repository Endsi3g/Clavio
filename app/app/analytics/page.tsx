import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { MetricCard } from '@/components/metric-card'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Heart, Bookmark, Share2, TrendingUp, Clock } from 'lucide-react'
import { format, subDays, subMonths, startOfWeek, startOfMonth } from 'date-fns'
import Link from 'next/link'
import type { Post, PostMetrics } from '@/lib/types'
import { getDictionary } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

type Period = 'all' | 'week' | 'month'

type PostWithMetrics = Post & { latest_metrics?: PostMetrics | null }

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All Time',
  week: 'This Week',
  month: 'This Month',
}

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  if (period === 'week') return startOfWeek(now, { weekStartsOn: 1 })
  if (period === 'month') return startOfMonth(now)
  return null
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const period: Period = (['all', 'week', 'month'].includes(params.period ?? '') ? params.period : 'all') as Period
  const t = await getDictionary()
  const supabase = await createServerClient()

  let postsResult, metricsResult
  let queryError = null

  try {
    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    const periodStart = getPeriodStart(period)
    if (periodStart) {
      postsQuery = postsQuery.gte('published_at', periodStart.toISOString())
    }

    ;[postsResult, metricsResult] = await Promise.all([
      postsQuery,
      supabase
        .from('post_metrics')
        .select('*')
        .eq('workspace_id', WORKSPACE_ID)
        .order('collected_at', { ascending: false }),
    ])
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string }
    if (e?.message === 'fetch failed' || e?.name === 'TypeError') {
      return (
        <ErrorState
          title="Failed to connect to database"
          description="Could not reach the local Supabase server. Please ensure you have run 'npx supabase start' or 'supabase start' in your terminal."
        />
      )
    }
    queryError = e
  }

  if (queryError || postsResult?.error) {
    return (
      <ErrorState
        title="Failed to load analytics"
        description={postsResult?.error?.message ?? (queryError as { message?: string })?.message ?? 'Unknown error'}
      />
    )
  }

  const posts: Post[] = postsResult?.data ?? []
  const allMetrics: PostMetrics[] = metricsResult?.data ?? []

  const latestMetricsPerPost = allMetrics.reduce<Record<string, PostMetrics>>((acc, m) => {
    if (!acc[m.post_id]) acc[m.post_id] = m
    return acc
  }, {})

  const postsWithMetrics: PostWithMetrics[] = posts.map((p) => ({
    ...p,
    latest_metrics: latestMetricsPerPost[p.id] ?? null,
  }))

  const totalViews = allMetrics.reduce((s, m) => s + (m.views ?? 0), 0)
  const totalLikes = allMetrics.reduce((s, m) => s + (m.likes ?? 0), 0)
  const totalSaves = allMetrics.reduce((s, m) => s + (m.saves ?? 0), 0)
  const totalShares = allMetrics.reduce((s, m) => s + (m.shares ?? 0), 0)
  const avgRetention =
    allMetrics.length > 0
      ? allMetrics.reduce((s, m) => s + (m.retention_rate ?? 0), 0) / allMetrics.length
      : 0

  const platformStats = posts.reduce<Record<string, { posts: number; views: number }>>((acc, p) => {
    const m = latestMetricsPerPost[p.id]
    if (!acc[p.platform]) acc[p.platform] = { posts: 0, views: 0 }
    acc[p.platform].posts++
    acc[p.platform].views += m?.views ?? 0
    return acc
  }, {})

  const topPosts = [...postsWithMetrics]
    .sort((a, b) => (b.latest_metrics?.views ?? 0) - (a.latest_metrics?.views ?? 0))
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.analytics.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {posts.length} {t.publishing.tabs.published.toLowerCase()} posts · {allMetrics.length} snapshot{allMetrics.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Period tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Period">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/app/analytics?period=${p}`}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                period === p
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </nav>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total views" value={totalViews.toLocaleString()} icon={<Eye className="h-5 w-5" />} />
        <MetricCard label="Total likes" value={totalLikes.toLocaleString()} icon={<Heart className="h-5 w-5" />} />
        <MetricCard label="Total saves" value={totalSaves.toLocaleString()} icon={<Bookmark className="h-5 w-5" />} />
        <MetricCard label="Avg retention" value={`${Math.round(avgRetention * 100)}%`} icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* 2-col: platform + top posts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Platform breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{t.dashboard.byPlatform}</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(platformStats).length === 0 ? (
                <EmptyState title="No data" description="Publish posts to see platform breakdown." className="py-4" />
              ) : (
                <div className="space-y-3">
                  {Object.entries(platformStats)
                    .sort(([, a], [, b]) => b.views - a.views)
                    .map(([platform, stats]) => (
                      <div key={platform}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize font-medium text-slate-700">{platform}</span>
                          <span className="text-xs font-mono text-slate-500">{stats.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400 rounded-full"
                              style={{ width: totalViews > 0 ? `${(stats.views / totalViews) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{stats.posts}p</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <StatRow label="Published posts" value={posts.length} />
              <StatRow label="Total shares" value={totalShares.toLocaleString()} />
              <StatRow label="Total saves" value={totalSaves.toLocaleString()} />
              <StatRow label="Avg retention" value={`${Math.round(avgRetention * 100)}%`} />
            </CardContent>
          </Card>
        </div>

        {/* Top posts table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t.analytics.ranking}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topPosts.length === 0 ? (
                <EmptyState
                  title="No published posts"
                  description="Publish content to see analytics rankings."
                  className="py-10"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%]">Post</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Saves</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <Link
                            href={`/app/publishing/${post.id}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          {post.published_at && (
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {format(new Date(post.published_at), 'MMM d')}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-xs capitalize text-slate-600">{post.platform}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-700">
                          {(post.latest_metrics?.views ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-700">
                          {(post.latest_metrics?.likes ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-700">
                          {(post.latest_metrics?.saves ?? 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-semibold text-slate-900">{value}</span>
    </div>
  )
}
