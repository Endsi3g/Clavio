import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import type { Post } from '@/lib/types'
import { NewPostButton } from './new-post-button'
import { PublishCalendar } from './publish-calendar'
import { getDictionary } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-50 text-red-700 border-red-200',
  tiktok: 'bg-slate-900 text-white border-slate-700',
  instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  linkedin: 'bg-blue-50 text-blue-700 border-blue-200',
  twitter: 'bg-sky-50 text-sky-700 border-sky-200',
}

export default async function PublishingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const t = await getDictionary()
  const supabase = await createServerClient()

  let posts: Post[] | null = null
  let queryError: any = null

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })
    
    posts = data
    queryError = error
  } catch (err: any) {
    if (err?.message === 'fetch failed' || err?.name === 'TypeError') {
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
    return <ErrorState title="Failed to load posts" description={queryError.message || 'Unknown error occurred'} />
  }

  const allPosts: Post[] = posts ?? []

  const drafts = allPosts.filter((p) => p.status === 'draft')
  const scheduled = allPosts.filter((p) => p.status === 'scheduled')
  const published = allPosts.filter((p) => p.status === 'published')
  const failed = allPosts.filter((p) => p.status === 'failed')

  function PostTable({ items }: { items: Post[] }) {
    if (items.length === 0) {
      return (
        <EmptyState
          title="Nothing here"
          description="Posts in this state will appear here."
          className="py-12"
        />
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[35%]">Title</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Scheduled for</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link
                  href={`/app/publishing/${post.id}`}
                  className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
                {post.caption && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{post.caption}</p>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                    PLATFORM_COLORS[post.platform] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {post.platform}
                </span>
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-500">
                {post.scheduled_for
                  ? format(new Date(post.scheduled_for), 'MMM d, HH:mm')
                  : '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={post.status} />
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-400">
                {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 transition-colors"
                      aria-label="Post options"
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/app/publishing/${post.id}`}>
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem>Publish now</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

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
                <PostTable items={items} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
