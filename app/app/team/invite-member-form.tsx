'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'

export function InviteMemberForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const json = await res.json()
      if (res.ok) {
        setSent(true)
        setEmail('')
      } else {
        setError(json.error ?? 'Failed to send invitation')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        Invitation sent!{' '}
        <button
          className="underline text-slate-500 hover:text-slate-700"
          onClick={() => setSent(false)}
        >
          Invite another
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          className="flex-1 h-9 text-sm"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleInvite}
          disabled={loading || !email.trim()}
          className="gap-1.5 h-9"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Invite
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
