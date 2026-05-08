'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { UploadVideoDialog } from '@/components/upload-video-dialog'

export function VideosUploadButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600" onClick={() => setOpen(true)}>
        <Upload className="h-3.5 w-3.5" />
        Upload video
      </Button>
      <UploadVideoDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
