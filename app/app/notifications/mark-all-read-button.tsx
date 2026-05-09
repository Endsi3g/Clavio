'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function MarkAllReadButton({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function markAll() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('workspace_id', workspaceId)
      .eq('is_read', false)
    setLoading(false)
    setDone(true)
    // Refresh page to reflect new counts
    window.location.reload()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={markAll}
      disabled={loading || done}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CheckCheck className="h-3 w-3" />
      )}
      Mark all read
    </Button>
  )
}
