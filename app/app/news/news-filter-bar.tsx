'use client'

import Link from 'next/link'

interface Category {
  id: string
  label: string
}

interface NewsFilterBarProps {
  categories: Category[]
  activeCategory: string
}

export function NewsFilterBar({ categories, activeCategory }: NewsFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={`/app/news?category=${cat.id}`}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat.id
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  )
}
