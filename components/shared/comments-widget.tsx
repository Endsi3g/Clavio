'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID, Comment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function CommentsWidget({ entityId, entityType }: { entityId: string, entityType: 'idea' | 'post' }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('comments')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data)
        setLoading(false)
      })
  }, [supabase, entityId, entityType])

  async function handleSubmit() {
    if (!newComment.trim()) return
    setSubmitting(true)
    
    // Fallback name for now, real auth would use user profile
    const authorName = 'Team Member'
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        workspace_id: WORKSPACE_ID,
        entity_id: entityId,
        entity_type: entityType,
        content: newComment.trim(),
        author_name: authorName
      })
      .select()
      .single()

    if (data) {
      setComments([...comments, data])
      setNewComment('')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b pb-2">
        <MessageSquare className="h-4 w-4 text-blue-500" />
        Comments & Feedback
      </div>
      
      {loading ? (
        <div className="text-xs text-slate-400">Loading comments...</div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {comments.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No comments yet.</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{comment.author_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Leave feedback..." 
          className="min-h-[40px] text-sm resize-none"
          rows={2}
        />
        <Button onClick={handleSubmit} disabled={submitting || !newComment.trim()} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
