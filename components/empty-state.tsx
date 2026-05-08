'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  action?: React.ReactNode
  className?: string
  subtle?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
  subtle = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        subtle ? 'py-10 px-6' : 'py-16 px-8',
        className
      )}
    >
      {icon && (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className={cn(
            'mb-4 flex items-center justify-center rounded-2xl',
            subtle
              ? 'h-11 w-11 bg-slate-100 text-slate-400'
              : 'h-16 w-16 bg-gradient-to-br from-white to-slate-50 text-slate-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200'
          )}
        >
          {icon}
        </motion.div>
      )}
      {!icon && !subtle && (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200"
        >
          <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </motion.div>
      )}
      <h3 className={cn(
        'font-semibold text-slate-900',
        subtle ? 'text-sm' : 'text-base'
      )}>
        {title}
      </h3>
      <p className={cn(
        'mt-1.5 max-w-xs text-slate-500',
        subtle ? 'text-xs' : 'text-sm'
      )}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
      {!action && actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
