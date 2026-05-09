'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface UseTemplateButtonProps {
  title: string
  description: string
  format: string
  platform: string
}

export function UseTemplateButton({ title, description, format, platform }: UseTemplateButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUse() {
    setLoading(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[${format}] ${title}`,
          description,
          format,
          platform,
          source_type: 'template',
        }),
      })
      const json = await res.json()
      if (res.ok && json.data?.id) {
        router.push(`/app/ideas/${json.data.id}`)
      } else {
        console.error('Failed to create idea from template', json.error)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full text-xs h-8 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
      onClick={handleUse}
      disabled={loading}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Use template
    </Button>
  )
}
