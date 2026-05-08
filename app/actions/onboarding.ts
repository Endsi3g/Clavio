'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

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

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'onboarding',
      message: 'Onboarding wizard completed',
      payload_json: { completed_at: new Date().toISOString() },
    })

    revalidatePath('/app/dashboard')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
