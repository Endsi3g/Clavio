import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function GET() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('news_preferences')
    .select('categories, keywords, sources')
    .eq('workspace_id', WORKSPACE_ID)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    data ?? { categories: ['ai', 'world'], keywords: [], sources: {} }
  )
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()

  const body = await request.json()
  const { categories, keywords, sources } = body as {
    categories?: string[]
    keywords?: string[]
    sources?: Record<string, unknown>
  }

  const { error } = await supabase
    .from('news_preferences')
    .upsert(
      {
        workspace_id: WORKSPACE_ID,
        categories: categories ?? ['ai', 'world'],
        keywords: keywords ?? [],
        sources: sources ?? {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workspace_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
