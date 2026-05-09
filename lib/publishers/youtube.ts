export interface YouTubePostPayload {
  title: string
  description: string
  mediaUrl: string
  tags?: string[]
  privacyStatus?: 'public' | 'unlisted' | 'private'
  madeForKids?: boolean
}

export async function publishToYouTube(
  accessToken: string,
  payload: YouTubePostPayload
): Promise<{ videoId: string; url: string }> {
  // Step 1: Download media to buffer
  const mediaRes = await fetch(payload.mediaUrl)
  if (!mediaRes.ok) throw new Error('Failed to fetch media for YouTube upload')
  const mediaBuffer = await mediaRes.arrayBuffer()

  // Step 2: Insert video metadata
  const metaRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
        'X-Upload-Content-Length': String(mediaBuffer.byteLength),
      },
      body: JSON.stringify({
        snippet: {
          title: payload.title,
          description: payload.description,
          tags: payload.tags ?? [],
        },
        status: {
          privacyStatus: payload.privacyStatus ?? 'public',
          madeForKids: payload.madeForKids ?? false,
        },
      }),
    }
  )
  if (!metaRes.ok) throw new Error(`YouTube metadata upload failed: ${await metaRes.text()}`)

  const uploadUrl = metaRes.headers.get('Location')
  if (!uploadUrl) throw new Error('YouTube did not return upload URL')

  // Step 3: Upload video bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
      'Content-Length': String(mediaBuffer.byteLength),
    },
    body: mediaBuffer,
  })
  if (!uploadRes.ok) throw new Error(`YouTube video upload failed: ${await uploadRes.text()}`)

  const data = await uploadRes.json()
  const videoId: string = data.id
  return { videoId, url: `https://www.youtube.com/watch?v=${videoId}` }
}
