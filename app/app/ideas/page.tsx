import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { FilterBar } from '@/components/filter-bar'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Idea } from '@/lib/types'
import { NewIdeaDialog } from './new-idea-dialog'
import { RealtimeListener, RealtimeStatus } from '@/components/realtime-listener'
import { IdeasGenerateButton } from './ideas-generate-button'
import { getDictionary } from '@/lib/i18n/server'
import { IdeaRowActions } from './idea-row-actions'

export const dynamic = 'force-dynamic'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-slate-500 bg-slate-50 border-slate-200',
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const t = await getDictionary()
  const supabase = await createServerClient()

  let query = supabase
    .from('ideas')
    .select('*')
    .eq('workspace_id', WORKSPACE_ID)
    .order('updated_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.platform) query = query.eq('platform', params.platform)
  if (params.priority) query = query.eq('priority', params.priority)

  let ideas = null
  let queryError = null

  try {
    const { data, error } = await query
    ideas = data
    queryError = error
  } catch (err: any) {
    if (err.message === 'fetch failed' || err.name === 'TypeError') {
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
    return <ErrorState title="Failed to load ideas" description={queryError.message || 'Unknown error occurred'} />
  }

  return (
    <div className="space-y-5">
      <RealtimeListener tables={['ideas']} channelName="ideas-page" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.ideas.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {ideas?.length ?? 0} {t.ideas.title.toLowerCase()} in workspace
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RealtimeStatus channelName="ideas-page" label="Live" />
          <div className="flex items-center gap-2">
            <IdeasGenerateButton />
            <NewIdeaDialog>
              <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                <Plus className="h-3.5 w-3.5" />
                {t.ideas.newIdea}
              </Button>
            </NewIdeaDialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Review', value: 'review' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Published', value: 'published' },
              { label: 'Archived', value: 'archived' },
            ],
          },
          {
            key: 'priority',
            label: 'Priority',
            options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
          {
            key: 'platform',
            label: 'Platform',
            options: [
              { label: 'YouTube', value: 'youtube' },
              { label: 'TikTok', value: 'tiktok' },
              { label: 'Instagram', value: 'instagram' },
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'X / Twitter', value: 'twitter' },
            ],
          },
        ]}
      />

      {/* Table */}
      {!ideas || ideas.length === 0 ? (
        <EmptyState
          title="No ideas yet"
          description="Create your first idea or generate one from a prompt."
          action={
            <NewIdeaDialog>
              <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                <Plus className="h-3.5 w-3.5" />
                {t.ideas.newIdea}
              </Button>
            </NewIdeaDialog>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[35%]">Title</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ideas.map((idea: Idea) => (
                    <TableRow key={idea.id}>
                      <TableCell>
                        <Link
                          href={`/app/ideas/${idea.id}`}
                          className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {idea.title}
                        </Link>
                        {idea.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {idea.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.format ? (
                          <span className="text-xs text-slate-600 capitalize">{idea.format}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.platform ? (
                          <span className="text-xs text-slate-600 capitalize">{idea.platform}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.priority ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[idea.priority] ?? ''}`}
                          >
                            {idea.priority}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={idea.status} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">
                        {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <IdeaRowActions ideaId={idea.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
