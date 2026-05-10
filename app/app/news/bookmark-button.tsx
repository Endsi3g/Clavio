'use client'

import { useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { bookmarkArticle } from './actions'

type Props = {
  title: string
  url: string
  description?: string | null
  imageUrl?: string | null
  source: string
}

export function BookmarkButton({ title, url, description, imageUrl, source }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => {
        startTransition(() => bookmarkArticle(fd))
      }}
    >
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="url" value={url} />
      <input type="hidden" name="description" value={description ?? ''} />
      <input type="hidden" name="image_url" value={imageUrl ?? ''} />
      <input type="hidden" name="source" value={source} />
      <button
        type="submit"
        disabled={pending}
        title="Ajouter aux favoris"
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-50"
      >
        <Bookmark className="h-3.5 w-3.5" />
        {pending ? '…' : 'Save'}
      </button>
    </form>
  )
}
