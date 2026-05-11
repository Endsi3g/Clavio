'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type OnboardingResult = { success: true } | { success: false; error: string }

export async function completeOnboarding(): Promise<OnboardingResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          workspace_id: WORKSPACE_ID,
          key: 'onboarding_completed',
          value_json: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,key' }
      )

    if (error) return { success: false, error: error.message }

    const cookieStore = await cookies()
    cookieStore.set('onboarding_completed', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    revalidatePath('/app/dashboard')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function saveOnboardingData(data: {
  workspaceName: string
  workspaceType: 'solo' | 'team' | 'agency'
  language: string
  timezone: string
  newsCategories: string[]
  newsKeywords: string[]
  plan: 'free' | 'pro' | 'agency'
}): Promise<OnboardingResult> {
  try {
    const supabase = await createServerClient()

    await supabase
      .from('workspaces')
      .update({ name: data.workspaceName })
      .eq('id', WORKSPACE_ID)

    await supabase
      .from('news_preferences')
      .upsert(
        {
          workspace_id: WORKSPACE_ID,
          categories: data.newsCategories,
          keywords: data.newsKeywords,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id' }
      )

    const settingsRows = [
      { key: 'onboarding_completed', value_json: true },
      { key: 'workspace_type', value_json: data.workspaceType },
      { key: 'language', value_json: data.language },
      { key: 'timezone', value_json: data.timezone },
      { key: 'plan', value_json: data.plan },
    ]

    for (const row of settingsRows) {
      await supabase.from('settings').upsert(
        {
          workspace_id: WORKSPACE_ID,
          key: row.key,
          value_json: row.value_json,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,key' }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('onboarding_completed', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'onboarding',
      message: 'Onboarding wizard completed',
      payload_json: {
        workspace_name: data.workspaceName,
        plan: data.plan,
        completed_at: new Date().toISOString(),
      },
    })

    revalidatePath('/app/dashboard')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
