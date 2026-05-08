'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function bulkSchedulePosts(postIds: string[], scheduledFor: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('posts')
    .update({ status: 'scheduled', scheduled_for: scheduledFor })
    .in('id', postIds)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) return { error: error.message }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'publishing',
    message: `Bulk scheduled ${postIds.length} posts for ${scheduledFor}`,
    payload_json: { postIds, scheduledFor },
  })

  revalidatePath('/app/publishing')
  return { success: true }
}

export async function archivePost(postId: string) {
  const supabase = await createServerClient()
  await supabase
    .from('posts')
    .update({ status: 'archived' })
    .eq('id', postId)
    .eq('workspace_id', WORKSPACE_ID)
  revalidatePath('/app/publishing')
  return { success: true }
}

export async function publishPostNow(postId: string) {
  const supabase = await createServerClient()
  await supabase
    .from('posts')
    .update({ status: 'scheduled', scheduled_for: new Date().toISOString() })
    .eq('id', postId)
    .eq('workspace_id', WORKSPACE_ID)
  revalidatePath('/app/publishing')
  return { success: true }
}
