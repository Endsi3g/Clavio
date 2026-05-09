import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

// Called by Vercel Cron every minute: "* * * * *"
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()

  // Find all scheduled posts past their publish time
  const { data: duePosts } = await supabase
    .from('posts')
    .select('id, platform, title')
    .eq('workspace_id', WORKSPACE_ID)
    .eq('status', 'scheduled')
    .lte('scheduled_for', new Date().toISOString())
    .limit(20)

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  const results = await Promise.allSettled(
    duePosts.map(async (post) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/posts/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: post.id }),
        }
      )
      return { id: post.id, ok: res.ok }
    })
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - succeeded

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: failed > 0 ? 'warning' : 'info',
    source: 'cron/publish-scheduled',
    message: `Cron: processed ${results.length} scheduled posts. ${succeeded} succeeded, ${failed} failed.`,
    payload_json: { total: results.length, succeeded, failed },
  })

  return NextResponse.json({ processed: results.length, succeeded, failed })
}
