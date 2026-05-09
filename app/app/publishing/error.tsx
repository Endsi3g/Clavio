'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertTriangle className="h-8 w-8 text-slate-300" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-700">Something went wrong</p>
        <p className="text-xs text-slate-400 max-w-xs">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>Try again</Button>
    </div>
  )
}
