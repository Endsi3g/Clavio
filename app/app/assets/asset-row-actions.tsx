'use client'

import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash, Link as LinkIcon, ExternalLink } from 'lucide-react'

interface Props {
  assetId: string
  assetName: string
  assetUrl: string
}

export function AssetRowActions({ assetId, assetName, assetUrl }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleDelete() {
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Delete failed')
      }
      toast.success('Asset deleted')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(assetUrl)
    toast.success('URL copied to clipboard')
  }

  return (
    <>
      <DropdownMenuItem asChild>
        <a href={assetUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          View
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={copyUrl}>
        <LinkIcon className="mr-2 h-3.5 w-3.5" />
        Copy URL
      </DropdownMenuItem>
      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteOpen(true)}>
        <Trash className="mr-2 h-3.5 w-3.5" />
        Delete
      </DropdownMenuItem>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{assetName}"</strong> will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
