import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { MarkAllReadButton } from './mark-all-read-button'

export const dynamic = 'force-dynamic'

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; badge: string }> = {
  info: {
    icon: <Info className="h-4 w-4 text-blue-500" />,
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    badge: 'bg-red-50 text-red-700 border-red-100',
  },
}

export default async function NotificationsPage() {
  const supabase = await createServerClient()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-2">
        <BellOff className="h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">Failed to load notifications.</p>
      </div>
    )
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton workspaceId={WORKSPACE_ID} />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Bell className="h-10 w-10 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-700">No notifications yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Events like publishes, failures, and approvals will appear here.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCheck className="h-4 w-4" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-6 py-4 transition-colors ${
                      !n.is_read ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900 leading-snug">
                          {n.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${cfg.badge}`}
                        >
                          {n.type}
                        </Badge>
                        {!n.is_read && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <time className="shrink-0 text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </time>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
