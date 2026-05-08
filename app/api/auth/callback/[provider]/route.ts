import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

// OAuth callback endpoint.
// For local services (ollama, whisper, n8n, cobalt) there is no OAuth flow —
// we register them as connected using their configured env-var endpoint.
// For social platforms (youtube, tiktok, instagram, linkedin) a real OAuth
// code exchange must be implemented using the platform SDK. These are stubs.
const LOCAL_PROVIDERS = new Set(['ollama', 'whisper', 'n8n', 'cobalt', 'remotion', 'supabase'])

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const url = new URL(request.url)

  const supabase = await createServerClient()

  if (LOCAL_PROVIDERS.has(provider.toLowerCase())) {
    // Local services: just upsert as connected — no OAuth needed
    const { error } = await supabase.from('integrations').upsert(
      {
        workspace_id: WORKSPACE_ID,
        provider: provider.toLowerCase(),
        status: 'connected',
        config_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workspace_id,provider' }
    )

    if (error) {
      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'error',
        source: 'auth/callback',
        message: `Failed to register ${provider} integration: ${error.message}`,
      })
      return NextResponse.redirect(new URL('/app/integrations?error=db', request.url))
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'auth/callback',
      message: `Local service registered: ${provider}`,
    })

    return NextResponse.redirect(new URL('/app/integrations?connected=' + provider, request.url))
  }

  // Social platform OAuth — requires real code exchange
  const code = url.searchParams.get('code')
  if (!code) {
    // User cancelled or provider returned an error
    const oauthError = url.searchParams.get('error') ?? 'no_code'
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'warning',
      source: 'auth/callback',
      message: `OAuth cancelled or failed for ${provider}: ${oauthError}`,
    })
    return NextResponse.redirect(
      new URL(`/app/integrations?error=${encodeURIComponent(oauthError)}`, request.url)
    )
  }

  // TODO: exchange `code` for an access token using the platform's SDK.
  // Store the token securely in integrations.config_json (encrypted at rest).
  // Example for YouTube: use googleapis client_secret + redirect_uri.
  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'warning',
    source: 'auth/callback',
    message: `OAuth code received for ${provider} but token exchange is not yet implemented.`,
    payload_json: { provider },
  })

  await supabase.from('integrations').upsert(
    {
      workspace_id: WORKSPACE_ID,
      provider: provider.toLowerCase(),
      status: 'error',
      config_json: { error: 'token_exchange_not_implemented' },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'workspace_id,provider' }
  )

  return NextResponse.redirect(
    new URL(`/app/integrations?error=not_implemented&provider=${provider}`, request.url)
  )
}
