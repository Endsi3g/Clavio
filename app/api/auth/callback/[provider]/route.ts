import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  
  // This is a simulated OAuth callback.
  // In a real scenario, this would exchange an authorization code for an access token.
  
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  const supabase = await createServerClient()
  
  try {
    // Insert the integration status as connected
    await supabase
      .from('integrations')
      .upsert({
        workspace_id: WORKSPACE_ID,
        provider: provider,
        status: 'connected',
        config: { mock_token: `mock_access_token_${provider}_${Date.now()}` },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workspace_id,provider'
      })

    // Log the action
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'auth',
      message: `Successfully connected ${provider} via mock OAuth flow`,
      metadata: { provider }
    })

  } catch (err) {
    console.error('Failed to save mock integration', err)
  }

  // Redirect back to integrations page
  return NextResponse.redirect(new URL('/app/integrations', request.url))
}
