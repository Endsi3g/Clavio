'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Film, Loader2, Wand2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  clipId: string
}

export function RenderClipButton({ clipId }: Props) {
  const router = useRouter()
  const [rendering, setRendering] = useState(false)

  async function handleRender(engine: 'remotion' | 'clipify' = 'remotion') {
    setRendering(true)
    try {
      const res = await fetch('/api/videos/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clip_id: clipId,
          engine: engine
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Render failed')
      toast.success(`${engine === 'clipify' ? 'Magic Reframing' : 'Render'} job started`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Render failed')
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-7 gap-1 rounded-r-none border-r-0"
        onClick={() => handleRender('remotion')}
        disabled={rendering}
      >
        {rendering ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Film className="h-3 w-3" />
        )}
        {rendering ? 'Starting…' : 'Render'}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={rendering}>
          <Button variant="outline" size="sm" className="h-7 w-6 p-0 rounded-l-none border-l-slate-200">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleRender('remotion')} className="gap-2 text-xs">
            <Film className="h-3.5 w-3.5" />
            Remotion (Basic)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRender('clipify')} className="gap-2 text-xs">
            <Wand2 className="h-3.5 w-3.5 text-blue-500" />
            Magic Reframing (Clipify)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
