'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mic, Scissors, Loader2, Sparkles } from 'lucide-react'

interface Props {
  videoId: string
  hasTranscript: boolean
}

export function VideoActions({ videoId, hasTranscript }: Props) {
  const router = useRouter()
  const [transcribing, setTranscribing] = useState(false)
  const [detecting, setDetecting] = useState(false)

  async function handleTranscribe() {
    setTranscribing(true)
    try {
      const res = await fetch('/api/videos/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Transcription failed')
      toast.success('Transcription completed')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transcription failed')
    } finally {
      setTranscribing(false)
    }
  }

  async function handleDetectClips() {
    if (!hasTranscript) {
      toast.error('Run transcription first before detecting clips')
      return
    }
    setDetecting(true)
    try {
      const res = await fetch('/api/videos/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Clip detection failed')
      const n = json.data?.length ?? 0
      toast.success(`${n} clip${n !== 1 ? 's' : ''} detected`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Clip detection failed')
    } finally {
      setDetecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleTranscribe}
        disabled={transcribing || detecting}
      >
        {transcribing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
        {transcribing ? 'Transcribing…' : 'Transcribe'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleDetectClips}
        disabled={transcribing || detecting}
      >
        {detecting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Scissors className="h-3.5 w-3.5" />
        )}
        {detecting ? 'Detecting…' : 'Detect clips'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
        onClick={() => toast.info('Clipify engine is being initialized. This will use AI to find punchlines and reframe the video.')}
        disabled={transcribing || detecting}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Clipify
      </Button>
    </div>
  )
}
