import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = await createServerClient()
  const pattern = `%${q}%`

  const [ideasRes, postsRes, videosRes, assetsRes] = await Promise.all([
    supabase
      .from('ideas')
      .select('id, title, status, platform')
      .eq('workspace_id', WORKSPACE_ID)
      .ilike('title', pattern)
      .limit(5),
    supabase
      .from('posts')
      .select('id, title, status, platform')
      .eq('workspace_id', WORKSPACE_ID)
      .ilike('title', pattern)
      .limit(5),
    supabase
      .from('videos')
      .select('id, title, status')
      .eq('workspace_id', WORKSPACE_ID)
      .ilike('title', pattern)
      .limit(4),
    supabase
      .from('assets')
      .select('id, name, asset_type')
      .eq('workspace_id', WORKSPACE_ID)
      .ilike('name', pattern)
      .limit(4),
  ])

  const results = [
    ...(ideasRes.data ?? []).map((r) => ({ type: 'idea' as const, id: r.id, title: r.title, meta: r.platform ?? r.status, href: `/app/ideas/${r.id}` })),
    ...(postsRes.data ?? []).map((r) => ({ type: 'post' as const, id: r.id, title: r.title, meta: r.platform, href: `/app/publishing/${r.id}` })),
    ...(videosRes.data ?? []).map((r) => ({ type: 'video' as const, id: r.id, title: r.title, meta: r.status, href: `/app/videos/${r.id}` })),
    ...(assetsRes.data ?? []).map((r) => ({ type: 'asset' as const, id: r.id, title: r.name, meta: r.asset_type, href: `/app/assets` })),
  ]

  return NextResponse.json({ results })
}
