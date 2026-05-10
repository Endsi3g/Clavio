'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function WebhookCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Webhook URL copied.')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
      aria-label="Copy webhook URL"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}
