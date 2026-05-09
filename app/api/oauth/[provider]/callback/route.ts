import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto'
import { WORKSPACE_ID } from '@/lib/types'

const TOKEN_ENDPOINTS: Record<string, string> = {
  youtube: 'https://oauth2.googleapis.com/token',
  instagram: 'https://api.instagram.com/oauth/access_token',
  tiktok: 'https://open.tiktokapis.com/v2/oauth/token/',
  linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
  twitter: 'https://api.twitter.com/2/oauth2/token',
}

const CLIENT_ID_KEYS: Record<string, string> = {
  youtube: 'YOUTUBE_CLIENT_ID',
  instagram: 'INSTAGRAM_APP_ID',
  tiktok: 'TIKTOK_CLIENT_KEY',
  linkedin: 'LINKEDIN_CLIENT_ID',
  twitter: 'TWITTER_CLIENT_ID',
}

const CLIENT_SECRET_KEYS: Record<string, string> = {
  youtube: 'YOUTUBE_CLIENT_SECRET',
  instagram: 'INSTAGRAM_APP_SECRET',
  tiktok: 'TIKTOK_CLIENT_SECRET',
  linkedin: 'LINKEDIN_CLIENT_SECRET',
  twitter: 'TWITTER_CLIENT_SECRET',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/app/integrations?error=${encodeURIComponent(error)}`, request.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/app/integrations?error=no_code', request.url))
  }

  const clientId = process.env[CLIENT_ID_KEYS[provider]]!
  const clientSecret = process.env[CLIENT_SECRET_KEYS[provider]]!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? url.origin}/api/oauth/${provider}/callback`
  const tokenEndpoint = TOKEN_ENDPOINTS[provider]

  try {
    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        // Twitter PKCE
        ...(provider === 'twitter' ? { code_verifier: 'challenge' } : {}),
      }),
    })

    if (!tokenRes.ok) throw new Error(await tokenRes.text())
    const tokenData = await tokenRes.json()

    const accessToken: string = tokenData.access_token
    const refreshToken: string | undefined = tokenData.refresh_token
    const expiresIn: number = tokenData.expires_in ?? 3600

    // Get platform user info
    const platformUserId = await getPlatformUserId(provider, accessToken)

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('integrations')
      .upsert({
        workspace_id: WORKSPACE_ID,
        provider,
        status: 'connected',
        access_token_enc: encryptToken(accessToken),
        refresh_token_enc: refreshToken ? encryptToken(refreshToken) : null,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        platform_user_id: platformUserId,
        connected_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'workspace_id,provider' })

    return NextResponse.redirect(new URL(`/app/integrations?connected=${provider}`, request.url))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OAuth failed'
    return NextResponse.redirect(new URL(`/app/integrations?error=${encodeURIComponent(msg)}`, request.url))
  }
}

async function getPlatformUserId(provider: string, accessToken: string): Promise<string | null> {
  try {
    const endpoints: Record<string, { url: string; parse: (d: Record<string, unknown>) => string }> = {
      youtube: {
        url: 'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
        parse: (d) => (d.items as { id: string }[])?.[0]?.id ?? '',
      },
      instagram: {
        url: `https://graph.instagram.com/me?access_token=${accessToken}&fields=id`,
        parse: (d) => d.id as string,
      },
      linkedin: {
        url: 'https://api.linkedin.com/v2/userinfo',
        parse: (d) => d.sub as string,
      },
      twitter: {
        url: 'https://api.twitter.com/2/users/me',
        parse: (d) => (d.data as { id: string })?.id ?? '',
      },
    }
    const ep = endpoints[provider]
    if (!ep) return null
    const res = await fetch(ep.url, { headers: { Authorization: `Bearer ${accessToken}` } })
    const data = await res.json()
    return ep.parse(data)
  } catch {
    return null
  }
}
