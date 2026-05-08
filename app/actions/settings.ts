'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { redirect } from 'next/navigation'

export async function saveWorkspaceSettings(formData: FormData) {
  const name = (formData.get('workspace_name') as string)?.trim()
  const locale = (formData.get('workspace_locale') as string)?.trim()

  if (!name || !['en', 'fr'].includes(locale)) {
    redirect('/app/settings?tab=workspace&error=invalid')
  }

  const supabase = await createServerClient()
  await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'workspace_name', value_json: name, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'workspace_locale', value_json: locale, updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'settings/workspace',
    message: `Workspace settings updated: name="${name}", locale="${locale}"`,
  })

  redirect('/app/settings?tab=workspace&saved=1')
}

export async function savePublishingSettings(formData: FormData) {
  const platform = (formData.get('default_platform') as string)?.trim() ?? ''
  const hashtagLimit = parseInt(formData.get('hashtag_limit') as string, 10)

  const supabase = await createServerClient()
  await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'default_platform', value_json: platform, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'hashtag_limit', value_json: isNaN(hashtagLimit) ? 10 : hashtagLimit, updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )

  redirect('/app/settings?tab=publishing&saved=1')
}

export async function saveAISettings(formData: FormData) {
  const ollamaModel = (formData.get('ollama_model') as string)?.trim()
  const whisperModel = (formData.get('whisper_model') as string)?.trim()

  if (!ollamaModel) redirect('/app/settings?tab=ai&error=invalid')

  const supabase = await createServerClient()
  await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'ollama_model', value_json: ollamaModel, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'whisper_model', value_json: whisperModel || 'base', updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'settings/ai',
    message: `AI settings updated: ollama_model="${ollamaModel}", whisper_model="${whisperModel}"`,
  })

  redirect('/app/settings?tab=ai&saved=1')
}

export async function clearLogs() {
  const supabase = await createServerClient()
  await supabase.from('logs').delete().eq('workspace_id', WORKSPACE_ID)
  redirect('/app/settings?tab=maintenance&saved=1')
}
