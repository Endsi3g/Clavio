import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { InviteMemberForm } from './invite-member-form'
import { MemberActions } from './member-actions'

export const dynamic = 'force-dynamic'

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-blue-50 text-blue-700 border-blue-100',
  member: 'bg-slate-50 text-slate-700 border-slate-200',
  viewer: 'bg-slate-50 text-slate-500 border-slate-200',
}

export default async function TeamPage() {
  const supabase = await createServerClient()

  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('user_id, role, joined_at')
    .eq('workspace_id', WORKSPACE_ID)
    .order('joined_at', { ascending: true })

  // Get auth user emails from profiles if available
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', (members ?? []).map((m) => m.user_id))

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Team</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage workspace members and roles.</p>
      </div>

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Invite a member</CardTitle>
          <CardDescription>
            An invitation email will be sent. They can accept and join your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm />
        </CardContent>
      </Card>

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Members
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {members?.length ?? 0}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error || !members || members.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No members found.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {members.map((m) => {
                const profile = profileMap[m.user_id]
                const initials = profile?.full_name
                  ? profile.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                  : m.user_id.slice(0, 2).toUpperCase()

                return (
                  <li key={m.user_id} className="flex items-center gap-4 px-6 py-4">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name ?? 'Avatar'}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {initials}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {profile?.full_name ?? 'Member'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {m.user_id}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${ROLE_BADGE[m.role] ?? ROLE_BADGE.member}`}
                    >
                      {m.role}
                    </Badge>

                    <time className="text-xs text-slate-400 font-mono hidden sm:block">
                      {formatDistanceToNow(new Date(m.joined_at), { addSuffix: true })}
                    </time>

                    {m.role !== 'owner' && (
                      <MemberActions userId={m.user_id} currentRole={m.role} />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
