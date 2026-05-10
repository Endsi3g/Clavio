import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

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

const RSS_FEEDS: Record<string, string[]> = {
  ai: [
    'https://techcrunch.com/feed/',
    'https://feeds.wired.com/wired/index',
  ],
  marketing: [
    'https://feeds.feedburner.com/marketingland/nBs',
    'https://blog.hubspot.com/marketing/rss.xml',
  ],
  social: [
    'https://www.socialmediatoday.com/rss.xml',
  ],
  creators: [
    'https://www.tubefilter.com/feed/',
  ],
  business: [
    'https://feeds.feedburner.com/entrepreneur/latest',
  ],
  world: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ],
}

type Article = {
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string | null
  source: { name: string }
  author: string | null
}

async function fetchRSS(category: string): Promise<Article[]> {
  const feeds = RSS_FEEDS[category] ?? []
  if (feeds.length === 0) return []

  const parser = new Parser({ timeout: 5000 })
  const results = await Promise.allSettled(
    feeds.map((url) => parser.parseURL(url))
  )

  const articles: Article[] = []
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    const feed = result.value
    for (const item of feed.items.slice(0, 10)) {
      articles.push({
        title: item.title ?? '',
        description: item.contentSnippet ?? item.summary ?? null,
        url: item.link ?? '',
        urlToImage: null,
        publishedAt: item.pubDate ?? item.isoDate ?? null,
        source: { name: feed.title ?? 'RSS' },
        author: item.creator ?? item.author ?? null,
      })
    }
  }
  return articles
}

async function fetchNewsAPI(category: string, limit: number, q: string): Promise<Article[]> {
  if (!NEWS_API_KEY) return []

  const params = new URLSearchParams({
    apiKey: NEWS_API_KEY,
    pageSize: String(limit),
    language: 'en',
  })

  try {
    if (q) {
      params.set('q', q)
      const res = await fetch(`https://newsapi.org/v2/everything?${params}`, {
        next: { revalidate: 1800 },
      })
      const data = await res.json()
      return (data.articles ?? []) as Article[]
    }

    const apiCategory = CATEGORY_MAP[category] ?? 'general'
    params.set('category', apiCategory)
    params.set('country', 'us')

    const res = await fetch(`${NEWS_API_URL}?${params}`, {
      next: { revalidate: 1800 },
    })
    const data = await res.json()
    return (data.articles ?? []) as Article[]
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'world'
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)
  const q = searchParams.get('q') ?? ''

  const [newsApiArticles, rssArticles] = await Promise.all([
    fetchNewsAPI(category, limit, q),
    q ? Promise.resolve([]) : fetchRSS(category),
  ])

  // Merge, deduplicate by URL, sort by date
  const seen = new Set<string>()
  const merged: Article[] = []

  for (const article of [...newsApiArticles, ...rssArticles]) {
    if (!article.url || seen.has(article.url)) continue
    seen.add(article.url)
    merged.push(article)
  }

  merged.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })

  return NextResponse.json({ articles: merged.slice(0, limit) })
}
