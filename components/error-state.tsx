import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'An error occurred',
  message,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const body = message ?? description ?? 'Something went wrong. Please try again.'
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{body}</p>
      {onRetry && (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
