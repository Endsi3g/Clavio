'use client'

import { usePresence } from '@/components/providers/presence-provider'
import { Wifi } from 'lucide-react'

export function OnlineCount() {
  const { onlineCount } = usePresence()
  if (onlineCount === 0) return null
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {onlineCount} online
    </div>
  )
}

export function MemberPresenceDot({ userId }: { userId: string }) {
  const { onlineUserIds } = usePresence()
  const isOnline = onlineUserIds.includes(userId)
  if (!isOnline) return null
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  )
}
