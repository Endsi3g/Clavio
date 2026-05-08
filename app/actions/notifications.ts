import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function getNotifications() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markAsRead(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as read:', error)
    return { success: false }
  }

  return { success: true }
}
