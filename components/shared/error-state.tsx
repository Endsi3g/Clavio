'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorStateProps {
  title?: string
  message?: string
  description?: string
  onRetry?: () => void
  className?: string
  compact?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  description,
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  const body = message ?? description ?? 'An unexpected error occurred. Please try again.'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-10 px-6' : 'py-16 px-8',
        className
      )}
    >
      <motion.div 
        animate={{ x: [0, -2, 2, -2, 2, 0] }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl',
          compact
            ? 'h-11 w-11 bg-red-50 text-red-400'
            : 'h-16 w-16 bg-gradient-to-br from-red-50 to-rose-50 text-red-400 shadow-[0_8px_30px_rgb(239,68,68,0.08)] ring-1 ring-red-100'
        )}
      >
        <AlertTriangle className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
      </motion.div>
      <h3 className={cn(
        'font-semibold text-slate-900',
        compact ? 'text-sm' : 'text-base'
      )}>
        {title}
      </h3>
      <p className={cn(
        'mt-1.5 max-w-sm text-slate-500',
        compact ? 'text-xs' : 'text-sm'
      )}>
        {body}
      </p>
      {onRetry && (
        <Button
          className="mt-5 gap-1.5"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </motion.div>
  )
}
