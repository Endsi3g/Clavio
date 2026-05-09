export interface LinkedInPostPayload {
  text: string
  mediaUrl?: string
  authorUrn: string // urn:li:person:{id}
}

export async function publishToLinkedIn(
  accessToken: string,
  payload: LinkedInPostPayload
): Promise<{ postId: string; url: string }> {
  const body: Record<string, unknown> = {
    author: payload.authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: payload.text },
        shareMediaCategory: payload.mediaUrl ? 'IMAGE' : 'NONE',
        ...(payload.mediaUrl
          ? {
              media: [
                {
                  status: 'READY',
                  originalUrl: payload.mediaUrl,
                },
              ],
            }
          : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`LinkedIn post failed: ${await res.text()}`)

  const postId = res.headers.get('x-restli-id') ?? ''
  return {
    postId,
    url: `https://www.linkedin.com/feed/update/${postId}/`,
  }
}
