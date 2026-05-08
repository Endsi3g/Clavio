import type { Status } from '@/lib/types'

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: {
    label: 'Brouillon',
    className: 'text-slate-600 border border-slate-300 bg-transparent',
  },
  processing: {
    label: 'En cours',
    className: 'bg-blue-100 text-blue-700 border-0',
  },
  review: {
    label: 'Révision',
    className: 'bg-amber-100 text-amber-700 border-0',
  },
  approved: {
    label: 'Approuvé',
    className: 'bg-emerald-100 text-emerald-700 border-0',
  },
  scheduled: {
    label: 'Planifié',
    className: 'bg-violet-100 text-violet-700 border-0',
  },
  published: {
    label: 'Publié',
    className: 'bg-emerald-100 text-emerald-700 border-0',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-teal-100 text-teal-700 border-0',
  },
  failed: {
    label: 'Échec',
    className: 'bg-red-100 text-red-700 border-0',
  },
  archived: {
    label: 'Archivé',
    className: 'bg-slate-100 text-slate-500 border-0',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.draft
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
