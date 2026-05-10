import { NextRequest, NextResponse } from 'next/server'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'

const CATEGORY_MAP: Record<string, string> = {
  ai: 'technology',
  marketing: 'business',
  social: 'technology',
  creators: 'entertainment',
  business: 'business',
  world: 'general',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'world'
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)
  const q = searchParams.get('q') ?? ''

  if (!NEWS_API_KEY) {
    return NextResponse.json(
      { articles: [], error: 'NEWS_API_KEY not configured' },
      { status: 200 }
    )
  }

  try {
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      pageSize: String(limit),
      language: 'en',
    })

    if (q) {
      params.set('q', q)
      const endpoint = `https://newsapi.org/v2/everything?${params}`
      const res = await fetch(endpoint, { next: { revalidate: 1800 } })
      const data = await res.json()
      return NextResponse.json({ articles: data.articles ?? [] })
    }

    const apiCategory = CATEGORY_MAP[category] ?? 'general'
    params.set('category', apiCategory)
    params.set('country', 'us')

    const res = await fetch(`${NEWS_API_URL}?${params}`, { next: { revalidate: 1800 } })
    const data = await res.json()
    return NextResponse.json({ articles: data.articles ?? [] })
  } catch {
    return NextResponse.json({ articles: [], error: 'Failed to fetch news' }, { status: 200 })
  }
}
