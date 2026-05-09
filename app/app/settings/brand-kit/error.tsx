'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function BrandKitError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <p className="text-sm text-slate-500">Failed to load brand kit.</p>
      <Button variant="outline" size="sm" onClick={reset}>Try again</Button>
    </div>
  )
}
