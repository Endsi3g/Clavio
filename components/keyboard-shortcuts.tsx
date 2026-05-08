'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SHORTCUTS: { keys: string; label: string; path: string }[] = [
  { keys: '⌘⇧D', label: 'Dashboard', path: '/app/dashboard' },
  { keys: '⌘⇧I', label: 'Ideas', path: '/app/ideas' },
  { keys: '⌘⇧V', label: 'Videos', path: '/app/videos' },
  { keys: '⌘⇧P', label: 'Publishing', path: '/app/publishing' },
  { keys: '⌘⇧A', label: 'Analytics', path: '/app/analytics' },
  { keys: '⌘⇧C', label: 'Clips', path: '/app/clips' },
]

const KEY_MAP: Record<string, string> = {
  d: '/app/dashboard',
  i: '/app/ideas',
  v: '/app/videos',
  p: '/app/publishing',
  a: '/app/analytics',
  c: '/app/clips',
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' ||
    (document.activeElement as HTMLElement)?.isContentEditable === true
}

export function KeyboardShortcuts() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘⇧<key> navigation shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        const path = KEY_MAP[e.key.toLowerCase()]
        if (path) {
          e.preventDefault()
          router.push(path)
          return
        }
      }

      // '?' opens shortcuts modal when no input is focused
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
              <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {keys}
              </kbd>
            </div>
          ))}
          <div className="col-span-2 border-t pt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-slate-700 dark:text-slate-300">Show shortcuts</span>
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              ?
            </kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
