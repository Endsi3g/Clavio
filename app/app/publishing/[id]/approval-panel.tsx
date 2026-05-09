'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, MessageSquare, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  body: string
  author_name: string
  created_at: string
}

interface ApprovalPanelProps {
  postId: string
  initialApprovalStatus: string
  initialComments: Comment[]
}

const STATUS_CONFIG = {
  none: { label: 'No review', color: 'bg-slate-100 text-slate-500', icon: null },
  pending_review: { label: 'Pending review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  changes_requested: { label: 'Changes requested', color: 'bg-red-100 text-red-700', icon: XCircle },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
}

export function ApprovalPanel({ postId, initialApprovalStatus, initialComments }: ApprovalPanelProps) {
  const [approvalStatus, setApprovalStatus] = useState(initialApprovalStatus)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const updateApprovalStatus = async (status: string) => {
    setUpdatingStatus(true)
    await supabase
      .from('posts')
      .update({ approval_status: status, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('workspace_id', WORKSPACE_ID)

    const body =
      status === 'approved'
        ? '✅ Post approved for publishing.'
        : status === 'changes_requested'
        ? '❌ Changes requested.'
        : '🔄 Submitted for review.'

    const { data: comment } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, workspace_id: WORKSPACE_ID, author_name: 'System', body })
      .select()
      .single()

    setApprovalStatus(status)
    if (comment) setComments((prev) => [...prev, comment])
    setUpdatingStatus(false)
  }

  const submitComment = async () => {
    if (!newComment.trim() || submitting) return
    setSubmitting(true)

    const { data: comment } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        workspace_id: WORKSPACE_ID,
        author_name: 'Team member',
        body: newComment.trim(),
      })
      .select()
      .single()

    if (comment) setComments((prev) => [...prev, comment])
    setNewComment('')
    setSubmitting(false)
  }

  const statusConfig = STATUS_CONFIG[approvalStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.none
  const StatusIcon = statusConfig.icon

  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            Review
          </h3>
          <Badge className={cn('text-xs', statusConfig.color)}>
            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-b border-slate-100 space-y-2">
        {approvalStatus !== 'pending_review' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
            onClick={() => updateApprovalStatus('pending_review')}
            disabled={updatingStatus}
          >
            <Clock className="h-3.5 w-3.5" />
            Request review
          </Button>
        )}
        {approvalStatus !== 'approved' && (
          <Button
            size="sm"
            className="w-full h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => updateApprovalStatus('approved')}
            disabled={updatingStatus}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </Button>
        )}
        {approvalStatus !== 'changes_requested' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => updateApprovalStatus('changes_requested')}
            disabled={updatingStatus}
          >
            <XCircle className="h-3.5 w-3.5" />
            Request changes
          </Button>
        )}
      </div>

      {/* Comment thread */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {comments.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">{c.author_name}</span>
              <span className="text-[10px] text-slate-400">
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              {c.body}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Comment input */}
      <div className="px-4 py-3 border-t border-slate-200 space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment…"
          className="text-xs min-h-[72px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment()
          }}
        />
        <Button
          size="sm"
          className="w-full h-8 text-xs gap-1.5 bg-blue-500 hover:bg-blue-600"
          onClick={submitComment}
          disabled={submitting || !newComment.trim()}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </div>
  )
}
