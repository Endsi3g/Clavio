'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function reschedulePost(postId: string, newDate: string): Promise<{ success: boolean; error?: string }> {
  if (!postId || !newDate) return { success: false, error: 'Missing parameters' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('posts')
    .update({
      scheduled_for: newDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) return { success: false, error: error.message }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'calendar/reschedule',
    entity_type: 'post',
    entity_id: postId,
    message: `Post rescheduled to ${newDate}`,
    payload_json: { post_id: postId, new_date: newDate },
  })

  revalidatePath('/app/calendar')
  return { success: true }
}
