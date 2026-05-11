'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'uploading' | 'analysing' | 'done' | 'error'

const STATUS_MESSAGE: Record<Status, string> = {
  idle: '',
  uploading: 'Uploading file…',
  analysing: 'AI is analysing the document…',
  done: 'Template created successfully!',
  error: 'Something went wrong. Please try again.',
}

export function ImportTemplateDialog() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [fileName, setFileName] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  async function handleImport() {
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/templates/import', {
        method: 'POST',
        body: formData,
      })

      setStatus('analysing')

      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('done')
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
        setFileName('')
        startTransition(() => router.refresh())
      }, 1500)
    } catch {
      setStatus('error')
    }
  }

  const busy = status === 'uploading' || status === 'analysing'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) { setOpen(v); setStatus('idle'); setFileName('') } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Upload className="h-4 w-4" />
          Import file
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import a template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-500">
            Upload a PDF, TXT, or DOCX file. The AI will extract a reusable content template structure automatically.
          </p>

          {/* Drop zone */}
          <label
            htmlFor="template-file-input"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            <FileText className="h-8 w-8 text-slate-300" />
            {fileName ? (
              <span className="text-sm font-medium text-slate-700 text-center">{fileName}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-600">Click to select a file</span>
                <span className="text-xs text-slate-400">PDF, TXT, DOCX — max 10 MB</span>
              </>
            )}
            <input
              id="template-file-input"
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx"
              className="sr-only"
              onChange={handleFileChange}
              disabled={busy}
            />
          </label>

          {/* Status */}
          {status !== 'idle' && (
            <div className="flex items-center gap-2 text-sm">
              {busy && <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />}
              {status === 'done' && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
              {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
              <span
                className={
                  status === 'done'
                    ? 'text-emerald-700'
                    : status === 'error'
                    ? 'text-red-700'
                    : 'text-slate-600'
                }
              >
                {STATUS_MESSAGE[status]}
              </span>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleImport}
            disabled={!fileName || busy}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status === 'uploading' ? 'Uploading…' : 'Analysing…'}
              </>
            ) : (
              'Import & analyse'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
