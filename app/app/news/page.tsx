import { Card, CardContent } from '@/components/ui/card'
import { Newspaper, ExternalLink, Sparkles, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { NewsScriptDrawer } from './news-script-drawer'
import { NewsFilterBar } from './news-filter-bar'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { id: 'ai', label: 'AI & Tech' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'social', label: 'Social Media' },
  { id: 'creators', label: 'Creator Economy' },
  { id: 'business', label: 'Business' },
  { id: 'world', label: 'World' },
]

type Article = {
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string | null
  source: { name: string }
  author: string | null
}

async function fetchNews(category: string): Promise<Article[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/news?category=${category}&limit=20`, {
      next: { revalidate: 1800 },
    })
    const data = await res.json()
    return (data.articles ?? []) as Article[]
  } catch {
    return []
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const activeCategory = params.category ?? 'ai'
  const articles = await fetchNews(activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">News</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Stay on top of trending topics and turn them into content instantly.
          </p>
        </div>
        <form>
          <button
            formAction={`/app/news?category=${activeCategory}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <NewsFilterBar categories={CATEGORIES} activeCategory={activeCategory} />

      {/* No API Key notice */}
      {articles.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-amber-800">
              No articles loaded.{' '}
              {!process.env.NEWS_API_KEY
                ? 'Add NEWS_API_KEY to your .env.local file to enable news fetching.'
                : 'Could not reach the news API. Check your internet connection.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Articles Grid */}
      {articles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-shadow"
            >
              {article.urlToImage && (
                <div className="aspect-video overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {article.source.name}
                    </span>
                    {article.publishedAt && (
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{article.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Read
                  </a>
                  <div className="ml-auto">
                    <NewsScriptDrawer article={article} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
