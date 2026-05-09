import { createServerClient } from '@/lib/supabase/server'
import { encryptToken, decryptToken } from '@/lib/crypto'

interface Integration {
  id: string
  provider: string
  access_token_enc: string | null
  refresh_token_enc: string | null
  token_expires_at: string | null
  config_json: Record<string, unknown> | null
}

const REFRESH_ENDPOINTS: Record<string, string> = {
  youtube: 'https://oauth2.googleapis.com/token',
  instagram: 'https://api.instagram.com/oauth/access_token',
  linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
  twitter: 'https://api.twitter.com/2/oauth2/token',
}

export async function refreshIfExpired(integration: Integration): Promise<string> {
  if (!integration.access_token_enc) throw new Error('No access token stored')

  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null
  const isExpired = expiresAt ? expiresAt < new Date(Date.now() + 60_000) : false

  if (!isExpired) return decryptToken(integration.access_token_enc)

  const refreshToken = integration.refresh_token_enc
    ? decryptToken(integration.refresh_token_enc)
    : null
  if (!refreshToken) throw new Error(`Token expired and no refresh token for ${integration.provider}`)

  const endpoint = REFRESH_ENDPOINTS[integration.provider]
  if (!endpoint) throw new Error(`No refresh endpoint for ${integration.provider}`)

  const clientId = process.env[`${integration.provider.toUpperCase()}_CLIENT_ID`]!
  const clientSecret = process.env[`${integration.provider.toUpperCase()}_CLIENT_SECRET`]!

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`Token refresh failed for ${integration.provider}: ${await res.text()}`)

  const data = await res.json()
  const newAccessToken: string = data.access_token
  const expiresIn: number = data.expires_in ?? 3600

  const supabase = await createServerClient()
  await supabase
    .from('integrations')
    .update({
      access_token_enc: encryptToken(newAccessToken),
      ...(data.refresh_token ? { refresh_token_enc: encryptToken(data.refresh_token) } : {}),
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq('id', integration.id)

  return newAccessToken
}
