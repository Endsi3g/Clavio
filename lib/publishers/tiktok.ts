export interface TikTokPostPayload {
  title: string
  description: string
  mediaUrl: string
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'
  disableDuet?: boolean
  disableComment?: boolean
}

export async function publishToTikTok(
  accessToken: string,
  payload: TikTokPostPayload
): Promise<{ postId: string; shareUrl: string }> {
  // Step 1: Initialize upload
  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: payload.description || payload.title,
        privacy_level: payload.privacyLevel ?? 'PUBLIC_TO_EVERYONE',
        disable_duet: payload.disableDuet ?? false,
        disable_comment: payload.disableComment ?? false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: payload.mediaUrl,
      },
    }),
  })

  if (!initRes.ok) throw new Error(`TikTok init failed: ${await initRes.text()}`)
  const { data } = await initRes.json()
  const publishId: string = data.publish_id

  // Step 2: Poll for completion
  const postId = await waitForTikTokPublish(accessToken, publishId)
  return { postId, shareUrl: `https://www.tiktok.com/@me/video/${postId}` }
}

async function waitForTikTokPublish(accessToken: string, publishId: string, maxWait = 120_000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    })
    const { data } = await res.json()
    if (data.status === 'PUBLISH_COMPLETE') return data.publicaly_available_post_id?.[0] ?? publishId
    if (data.status === 'FAILED') throw new Error(`TikTok publish failed: ${data.fail_reason}`)
    await new Promise((r) => setTimeout(r, 5_000))
  }
  throw new Error('TikTok publish timed out')
}
