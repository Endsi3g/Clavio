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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, File, X, Image as ImageIcon } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadAssetDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('logo')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (f) {
      setFile(f)
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ''))
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name || file.name)
      formData.append('type', type)

      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Upload failed')
      }

      toast.success(`"${name || file.name}" uploaded successfully`)
      onOpenChange(false)
      setFile(null)
      setName('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload asset</DialogTitle>
          <DialogDescription>
            Add brand assets, b-roll, or music to your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors",
              file ? "border-blue-200 bg-blue-50/50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              title="Select file"
              aria-label="Select asset file"
            />
            {file ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <File className="h-8 w-8 text-blue-500 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            ) : (
              <div className="py-4">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">Click to select a file</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Asset Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Logo White"
                disabled={uploading}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="font">Font</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="b-roll">B-Roll</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="thumbnail">Thumbnail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {uploading && <Progress value={progress} className="h-1.5" />}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-500 hover:bg-blue-600">
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
