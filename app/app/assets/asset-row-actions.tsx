'use client'

import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash, Link as LinkIcon, ExternalLink } from 'lucide-react'

interface Props {
  assetId: string
  assetUrl: string
}

export function AssetRowActions({ assetId, assetUrl }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      })

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
      <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
        <Trash className="mr-2 h-3.5 w-3.5" />
        Delete
      </DropdownMenuItem>
    </>
  )
}
