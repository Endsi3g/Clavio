import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { WorkflowTimeline } from '@/components/workflow-timeline'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Sparkles,
  Send,
  Video,
  Clock,
  Calendar,
  Tag,
  Globe,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import type { Idea, IdeaVariant, Status } from '@/lib/types'

type PostSummary = {
  id: string
  title: string
  platform: string
  status: Status
  scheduled_for: string | null
}
import { IdeaEditor } from './idea-editor'
import { VariantCard } from './variant-card'

export const dynamic = 'force-dynamic'

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const [ideaResult, variantsResult, postsResult] = await Promise.all([
    supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .single(),
    supabase
      .from('idea_variants')
      .select('*')
      .eq('idea_id', id)
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id, title, platform, status, scheduled_for')
      .eq('idea_id', id)
      .eq('workspace_id', WORKSPACE_ID),
  ])

  if (!ideaResult.data) notFound()

  const idea: Idea = ideaResult.data
  const variants: IdeaVariant[] = variantsResult.data ?? []
  const posts: PostSummary[] = postsResult.data ?? []

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/app/ideas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Ideas
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
              {idea.title}
            </h1>
            {idea.description && (
              <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">{idea.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Generate variant
            </Button>
            <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
              <Send className="h-3.5 w-3.5" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-5">
          <Tabs defaultValue="content">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="variants">
                Variants{' '}
                {variants.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                    {variants.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="posts">
                Posts{' '}
                {posts.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                    {posts.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <IdeaEditor idea={idea} />
            </TabsContent>

            <TabsContent value="variants" className="mt-4">
              {variants.length === 0 ? (
                <EmptyState
                  title="No variants yet"
                  description="Generate AI variants from this idea to explore different hooks and angles."
                  action={
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate variant
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <VariantCard key={variant.id} variant={variant} ideaId={idea.id} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-4">
              {posts.length === 0 ? (
                <EmptyState
                  title="No posts linked"
                  description="Schedule this idea as a post to see it here."
                />
              ) : (
                <div className="space-y-2">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/app/publishing/${post.id}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <Send className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{post.platform}</p>
                      </div>
                      <StatusBadge status={post.status} />
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Status"
                value={<StatusBadge status={idea.status} />}
              />
              {idea.priority && (
                <DetailRow
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label="Priority"
                  value={
                    <span className="text-xs font-medium capitalize text-slate-700">
                      {idea.priority}
                    </span>
                  }
                />
              )}
              {idea.format && (
                <DetailRow
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label="Format"
                  value={
                    <span className="text-xs capitalize text-slate-700">{idea.format}</span>
                  }
                />
              )}
              {idea.platform && (
                <DetailRow
                  icon={<Globe className="h-3.5 w-3.5" />}
                  label="Platform"
                  value={
                    <span className="text-xs capitalize text-slate-700">{idea.platform}</span>
                  }
                />
              )}
              {idea.pillar && (
                <DetailRow
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label="Pillar"
                  value={
                    <span className="text-xs capitalize text-slate-700">{idea.pillar}</span>
                  }
                />
              )}
              <Separator />
              <DetailRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Created"
                value={
                  <span className="text-xs font-mono text-slate-500">
                    {format(new Date(idea.created_at), 'MMM d, yyyy')}
                  </span>
                }
              />
              <DetailRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Updated"
                value={
                  <span className="text-xs font-mono text-slate-500">
                    {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
                  </span>
                }
              />
            </CardContent>
          </Card>

          {idea.source_type && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 capitalize">{idea.source_type}</p>
                {idea.source_ref && (
                  <p className="text-xs font-mono text-slate-400 mt-1 truncate">{idea.source_ref}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="shrink-0">{value}</div>
    </div>
  )
}
