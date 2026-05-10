'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

interface Props {
  postId: string
  size?: 'sm' | 'default'
}

export function PublishPostButton({ postId, size = 'sm' }: Props) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Publish failed')
      toast.success('Publish triggered via n8n')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Button
      size={size}
      onClick={handlePublish}
      disabled={publishing}
      className="gap-1.5 bg-green-500 hover:bg-green-600"
    >
      {publishing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Send className="h-3.5 w-3.5" />
      )}
      {publishing ? 'Publishing…' : 'Publish now'}
    </Button>
  )
}
