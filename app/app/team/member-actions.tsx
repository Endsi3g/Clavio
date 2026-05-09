'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, UserMinus, Loader2 } from 'lucide-react'

interface MemberActionsProps {
  userId: string
  currentRole: string
}

export function MemberActions({ userId, currentRole }: MemberActionsProps) {
  const [loading, setLoading] = useState(false)

  async function changeRole(role: string) {
    setLoading(true)
    await fetch('/api/workspace/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setLoading(false)
    window.location.reload()
  }

  async function removeMember() {
    if (!confirm('Remove this member from the workspace?')) return
    setLoading(true)
    await fetch(`/api/workspace/members/${userId}`, { method: 'DELETE' })
    setLoading(false)
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MoreHorizontal className="h-3.5 w-3.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {currentRole !== 'admin' && (
          <DropdownMenuItem onClick={() => changeRole('admin')}>
            <Shield className="mr-2 h-3.5 w-3.5 text-blue-500" />
            Make admin
          </DropdownMenuItem>
        )}
        {currentRole !== 'member' && (
          <DropdownMenuItem onClick={() => changeRole('member')}>
            <Shield className="mr-2 h-3.5 w-3.5 text-slate-400" />
            Set as member
          </DropdownMenuItem>
        )}
        {currentRole !== 'viewer' && (
          <DropdownMenuItem onClick={() => changeRole('viewer')}>
            <Shield className="mr-2 h-3.5 w-3.5 text-slate-300" />
            Set as viewer
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
          onClick={removeMember}
        >
          <UserMinus className="mr-2 h-3.5 w-3.5" />
          Remove member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
