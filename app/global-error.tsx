'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mx-auto">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500">
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400">Error ID: {error.digest}</p>
          )}
          <Button onClick={reset} className="bg-blue-500 hover:bg-blue-600">
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
