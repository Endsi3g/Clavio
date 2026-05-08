'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, Film, X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadVideoDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (f) selectFile(f)
  }

  function selectFile(f: File) {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) selectFile(f)
    else toast.error('Please drop a video file')
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title || file.name)

      setProgress(30)

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(85)
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      setProgress(100)
      toast.success(`"${title || file.name}" uploaded successfully`)
      onOpenChange(false)
      setFile(null)
      setTitle('')
      setProgress(0)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleClose() {
    if (uploading) return
    onOpenChange(false)
    setFile(null)
    setTitle('')
    setProgress(0)
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload video</DialogTitle>
          <DialogDescription>
            MP4, WebM, MOV — max 500 MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Drop zone */}
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors p-6 text-center ${
              dragging
                ? 'border-blue-400 bg-blue-50'
                : file
                ? 'border-blue-200 bg-blue-50/50'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Film className="h-8 w-8 text-blue-500 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fileSizeMB} MB</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setTitle('') }}
                    className="p-1 rounded hover:bg-slate-200 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            ) : (
              <div className="py-4">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  Drag & drop or click to select
                </p>
                <p className="text-xs text-slate-400 mt-1">MP4, WebM, MOV, AVI</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-title">Title</Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              disabled={uploading}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-500 hover:bg-blue-600 gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
