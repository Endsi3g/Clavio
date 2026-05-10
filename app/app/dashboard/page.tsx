import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { ErrorState } from '@/components/shared/error-state'
import { getDictionary } from '@/lib/i18n/server'
import { RealtimeListener, RealtimeStatus } from '@/components/providers/realtime-listener'
import {
  Lightbulb,
  Video,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  ChevronRight,
  Play,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  Heart,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export const dynamic = 'force-dynamic'

function dateLabel(dateStr: string | null, t: any) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d)) return t.common.today
  if (isYesterday(d)) return t.common.yesterday
  return format(d, 'MMM d')
}

function ActionIcon({ type }: { type: string }) {
  const base = 'flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0'
  if (type === 'idea') return <div className={`${base} bg-amber-50`}><Lightbulb className="h-4 w-4 text-amber-500" /></div>
  if (type === 'video') return <div className={`${base} bg-blue-50`}><Video className="h-4 w-4 text-blue-500" /></div>
  if (type === 'post') return <div className={`${base} bg-green-50`}><Send className="h-4 w-4 text-green-500" /></div>
  if (type === 'error') return <div className={`${base} bg-red-50`}><AlertCircle className="h-4 w-4 text-red-500" /></div>
  if (type === 'workflow') return <div className={`${base} bg-purple-50`}><Zap className="h-4 w-4 text-purple-500" /></div>
  return <div className={`${base} bg-slate-50`}><Clock className="h-4 w-4 text-slate-400" /></div>
}

function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    youtube: 'bg-red-500',
    tiktok: 'bg-slate-900',
    instagram: 'bg-pink-500',
    linkedin: 'bg-blue-600',
    twitter: 'bg-sky-400',
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[platform] ?? 'bg-slate-300'}`} />
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const t = await getDictionary()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ideas: any[] = [], videos: any[] = [], posts: any[] = [], workflows: any[] = [], logs: any[] = [], metrics: any[] = []

  try {
    const [ir, vr, pr, wr, lr, mr] = await Promise.all([
      supabase.from('ideas').select('id,title,status,created_at').eq('workspace_id', WORKSPACE_ID).order('created_at', { ascending: false }).limit(5),
      supabase.from('videos').select('id,title,status,processing_status,created_at').eq('workspace_id', WORKSPACE_ID).order('created_at', { ascending: false }).limit(5),
      supabase.from('posts').select('id,title,platform,status,scheduled_for,published_at').eq('workspace_id', WORKSPACE_ID).order('scheduled_for', { ascending: true }).limit(10),
      supabase.from('workflow_runs').select('id,workflow_name,status,entity_type,started_at,error_message').eq('workspace_id', WORKSPACE_ID).order('started_at', { ascending: false }).limit(8),
      supabase.from('logs').select('id,severity,source,message,created_at').eq('workspace_id', WORKSPACE_ID).order('created_at', { ascending: false }).limit(6),
      supabase.from('post_metrics').select('views,likes,saves,shares').eq('workspace_id', WORKSPACE_ID),
    ])
    ideas = ir.data ?? []
    videos = vr.data ?? []
    posts = pr.data ?? []
    workflows = wr.data ?? []
    logs = lr.data ?? []
    metrics = mr.data ?? []
  } catch (err: any) {
    if (err?.message === 'fetch failed' || err?.name === 'TypeError') {
      return (
        <ErrorState
          title={t.errorStates.dbConnection.title}
          description={t.errorStates.dbConnection.description}
        />
      )
    }
    throw err
  }

  // Build action items list
  type ActionItem = { type: string; title: string; description: string; date: string | null; href: string }
  const actionItems: ActionItem[] = []

  const draftIdeas = ideas.filter(i => i.status === 'draft')
  draftIdeas.forEach(i => actionItems.push({ type: 'idea', title: `${t.ideas.reviewIdea}: "${i.title}"`, description: i.description || t.ideas.subtitle, date: i.created_at, href: `/app/ideas/${i.id}` }))

  const processingVideos = videos.filter(v => v.processing_status === 'processing' || v.status === 'processing')
  processingVideos.forEach(v => actionItems.push({ type: 'video', title: `${t.common.processing}: "${v.title}"`, description: t.videos.processing, date: v.created_at, href: `/app/videos/${v.id}` }))

  const failedWorkflows = workflows.filter(w => w.status === 'failed')
  failedWorkflows.forEach(w => actionItems.push({ type: 'error', title: `${t.common.failed}: ${w.workflow_name}`, description: w.error_message ?? t.errorStates.loadFailed.description, date: w.started_at, href: '/app/automations' }))

  const failedPosts = posts.filter(p => p.status === 'failed')
  failedPosts.forEach(p => actionItems.push({ type: 'error', title: `${t.common.failed}: "${p.title}"`, description: `${t.common.platform}: ${p.platform}`, date: p.scheduled_for, href: `/app/publishing/${p.id}` }))

  if (actionItems.length === 0) {
    actionItems.push({ type: 'workflow', title: t.dashboard.allCaughtUp, description: t.dashboard.allCaughtUpDesc, date: null, href: '/app/dashboard' })
  }

  // Upcoming posts
  const upcomingPosts = posts.filter(p => p.status === 'scheduled' && p.scheduled_for)

  // Platform stats
  const platformCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.platform] = (acc[p.platform] ?? 0) + 1
    return acc
  }, {})

  const totalViews = metrics.reduce((s, m) => s + (m.views ?? 0), 0)
  const totalLikes = metrics.reduce((s, m) => s + (m.likes ?? 0), 0)

  const statusCounts = {
    draft: ideas.filter(i => i.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
    processing: videos.filter(v => v.processing_status === 'processing').length,
    failed: failedWorkflows.length + failedPosts.length,
  }

  // Recent activity (logs)
  const recentActivity = logs.slice(0, 5)

  return (
    <div className="flex gap-6 min-h-full">
      {/* Realtime subscriptions — transparent component, no UI */}
      <RealtimeListener
        tables={['ideas', 'videos', 'posts', 'workflow_runs', 'logs']}
        channelName="dashboard"
      />

      {/* Main content — 2/3 */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t.dashboard.greeting}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {t.dashboard.subtitle}
            </p>
          </div>
          <RealtimeStatus channelName="dashboard" label={t.common.live} />
        </div>

        {/* Things to do */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t.dashboard.thingsToDo}
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {actionItems.map((item, i) => (
              <Link key={i} href={item.href} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <ActionIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                  {item.date ? dateLabel(item.date, t) : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming scheduled posts */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t.dashboard.upcomingPosts}
            </h2>
            <Link href="/app/publishing" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t.common.viewAll} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingPosts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 text-center py-8 italic">
                  {t.dashboard.noPosts}
                </p>
              </div>
            ) : (
              upcomingPosts.slice(0, 4).map(post => (
                <Link key={post.id} href={`/app/publishing/${post.id}`} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase leading-none">
                      {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM') : '—'}
                    </span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {post.scheduled_for ? format(new Date(post.scheduled_for), 'd') : '—'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <PlatformDot platform={post.platform} />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {post.title}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 capitalize">
                      {post.platform} · {post.scheduled_for ? format(new Date(post.scheduled_for), 'EEE, MMM d · HH:mm') : ''}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
                    {t.publishing.tabs.scheduled}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t.dashboard.recentActivity}
            </h2>
            <Link href="/app/logs" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t.common.viewAll} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-slate-500 text-center py-8 italic">
                  {t.dashboard.noActivity}
                </p>
              </div>
            ) : (
              recentActivity.map(log => (
                <div key={log.id} className="flex items-start gap-3.5 px-5 py-3.5">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    log.severity === 'error' ? 'bg-red-400' :
                    log.severity === 'warning' ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">{log.message}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">{log.source}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel — 1/3 */}
      <div className="w-72 shrink-0 space-y-4">
        {/* Status overview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.dashboard.workspaceStatus}</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: t.dashboard.draftIdeas, value: statusCounts.draft, color: 'bg-amber-400', href: '/app/ideas' },
              { label: t.dashboard.publishedPosts, value: statusCounts.published, color: 'bg-emerald-400', href: '/app/publishing' },
              { label: t.dashboard.processingVideos, value: statusCounts.processing, color: 'bg-blue-400', href: '/app/videos' },
              { label: t.dashboard.failedItems, value: statusCounts.failed, color: 'bg-red-400', href: '/app/logs' },
            ].map(stat => (
              <Link key={stat.label} href={stat.href} className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${stat.color}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{stat.value}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.dashboard.performance}</h2>
            <Link href="/app/analytics" className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t.common.viewAll} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 px-3.5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.dashboard.totalViews}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{totalViews.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 px-3.5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/40">
                <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.dashboard.totalLikes}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.dashboard.byPlatform}</h2>
            <Link href="/app/analytics" className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t.common.viewAll} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.keys(platformCounts).length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.common.noData}</p>
              </div>
            ) : (
              Object.entries(platformCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <PlatformDot platform={platform} />
                      <span className="text-xs text-slate-700 dark:text-slate-300 capitalize">{platform}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.dashboard.quickActions}</h2>
          </div>
          <div className="p-3 space-y-1">
            {[
              { label: t.dashboard.newIdea, href: '/app/ideas', icon: Lightbulb },
              { label: t.dashboard.uploadVideo, href: '/app/videos', icon: Play },
              { label: t.dashboard.newPostDraft, href: '/app/publishing', icon: FileText },
              { label: t.dashboard.viewAnalytics, href: '/app/analytics', icon: TrendingUp },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

