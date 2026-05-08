'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function deleteVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  // Verify ownership
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('id, title, storage_path')
    .eq('id', videoId)
    .eq('workspace_id', WORKSPACE_ID)
    .single()

  if (fetchError || !video) {
    return { success: false, error: 'Video not found' }
  }

  // Delete storage file if present
  if (video.storage_path) {
    await supabase.storage.from('videos').remove([video.storage_path]).catch(() => null)
  }

  // Delete from DB — with ON DELETE CASCADE (migration 20260509000000)
  // transcripts, clips, and render_jobs are deleted automatically.
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('workspace_id', WORKSPACE_ID)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'videos',
    entity_type: 'video',
    entity_id: videoId,
    message: `Video deleted: "${video.title}"`,
  })

  revalidatePath('/app/videos')
  return { success: true }
}
