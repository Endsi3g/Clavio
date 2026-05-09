'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Send } from 'lucide-react'
import { approveClip, rejectClip, sendClipToPublish } from '@/app/actions/clips'
import { toast } from 'sonner'

interface Props {
  clipId: string
  videoId: string
  status: string
}

export function ClipDetailActions({ clipId, videoId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const result = await approveClip(clipId)
    if (result.success) {
      toast.success('Clip approved')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to approve clip')
    }
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    const result = await rejectClip(clipId)
    if (result.success) {
      toast.success('Clip archived')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to reject clip')
    }
    setLoading(false)
  }

  async function handleSendToPublish() {
    setLoading(true)
    const result = await sendClipToPublish(clipId, videoId)
    if ('postId' in result && result.postId) {
      toast.success('Draft post created')
      router.push(`/app/publishing/${result.postId}`)
    } else {
      toast.error('error' in result ? result.error ?? 'Failed' : 'Failed')
    }
    setLoading(false)
  }

  if (status === 'archived') return null

  return (
    <div className="flex items-center gap-2 shrink-0">
      {status !== 'review' && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleApprove}
          disabled={loading}
        >
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          Approve
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-red-600 hover:text-red-700"
        onClick={handleReject}
        disabled={loading}
      >
        <XCircle className="h-3.5 w-3.5" />
        Reject
      </Button>
      {(status === 'review' || status === 'draft') && (
        <Button
          size="sm"
          className="gap-1.5 bg-blue-500 hover:bg-blue-600"
          onClick={handleSendToPublish}
          disabled={loading}
        >
          <Send className="h-3.5 w-3.5" />
          Send to publish
        </Button>
      )}
    </div>
  )
}
