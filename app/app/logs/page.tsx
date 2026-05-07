import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import type { Log } from '@/lib/types'

export const dynamic = 'force-dynamic'

const SEVERITY_CONFIG: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  error: { label: 'Error', dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
  warning: { label: 'Warning', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  info: { label: 'Info', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' },
  debug: { label: 'Debug', dot: 'bg-slate-300', text: 'text-slate-500', bg: 'bg-slate-50' },
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('logs')
    .select('*')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(200)

  if (params.severity) query = query.eq('severity', params.severity)
  if (params.source) query = query.eq('source', params.source)
  if (params.entity_type) query = query.eq('entity_type', params.entity_type)

  const { data: logs, error } = await query

  if (error) {
    return <ErrorState title="Failed to load logs" description={error.message} />
  }

  const allLogs: Log[] = logs ?? []

  // Count by severity
  const severityCounts = allLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.severity] = (acc[l.severity] ?? 0) + 1
    return acc
  }, {})

  const activeSeverity = params.severity ?? null
  const activeSource = params.source ?? null

  // Unique sources
  const sources = [...new Set(allLogs.map((l) => l.source))].sort()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Logs</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {allLogs.length} entr{allLogs.length !== 1 ? 'ies' : 'y'} · operational audit trail
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Severity filters */}
        <a
          href="/app/logs"
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !activeSeverity
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          All severities
        </a>
        {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => {
          const count = severityCounts[sev] ?? 0
          return (
            <a
              key={sev}
              href={`/app/logs?severity=${sev}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeSeverity === sev
                  ? `border-blue-300 ${cfg.bg} ${cfg.text}`
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              {count > 0 && <span className="text-slate-400">{count}</span>}
            </a>
          )
        })}
      </div>

      {/* Log stream */}
      {allLogs.length === 0 ? (
        <EmptyState
          title="No logs"
          description="System events, workflow steps, and errors will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {allLogs.map((log) => {
                const cfg = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.debug
                return (
                  <li
                    key={log.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Severity dot */}
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-800 leading-snug">{log.message}</p>
                        <time className="shrink-0 text-xs font-mono text-slate-400">
                          {format(new Date(log.created_at), 'HH:mm:ss')}
                        </time>
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium font-mono ${cfg.text}`}>
                          {log.severity}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono">{log.source}</span>
                        {log.entity_type && (
                          <>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-400 capitalize">
                              {log.entity_type}
                              {log.entity_id && (
                                <span className="ml-1 font-mono text-[10px]">
                                  #{log.entity_id.slice(0, 8)}
                                </span>
                              )}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-slate-400">·</span>
                        <time className="text-xs text-slate-400 font-mono">
                          {format(new Date(log.created_at), 'MMM d, yyyy')}
                        </time>
                      </div>
                    </div>
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
