import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { FilterBar } from '@/components/shared/filter-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Idea } from '@/lib/types'
import { NewIdeaDialog } from './new-idea-dialog'
import { RealtimeListener, RealtimeStatus } from '@/components/providers/realtime-listener'
import { IdeasGenerateButton } from './ideas-generate-button'
import { getDictionary } from '@/lib/i18n/server'
import { IdeasViewClient } from './ideas-view-client'

export const dynamic = 'force-dynamic'

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
    return <ErrorState title={t.errorStates.loadFailed.title} description={queryError.message || t.errorStates.loadFailed.description} />
  }

  return (
    <div className="space-y-5">
      <RealtimeListener tables={['ideas']} channelName="ideas-page" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.ideas.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {ideas?.length ?? 0} {t.ideas.title.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RealtimeStatus channelName="ideas-page" label={t.common.live} />
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
            label: t.common.status,
            options: [
              { label: t.ideas.status.draft, value: 'draft' },
              { label: t.ideas.status.review, value: 'review' },
              { label: t.ideas.status.scheduled, value: 'scheduled' },
              { label: t.ideas.status.published, value: 'published' },
              { label: t.ideas.status.archived, value: 'archived' },
            ],
          },
          {
            key: 'priority',
            label: t.common.priority,
            options: [
              { label: t.ideas.priority.high, value: 'high' },
              { label: t.ideas.priority.medium, value: 'medium' },
              { label: t.ideas.priority.low, value: 'low' },
            ],
          },
          {
            key: 'platform',
            label: t.common.platform,
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

      {/* Content */}
      {!ideas || ideas.length === 0 ? (
        <EmptyState
          title={t.emptyStates.noIdeas.title}
          description={t.emptyStates.noIdeas.description}
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
        <IdeasViewClient ideas={ideas as Idea[]} />
      )}
    </div>
  )
}

