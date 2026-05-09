export interface InstagramPostPayload {
  caption: string
  mediaUrl: string
  mediaType?: 'IMAGE' | 'VIDEO' | 'REELS'
  igAccountId: string
}

export async function publishToInstagram(
  accessToken: string,
  payload: InstagramPostPayload
): Promise<{ postId: string; url: string }> {
  const mediaType = payload.mediaType ?? 'IMAGE'

  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    access_token: accessToken,
    caption: payload.caption,
  })

  if (mediaType === 'VIDEO' || mediaType === 'REELS') {
    containerParams.set('video_url', payload.mediaUrl)
    containerParams.set('media_type', mediaType)
  } else {
    containerParams.set('image_url', payload.mediaUrl)
  }

  const containerRes = await fetch(
    `https://graph.instagram.com/v19.0/${payload.igAccountId}/media?${containerParams}`,
    { method: 'POST' }
  )
  if (!containerRes.ok) throw new Error(`Instagram container failed: ${await containerRes.text()}`)

  const { id: containerId } = await containerRes.json()

  // Step 2: For video, wait for processing
  if (mediaType === 'VIDEO' || mediaType === 'REELS') {
    await waitForInstagramVideo(accessToken, containerId)
  }

  // Step 3: Publish the container
  const publishRes = await fetch(
    `https://graph.instagram.com/v19.0/${payload.igAccountId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        access_token: accessToken,
        creation_id: containerId,
      }),
    }
  )
  if (!publishRes.ok) throw new Error(`Instagram publish failed: ${await publishRes.text()}`)

  const { id: postId } = await publishRes.json()
  return { postId, url: `https://www.instagram.com/p/${postId}/` }
}

async function waitForInstagramVideo(accessToken: string, containerId: string, maxWait = 60_000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    const res = await fetch(
      `https://graph.instagram.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const { status_code } = await res.json()
    if (status_code === 'FINISHED') return
    if (status_code === 'ERROR') throw new Error('Instagram video processing failed')
    await new Promise((r) => setTimeout(r, 5_000))
  }
  throw new Error('Instagram video processing timed out')
}
