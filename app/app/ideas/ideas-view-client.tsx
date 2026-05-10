'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { LayoutList, LayoutGrid } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IdeasKanban } from './ideas-kanban'
import { IdeaRowActions } from './idea-row-actions'
import type { Idea } from '@/lib/types'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-slate-500 bg-slate-50 border-slate-200',
}

export function IdeasViewClient({ ideas }: { ideas: Idea[] }) {
  const [view, setView] = useState<'table' | 'kanban'>('table')

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'table'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
        </div>
      </div>

      {/* Kanban view */}
      {view === 'kanban' && <IdeasKanban ideas={ideas} />}

      {/* Table view */}
      {view === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[35%]">Title</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ideas.map((idea: Idea) => (
                    <TableRow key={idea.id}>
                      <TableCell>
                        <Link
                          href={`/app/ideas/${idea.id}`}
                          className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {idea.title}
                        </Link>
                        {idea.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {idea.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.format ? (
                          <span className="text-xs text-slate-600 capitalize">{idea.format}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.platform ? (
                          <span className="text-xs text-slate-600 capitalize">{idea.platform}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {idea.priority ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[idea.priority] ?? ''}`}
                          >
                            {idea.priority}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={idea.status} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">
                        {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <IdeaRowActions ideaId={idea.id} status={idea.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

