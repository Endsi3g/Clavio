import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const workspaceId = '00000000-0000-0000-0000-000000000000'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedAnalytics() {
  console.log('🌱 Seeding analytics data...')

  // 1. Create some ideas
  const ideas = [
    { title: 'The Future of AI in 2024', status: 'published' },
    { title: 'How to build a SaaS in 30 days', status: 'published' },
    { title: 'Local LLMs are changing the game', status: 'published' },
  ]

  for (const idea of ideas) {
    const { data: ideaRecord, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        workspace_id: workspaceId,
        title: idea.title,
        status: idea.status,
        source_type: 'manual',
      })
      .select()
      .single()

    if (ideaError) {
      console.error('Error creating idea:', ideaError)
      continue
    }

    // 2. Create posts for each idea
    const platforms = ['youtube', 'tiktok', 'instagram']
    for (const platform of platforms) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          workspace_id: workspaceId,
          idea_id: ideaRecord.id,
          title: `${ideaRecord.title} on ${platform}`,
          platform,
          status: 'published',
          published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        continue
      }

      // 3. Create metrics snapshots for each post
      for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        await supabase.from('post_metrics').insert({
          workspace_id: workspaceId,
          post_id: post.id,
          views: Math.floor(Math.random() * 10000),
          likes: Math.floor(Math.random() * 500),
          shares: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          captured_at: date.toISOString(),
        })
      }
    }
  }

  console.log('✅ Analytics seeding complete!')
}

seedAnalytics().catch(console.error)
