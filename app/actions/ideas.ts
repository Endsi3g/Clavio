'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function archiveIdea(ideaId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('ideas')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', ideaId)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'error',
      source: 'ideas',
      entity_type: 'idea',
      entity_id: ideaId,
      message: `Failed to archive idea: ${error.message}`,
    })
    return { success: false, error: error.message }
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'ideas',
    entity_type: 'idea',
    entity_id: ideaId,
    message: `Idea archived`,
  })
  revalidatePath('/app/ideas')
  return { success: true }
}
