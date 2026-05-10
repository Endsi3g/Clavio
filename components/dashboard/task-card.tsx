import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock } from 'lucide-react'

interface TaskCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  dueTime?: string
  priority?: 'high' | 'medium' | 'low'
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function TaskCard({
  icon,
  title,
  description,
  dueTime,
  priority = 'medium',
  actionLabel,
  onAction,
  className,
}: TaskCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-white p-4',
        priority === 'high' && 'border-l-4 border-l-red-400',
        priority === 'medium' && 'border-l-4 border-l-amber-400',
        priority === 'low' && 'border-l-4 border-l-slate-300',
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon ?? <AlertCircle className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        {dueTime && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{dueTime}</span>
          </div>
        )}
      </div>
      {actionLabel && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAction}
          className="shrink-0"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
