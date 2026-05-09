import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
