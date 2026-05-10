'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { GenerateIdeasDialog } from '@/components/ideas/generate-ideas-dialog'

export function IdeasGenerateButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Sparkles className="h-3.5 w-3.5" />
        Generate
      </Button>
      <GenerateIdeasDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

