'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { archiveIdea } from '@/app/actions/ideas'
import { toast } from 'sonner'
import type { Idea } from '@/lib/types'

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: 'draft',     label: 'Brouillon',  color: 'border-slate-300 bg-slate-50' },
  { key: 'review',    label: 'Révision',   color: 'border-amber-300 bg-amber-50' },
  { key: 'approved',  label: 'Approuvé',   color: 'border-emerald-300 bg-emerald-50' },
  { key: 'scheduled', label: 'Planifié',   color: 'border-violet-300 bg-violet-50' },
  { key: 'published', label: 'Publié',     color: 'border-blue-300 bg-blue-50' },
  { key: 'archived',  label: 'Archivé',    color: 'border-slate-200 bg-slate-50 opacity-60' },
]

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-100 text-red-700',
  tiktok: 'bg-slate-800 text-white',
  instagram: 'bg-pink-100 text-pink-700',
  linkedin: 'bg-blue-100 text-blue-700',
  twitter: 'bg-sky-100 text-sky-700',
}

export function IdeasKanban({ ideas }: { ideas: Idea[] }) {
  const byStatus = COLUMNS.reduce<Record<string, Idea[]>>((acc, col) => {
    acc[col.key] = ideas.filter((i) => i.status === col.key)
    return acc
  }, {})

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const cards = byStatus[col.key] ?? []
        return (
          <div key={col.key} className="flex-shrink-0 w-64">
            <div className={`rounded-xl border-2 ${col.color} p-3 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{col.label}</span>
                <span className="text-xs font-mono text-slate-400">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((idea) => (
                  <KanbanCard key={idea.id} idea={idea} />
                ))}
                {cards.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                    Aucune idée
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KanbanCard({ idea }: { idea: Idea }) {
  const [archiving, setArchiving] = useState(false)

  return (
    <div className="group rounded-lg bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      <Link href={`/app/ideas/${idea.id}`}>
        <p className="text-sm font-medium text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {idea.title}
        </p>
      </Link>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {idea.priority && (
          <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[idea.priority] ?? 'bg-slate-300'}`} title={idea.priority} />
        )}
        {idea.platform && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${PLATFORM_COLORS[idea.platform] ?? 'bg-slate-100 text-slate-600'}`}>
            {idea.platform}
          </span>
        )}
        {idea.format && (
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 capitalize">{idea.format}</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-mono">
          {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
        </p>
        {idea.status !== 'archived' && (
          <button
            className="text-[10px] text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            onClick={async () => {
              setArchiving(true)
              await archiveIdea(idea.id)
              toast.success('Archivée', {
                action: { label: 'Voir', onClick: () => window.location.href = `/app/ideas/${idea.id}` }
              })
              setArchiving(false)
            }}
            disabled={archiving}
          >
            Archiver
          </button>
        )}
      </div>
    </div>
  )
}
