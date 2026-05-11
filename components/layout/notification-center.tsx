'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNotifications, markAsRead } from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const settingsRef = useRef<{ enabled: boolean; file: string; types: string[] }>({
    enabled: true,
    file: 'pop',
    types: ['info', 'success', 'warning', 'error'],
  })

  const playSound = (type: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'pop') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.1)
      } else if (type === 'chime') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(1200, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5)
        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.5)
      } else if (type === 'bloop') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      }
    } catch (e) {
      // Ignore audio context errors if user hasn't interacted yet
    }
  }

  const fetchSettings = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('settings')
      .select('key, value_json')
      .in('key', ['notification_sound_enabled', 'notification_sound_file', 'notification_types'])
      .eq('workspace_id', WORKSPACE_ID)
    
    if (data) {
      const map = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value_json }), {}) as any
      settingsRef.current = {
        enabled: map.notification_sound_enabled ?? true,
        file: map.notification_sound_file ?? 'pop',
        types: map.notification_types ?? ['info', 'success', 'warning', 'error'],
      }
    }
  }

  const fetchNotifications = async () => {
    const data = await getNotifications()
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
    fetchNotifications()

    const supabase = createClient()
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `workspace_id=eq.${WORKSPACE_ID}`,
        },
        (payload) => {
          fetchNotifications()
          
          const newNotif = payload.new as any
          const { enabled, file, types } = settingsRef.current
          
          if (types.includes(newNotif.type)) {
            // Trigger UI Toast
            if (newNotif.type === 'error') {
              toast.error(newNotif.title, { description: newNotif.message })
            } else if (newNotif.type === 'success') {
              toast.success(newNotif.title, { description: newNotif.message })
            } else if (newNotif.type === 'warning') {
              toast.warning(newNotif.title, { description: newNotif.message })
            } else {
              toast(newNotif.title, { description: newNotif.message })
            }

            // Trigger Audio
            if (enabled) {
              playSound(file)
            }
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id)
    if (res.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] font-semibold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <DropdownMenuLabel className="px-4 py-3 font-semibold">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Aucune notification</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-slate-50',
                  !n.is_read && 'bg-blue-50/50'
                )}
                onClick={() => handleMarkAsRead(n.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <span className={cn('text-sm font-medium', !n.is_read && 'text-blue-700')}>
                      {n.title}
                    </span>
                  </div>
                  {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 pl-6">{n.message}</p>
                <span className="text-[10px] text-slate-400 pl-6 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <a
              href="/app/notifications"
              className="block w-full py-2.5 text-center text-xs font-medium text-blue-600 hover:bg-slate-50 transition-colors"
            >
              View all notifications
            </a>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
