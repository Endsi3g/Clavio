'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/error-state'

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('App Error Boundary caught an error:', error)
  }, [error])

  // Check if it's a fetch/network error related to Supabase
  const isNetworkError =
    error.message.includes('fetch failed') ||
    error.name === 'TypeError' ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch')

  if (isNetworkError) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
        <ErrorState
          title="Database connection failed"
          description="Could not reach the local Supabase server. Please ensure you have run 'npx supabase start' in your terminal."
          onRetry={reset}
        />
      </div>
    )
  }

  // Generic fallback for other errors
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
      <ErrorState
        title="Something went wrong"
        description={error.message || 'An unexpected error occurred while rendering this page.'}
        onRetry={reset}
      />
    </div>
  )
}
