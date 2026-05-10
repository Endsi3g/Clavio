'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/shared/error-state'

export default function ClipDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
      <ErrorState
        title="Failed to load clip"
        description={error.message || 'An unexpected error occurred.'}
        onRetry={reset}
      />
    </div>
  )
}
