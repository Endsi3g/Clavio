import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

type RouteParams = { params: Promise<{ userId: string }> }

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await params
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', WORKSPACE_ID)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'team',
    entity_type: 'workspace_member',
    entity_id: userId,
    message: `Team member removed: ${userId}`,
  })

  return NextResponse.json({ success: true })
}
