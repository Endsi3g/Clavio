export interface TwitterPostPayload {
  text: string
  mediaUrl?: string
}

export async function publishToTwitter(
  accessToken: string,
  payload: TwitterPostPayload
): Promise<{ tweetId: string; url: string }> {
  let mediaId: string | undefined

  // Upload media if present
  if (payload.mediaUrl) {
    mediaId = await uploadTwitterMedia(accessToken, payload.mediaUrl)
  }

  const body: Record<string, unknown> = { text: payload.text }
  if (mediaId) {
    body.media = { media_ids: [mediaId] }
  }

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Twitter post failed: ${await res.text()}`)

  const { data } = await res.json()
  const tweetId: string = data.id
  return { tweetId, url: `https://twitter.com/i/web/status/${tweetId}` }
}

async function uploadTwitterMedia(accessToken: string, mediaUrl: string): Promise<string> {
  const mediaRes = await fetch(mediaUrl)
  if (!mediaRes.ok) throw new Error('Failed to fetch media for Twitter')
  const blob = await mediaRes.blob()
  const mediaData = Buffer.from(await blob.arrayBuffer()).toString('base64')

  const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      media_data: mediaData,
      media_category: blob.type.startsWith('video') ? 'tweet_video' : 'tweet_image',
    }),
  })

  if (!uploadRes.ok) throw new Error(`Twitter media upload failed: ${await uploadRes.text()}`)
  const { media_id_string } = await uploadRes.json()
  return media_id_string
}
