'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function approveClip(clipId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('clips')
    .update({ status: 'review' })
    .eq('id', clipId)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'error',
      source: 'clips',
      entity_type: 'clip',
      entity_id: clipId,
      message: `Failed to approve clip: ${error.message}`,
    })
    return { success: false, error: error.message }
  }

  revalidatePath('/app/clips')
  return { success: true }
}

export async function rejectClip(clipId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('clips')
    .update({ status: 'archived' })
    .eq('id', clipId)
    .eq('workspace_id', WORKSPACE_ID)

  if (error) {
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'error',
      source: 'clips',
      entity_type: 'clip',
      entity_id: clipId,
      message: `Failed to reject clip: ${error.message}`,
    })
    return { success: false, error: error.message }
  }

  revalidatePath('/app/clips')
  return { success: true }
}

export async function sendClipToPublish(clipId: string, videoId: string) {
  const supabase = await createServerClient()

  const { data: clip } = await supabase
    .from('clips')
    .select('*, videos(title, workspace_id)')
    .eq('id', clipId)
    .single()

  if (!clip) return { error: 'Clip not found' }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      workspace_id: WORKSPACE_ID,
      clip_id: clipId,
      title: clip.title,
      caption: clip.caption ?? '',
      platform: 'instagram',
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await supabase.from('clips').update({ status: 'scheduled' }).eq('id', clipId)

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'clips',
    entity_type: 'post',
    entity_id: post.id,
    message: `Draft post created from clip "${clip.title}"`,
    payload_json: { clipId, postId: post.id },
  })

  revalidatePath('/app/clips')
  revalidatePath('/app/publishing')

  return { success: true, postId: post.id }
}
