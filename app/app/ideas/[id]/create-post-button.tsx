'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { NewPostDialog } from '@/components/publishing/new-post-dialog'

interface Props {
  ideaId: string
  ideaTitle: string
  ideaPlatform?: string | null
}

export function CreatePostFromIdeaButton({ ideaId, ideaTitle, ideaPlatform }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        className="gap-1.5 bg-blue-500 hover:bg-blue-600"
        onClick={() => setOpen(true)}
      >
        <Send className="h-3.5 w-3.5" />
        Create post
      </Button>
      <NewPostDialog
        open={open}
        onOpenChange={setOpen}
        defaultTitle={ideaTitle}
        defaultPlatform={ideaPlatform ?? 'instagram'}
        ideaId={ideaId}
      />
    </>
  )
}
