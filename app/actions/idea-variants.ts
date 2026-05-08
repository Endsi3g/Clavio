'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function approveVariantAndDraft(variantId: string, ideaId: string) {
  const supabase = await createServerClient()

  const [{ data: variant }, { data: idea }] = await Promise.all([
    supabase.from('idea_variants').select('*').eq('id', variantId).single(),
    supabase.from('ideas').select('*').eq('id', ideaId).single(),
  ])

  if (!variant) return { error: 'Variant not found' }

  await supabase.from('idea_variants').update({ status: 'review' }).eq('id', variantId)

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      workspace_id: WORKSPACE_ID,
      idea_id: ideaId,
      title: variant.hook ?? idea?.title ?? 'Draft post',
      caption: variant.script ?? '',
      platform: idea?.platform ?? 'instagram',
      status: 'draft',
    })
    .select('id')
    .single()

  if (postError) return { error: postError.message }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'idea-variants',
    entity_type: 'post',
    entity_id: post.id,
    message: `Draft post created from variant "${variant.hook ?? variantId}"`,
    payload_json: { variantId, ideaId, postId: post.id },
  })

  revalidatePath(`/app/ideas/${ideaId}`)
  revalidatePath('/app/publishing')

  return { success: true, postId: post.id }
}

export async function rejectVariant(variantId: string, ideaId: string) {
  const supabase = await createServerClient()

  await supabase.from('idea_variants').update({ status: 'archived' }).eq('id', variantId)

  revalidatePath(`/app/ideas/${ideaId}`)
  return { success: true }
}
