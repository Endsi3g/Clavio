'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'

interface PresenceUser {
  user_id: string
  email: string
  online_at: string
}

interface PresenceContextValue {
  onlineUserIds: string[]
  onlineCount: number
}

const PresenceContext = React.createContext<PresenceContextValue>({
  onlineUserIds: [],
  onlineCount: 0,
})

export function usePresence() {
  return React.useContext(PresenceContext)
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUserIds, setOnlineUserIds] = React.useState<string[]>([])

  React.useEffect(() => {
    const supabase = createClient()
    let channelRef: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return

      const channel = supabase.channel(`workspace-presence:${WORKSPACE_ID}`, {
        config: { presence: { key: user.id } },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          const ids = Object.values(state)
            .flat()
            .map((p) => (p as unknown as PresenceUser).user_id)
            .filter(Boolean)
          setOnlineUserIds([...new Set(ids)])
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          const ids = newPresences.map((p) => (p as unknown as PresenceUser).user_id).filter(Boolean)
          setOnlineUserIds((prev) => [...new Set([...prev, ...ids])])
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          const leftIds = new Set(leftPresences.map((p) => (p as unknown as PresenceUser).user_id))
          setOnlineUserIds((prev) => prev.filter((id) => !leftIds.has(id)))
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              email: user.email ?? '',
              online_at: new Date().toISOString(),
            })
          }
        })

      channelRef = channel
    })

    return () => {
      if (channelRef) supabase.removeChannel(channelRef)
    }
  }, [])

  return (
    <PresenceContext.Provider value={{ onlineUserIds, onlineCount: onlineUserIds.length }}>
      {children}
    </PresenceContext.Provider>
  )
}
