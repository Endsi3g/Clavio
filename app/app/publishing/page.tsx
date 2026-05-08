import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Post } from '@/lib/types'
import { NewPostButton } from './new-post-button'
import { PublishCalendar } from './publish-calendar'
import { PostTableClient } from './post-table-client'
import { getDictionary } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

export default async function PublishingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const t = await getDictionary()
  const supabase = await createServerClient()

  let posts: Post[] | null = null
  let queryError: unknown = null

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })

    posts = data
    queryError = error
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
    queryError = err
  }

  if (queryError) {
    return (
      <ErrorState
        title="Failed to load posts"
        description={(queryError as { message?: string }).message ?? 'Unknown error occurred'}
      />
    )
  }

  const allPosts: Post[] = posts ?? []

  const drafts = allPosts.filter((p) => p.status === 'draft')
  const scheduled = allPosts.filter((p) => p.status === 'scheduled')
  const published = allPosts.filter((p) => p.status === 'published')
  const failed = allPosts.filter((p) => p.status === 'failed')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.publishing.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {scheduled.length} scheduled · {published.length} published · {failed.length} failed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PublishCalendar posts={allPosts} />
          <NewPostButton />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scheduled">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="scheduled">
            {t.publishing.tabs.scheduled}
            {scheduled.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                {scheduled.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts">
            {t.publishing.tabs.drafts}
            {drafts.length > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="published">{t.publishing.tabs.published}</TabsTrigger>
          <TabsTrigger value="failed">
            {t.publishing.tabs.failed}
            {failed.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                {failed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {[
          { value: 'scheduled', items: scheduled },
          { value: 'drafts', items: drafts },
          { value: 'published', items: published },
          { value: 'failed', items: failed },
        ].map(({ value, items }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <PostTableClient items={items} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
