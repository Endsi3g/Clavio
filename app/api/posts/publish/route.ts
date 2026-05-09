import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { refreshIfExpired } from '@/lib/token-refresh'
import { publishToYouTube } from '@/lib/publishers/youtube'
import { publishToInstagram } from '@/lib/publishers/instagram'
import { publishToTikTok } from '@/lib/publishers/tiktok'
import { publishToLinkedIn } from '@/lib/publishers/linkedin'
import { publishToTwitter } from '@/lib/publishers/twitter'
import { PublishPostSchema } from '@/lib/schemas/post.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = PublishPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { post_id } = parsed.data

    const supabase = await createServerClient()

    // Fetch post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (postError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (!['draft', 'scheduled', 'failed'].includes(post.status)) {
      return NextResponse.json({ error: `Cannot publish from status: ${post.status}` }, { status: 400 })
    }

    // Fetch platform integration
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('provider', post.platform)
      .eq('status', 'connected')
      .maybeSingle()

    // Log workflow start
    const { data: wfRun } = await supabase
      .from('workflow_runs')
      .insert({
        workspace_id: WORKSPACE_ID,
        workflow_name: `publish_${post.platform}`,
        entity_type: 'post',
        entity_id: post_id,
        status: 'processing',
        started_at: new Date().toISOString(),
        input_json: { post_id, platform: post.platform },
      })
      .select()
      .single()

    await supabase.from('posts').update({ status: 'processing' }).eq('id', post_id)

    try {
      let result: { url?: string; videoId?: string; postId?: string; tweetId?: string; shareUrl?: string } = {}

      if (!integration) {
        throw new Error(`No connected integration for platform: ${post.platform}. Connect it in Integrations.`)
      }

      const accessToken = await refreshIfExpired(integration)

      switch (post.platform) {
        case 'youtube':
          result = await publishToYouTube(accessToken, {
            title: post.title,
            description: post.caption ?? '',
            mediaUrl: post.media_url ?? '',
            tags: post.hashtags?.split(/\s+/).filter(Boolean),
          })
          break

        case 'instagram': {
          const igAccountId = integration.platform_user_id ?? ''
          result = await publishToInstagram(accessToken, {
            caption: `${post.caption ?? ''}\n\n${post.hashtags ?? ''}`.trim(),
            mediaUrl: post.media_url ?? '',
            igAccountId,
          })
          break
        }

        case 'tiktok':
          result = await publishToTikTok(accessToken, {
            title: post.title,
            description: post.caption ?? '',
            mediaUrl: post.media_url ?? '',
          })
          break

        case 'linkedin': {
          const authorUrn = `urn:li:person:${integration.platform_user_id}`
          result = await publishToLinkedIn(accessToken, {
            text: `${post.caption ?? post.title}\n\n${post.hashtags ?? ''}`.trim(),
            mediaUrl: post.media_url ?? undefined,
            authorUrn,
          })
          break
        }

        case 'twitter':
          result = await publishToTwitter(accessToken, {
            text: `${post.caption ?? post.title} ${post.hashtags ?? ''}`.trim().slice(0, 280),
            mediaUrl: post.media_url ?? undefined,
          })
          break

        default:
          throw new Error(`Unsupported platform: ${post.platform}`)
      }

      const publishedUrl = result.url ?? result.shareUrl ?? null

      // Mark post published
      await supabase.from('posts').update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_url: publishedUrl,
      }).eq('id', post_id)

      // Complete workflow run
      await supabase.from('workflow_runs').update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        output_json: result,
      }).eq('id', wfRun?.id)

      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'info',
        source: 'posts/publish',
        entity_type: 'post',
        entity_id: post_id,
        message: `Published to ${post.platform}: "${post.title}"`,
        payload_json: { url: publishedUrl },
      })

      return NextResponse.json({ success: true, url: publishedUrl })
    } catch (publishErr) {
      const msg = publishErr instanceof Error ? publishErr.message : String(publishErr)

      await supabase.from('posts').update({ status: 'failed' }).eq('id', post_id)
      await supabase.from('workflow_runs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: msg,
      }).eq('id', wfRun?.id)

      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'error',
        source: 'posts/publish',
        entity_type: 'post',
        entity_id: post_id,
        message: `Publish failed for ${post.platform}: ${msg}`,
      })

      return NextResponse.json({ error: msg }, { status: 500 })
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
