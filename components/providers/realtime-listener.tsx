'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ─── Types ────────────────────────────────────────────────────────────────────

type RealtimeTable = 'ideas' | 'videos' | 'posts' | 'workflow_runs' | 'logs' | 'post_metrics' | 'assets'

interface UseRealtimeOptions {
  tables: RealtimeTable[]
  channelName: string
  onUpdate?: (table: string, payload: any) => void
}

// ─── Core Realtime Hook ────────────────────────────────────────────────────────
// Use this hook inside any 'use client' component that needs live data.
// It will call router.refresh() automatically on any change in the given tables.
// You can also pass an optional onUpdate callback for custom logic.
//
// Usage:
//   useRealtime({ tables: ['ideas', 'posts'], channelName: 'my-page' })

export function useRealtime({ tables, channelName, onUpdate }: UseRealtimeOptions) {
  const router = useRouter()

  const handleRefresh = useCallback((table: string, payload: any) => {
    if (onUpdate) {
      onUpdate(table, payload)
    } else {
      router.refresh()
    }
  }, [router, onUpdate])

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Gracefully skip if Supabase is not configured
    if (!supabaseUrl || !supabaseKey) return

    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient(supabaseUrl, supabaseKey)
    } catch {
      return
    }

    const channel = supabase.channel(channelName)

    tables.forEach(table => {
      channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        (payload: any) => {
          console.log(`[Realtime] ${table} updated`, payload.eventType)
          handleRefresh(table, payload)
        }
      )
    })

    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Connected to channel: ${channelName}`)
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, tables, handleRefresh])
}

// ─── Standalone Component (Drop-in) ───────────────────────────────────────────
// Use <RealtimeListener tables={[...]} channelName="..." /> anywhere in a Server Component
// to make it live-updating without converting the whole page to a Client Component.
//
// This is a transparent (renders nothing) component.
//
// Example:
//   <RealtimeListener tables={['ideas', 'posts']} channelName="dashboard" />

interface RealtimeListenerProps {
  tables?: RealtimeTable[]
  channelName?: string
  onUpdate?: (table: string, payload: any) => void
}

export function RealtimeListener({
  tables = ['ideas', 'videos', 'posts', 'workflow_runs', 'logs'],
  channelName = 'global-listener',
  onUpdate,
}: RealtimeListenerProps) {
  useRealtime({ tables, channelName, onUpdate })
  return null
}

// ─── Realtime Status Indicator ─────────────────────────────────────────────────
// Shows a visual dot indicator of the realtime connection status.
// Green = connected, Yellow = connecting, Red = disconnected.
//
// Usage: <RealtimeStatus channelName="dashboard" />

export function RealtimeStatus({ channelName = 'status-check', label }: { channelName?: string; label?: string }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setStatus('disconnected')
      return
    }

    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient(supabaseUrl, supabaseKey)
    } catch {
      setStatus('disconnected')
      return
    }

    const channel = supabase.channel(`${channelName}-status`)

    channel.subscribe((s: string) => {
      if (s === 'SUBSCRIBED') setStatus('connected')
      else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('disconnected')
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName])

  const colors = {
    connecting: 'bg-amber-400',
    connected: 'bg-emerald-400',
    disconnected: 'bg-slate-300 dark:bg-slate-600',
  }

  const titles = {
    connecting: 'Connecting to realtime...',
    connected: 'Live — data updates automatically',
    disconnected: 'Offline — start Supabase to enable live updates',
  }

  return (
    <div className="flex items-center gap-1.5" title={titles[status]}>
      <span className={`relative flex h-2 w-2`}>
        {status === 'connected' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.connected} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[status]}`} />
      </span>
      {label && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          {label}
        </span>
      )}
    </div>
  )
}
