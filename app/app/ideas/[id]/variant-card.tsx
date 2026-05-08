'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Check, X, Loader2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { approveVariantAndDraft, rejectVariant } from '@/app/actions/idea-variants'
import { toast } from 'sonner'
import Link from 'next/link'
import type { IdeaVariant } from '@/lib/types'

export function VariantCard({ variant, ideaId }: { variant: IdeaVariant; ideaId: string }) {
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [draftPostId, setDraftPostId] = useState<string | null>(null)

  const isActive = variant.status !== 'archived'

  async function handleApprove() {
    setApproving(true)
    const res = await approveVariantAndDraft(variant.id, ideaId)
    setApproving(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      setDraftPostId(res.postId ?? null)
      toast.success('Draft post created from variant')
    }
  }

  async function handleReject() {
    setRejecting(true)
    await rejectVariant(variant.id, ideaId)
    setRejecting(false)
    toast.info('Variant archived')
  }

  return (
    <Card className={variant.status === 'archived' ? 'opacity-50' : ''}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {variant.variant_type ?? 'Variant'}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge status={variant.status} />
            {isActive && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs gap-1 text-red-600 hover:bg-red-50 border-red-200"
                  onClick={handleReject}
                  disabled={rejecting || approving}
                >
                  {rejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                >
                  {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Use as draft
                </Button>
              </div>
            )}
          </div>
        </div>
        {variant.hook && (
          <p className="text-sm font-medium text-slate-900">Hook: {variant.hook}</p>
        )}
        {variant.script && (
          <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">
            {variant.script}
          </p>
        )}
        {variant.cta && (
          <p className="text-xs text-slate-500">CTA: {variant.cta}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono">
            {formatDistanceToNow(new Date(variant.created_at), { addSuffix: true })}
          </p>
          {draftPostId && (
            <Link
              href={`/app/publishing/${draftPostId}`}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View draft post
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
