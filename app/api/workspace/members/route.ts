import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function GET() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('user_id, role, joined_at, invited_by')
    .eq('workspace_id', WORKSPACE_ID)
    .order('joined_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const { userId, role } = await req.json()
  const ALLOWED_ROLES = ['owner', 'admin', 'member', 'viewer']

  if (!userId || !role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', WORKSPACE_ID)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
