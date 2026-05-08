'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

type UpsertResult = { success: true } | { success: false; error: string }

async function upsertSetting(key: string, value: unknown): Promise<UpsertResult> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('settings')
    .upsert(
      { workspace_id: WORKSPACE_ID, key, value_json: value, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id,key' }
    )
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function saveWorkspaceSettings(formData: FormData): Promise<UpsertResult> {
  const name = (formData.get('workspace_name') as string)?.trim()
  const locale = (formData.get('workspace_locale') as string)?.trim()

  if (!name) return { success: false, error: 'Workspace name is required' }
  if (!['en', 'fr'].includes(locale)) return { success: false, error: 'Locale must be "en" or "fr"' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'workspace_name', value_json: name, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'workspace_locale', value_json: locale, updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )
  if (error) return { success: false, error: error.message }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'settings/workspace',
    message: `Workspace settings updated: name="${name}", locale="${locale}"`,
  })

  revalidatePath('/app/settings')
  return { success: true }
}

export async function savePublishingSettings(formData: FormData): Promise<UpsertResult> {
  const platform = (formData.get('default_platform') as string)?.trim() ?? ''
  const hashtagLimit = parseInt(formData.get('hashtag_limit') as string, 10)

  const supabase = await createServerClient()
  const { error } = await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'default_platform', value_json: platform, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'hashtag_limit', value_json: isNaN(hashtagLimit) ? 10 : hashtagLimit, updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )
  if (error) return { success: false, error: error.message }

  revalidatePath('/app/settings')
  return { success: true }
}

export async function saveAISettings(formData: FormData): Promise<UpsertResult> {
  const ollamaModel = (formData.get('ollama_model') as string)?.trim()
  const whisperModel = (formData.get('whisper_model') as string)?.trim()

  if (!ollamaModel) return { success: false, error: 'Ollama model name is required' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('settings').upsert(
    [
      { workspace_id: WORKSPACE_ID, key: 'ollama_model', value_json: ollamaModel, updated_at: new Date().toISOString() },
      { workspace_id: WORKSPACE_ID, key: 'whisper_model', value_json: whisperModel || 'base', updated_at: new Date().toISOString() },
    ],
    { onConflict: 'workspace_id,key' }
  )
  if (error) return { success: false, error: error.message }

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'settings/ai',
    message: `AI settings updated: ollama_model="${ollamaModel}", whisper_model="${whisperModel}"`,
  })

  revalidatePath('/app/settings')
  return { success: true }
}

export async function clearLogs(): Promise<UpsertResult> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('workspace_id', WORKSPACE_ID)
  if (error) return { success: false, error: error.message }
  revalidatePath('/app/logs')
  revalidatePath('/app/settings')
  return { success: true }
}
