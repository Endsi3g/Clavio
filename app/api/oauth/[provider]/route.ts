import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const OAUTH_CONFIGS: Record<string, {
  authUrl: string
  clientIdKey: string
  scopes: string
  extras?: Record<string, string>
}> = {
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientIdKey: 'YOUTUBE_CLIENT_ID',
    scopes: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    extras: { access_type: 'offline', prompt: 'consent' },
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    clientIdKey: 'INSTAGRAM_APP_ID',
    scopes: 'instagram_basic,instagram_content_publish,instagram_manage_insights',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    clientIdKey: 'TIKTOK_CLIENT_KEY',
    scopes: 'user.info.basic,video.publish,video.upload',
    extras: { response_type: 'code' },
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientIdKey: 'LINKEDIN_CLIENT_ID',
    scopes: 'openid profile email w_member_social',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientIdKey: 'TWITTER_CLIENT_ID',
    scopes: 'tweet.read tweet.write users.read offline.access',
    extras: { code_challenge: 'challenge', code_challenge_method: 'plain' },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const config = OAUTH_CONFIGS[provider]
  if (!config) return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const clientId = process.env[config.clientIdKey]
  if (!clientId) return NextResponse.json({ error: `${config.clientIdKey} not configured` }, { status: 500 })

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin}/api/oauth/${provider}/callback`
  const state = Buffer.from(JSON.stringify({ userId: user.id, ts: Date.now() })).toString('base64url')

  const params2 = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: config.scopes,
    response_type: 'code',
    state,
    ...config.extras,
  })

  return NextResponse.redirect(`${config.authUrl}?${params2}`)
}
