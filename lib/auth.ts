import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type WorkspaceRole = 'viewer' | 'member' | 'admin' | 'owner'

const ROLE_RANK: Record<WorkspaceRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function getCurrentWorkspace(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()
  return data
}

export async function getWorkspaceId(userId: string): Promise<string> {
  const ws = await getCurrentWorkspace(userId)
  if (ws?.workspace_id) return ws.workspace_id
  // Fallback to legacy single-workspace for backwards compat during migration
  return '00000000-0000-0000-0000-000000000001'
}

export async function requireRole(
  userId: string,
  workspaceId: string,
  minRole: WorkspaceRole
): Promise<WorkspaceRole> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single()

  const role = (data?.role ?? 'viewer') as WorkspaceRole
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) redirect('/app/dashboard')
  return role
}
