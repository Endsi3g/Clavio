'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NewPostDialog } from '@/components/new-post-dialog'

export function NewPostButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        New post
      </Button>
      <NewPostDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
