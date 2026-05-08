import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const workspaceId = '00000000-0000-0000-0000-000000000001'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🌱 Seeding database...')

  // 1. Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await supabase.from('logs').delete().eq('workspace_id', workspaceId)
  await supabase.from('workflow_runs').delete().eq('workspace_id', workspaceId)
  await supabase.from('post_metrics').delete().eq('workspace_id', workspaceId)
  await supabase.from('posts').delete().eq('workspace_id', workspaceId)
  await supabase.from('render_jobs').delete().eq('workspace_id', workspaceId)
  await supabase.from('clips').delete().eq('workspace_id', workspaceId)
  await supabase.from('transcripts').delete().eq('workspace_id', workspaceId)
  await supabase.from('videos').delete().eq('workspace_id', workspaceId)
  await supabase.from('idea_variants').delete().eq('workspace_id', workspaceId)
  await supabase.from('ideas').delete().eq('workspace_id', workspaceId)
  await supabase.from('settings').delete().eq('workspace_id', workspaceId)
  await supabase.from('integrations').delete().eq('workspace_id', workspaceId)
  await supabase.from('assets').delete().eq('workspace_id', workspaceId)

  // 2. Insert Settings
  console.log('⚙️ Inserting settings...')
  await supabase.from('settings').insert([
    { workspace_id: workspaceId, key: 'brand_name', value_json: { name: 'Clavio Studio' } },
    { workspace_id: workspaceId, key: 'primary_color', value_json: { hex: '#3B82F6' } },
  ])

  // 3. Insert Integrations
  console.log('🔌 Inserting integrations...')
  await supabase.from('integrations').insert([
    { workspace_id: workspaceId, provider: 'youtube', status: 'connected', config_json: { channel_id: 'UC123456' } },
    { workspace_id: workspaceId, provider: 'tiktok', status: 'connected', config_json: { username: '@clavio' } },
    { workspace_id: workspaceId, provider: 'instagram', status: 'disconnected', config_json: {} },
  ])

  // 4. Insert Ideas
  console.log('💡 Inserting ideas...')
  const { data: ideas } = await supabase.from('ideas').insert([
    {
      workspace_id: workspaceId,
      title: 'How to build a SaaS in 2024',
      description: 'A comprehensive guide on modern SaaS architecture using Next.js and Supabase.',
      format: 'tutorial',
      platform: 'youtube',
      status: 'published',
      priority: 'high',
      source_type: 'manual',
    },
    {
      workspace_id: workspaceId,
      title: '10 AI Tools for Creators',
      description: 'Reviewing the best local AI tools for video editing and content generation.',
      format: 'listicle',
      platform: 'tiktok',
      status: 'review',
      priority: 'medium',
      source_type: 'ai',
    },
    {
      workspace_id: workspaceId,
      title: 'Day in the life of an Indie Hacker',
      description: 'Vlog style content showing the daily routine of building Clavio.',
      format: 'vlog',
      platform: 'instagram',
      status: 'draft',
      priority: 'low',
      source_type: 'manual',
    },
    {
      workspace_id: workspaceId,
      title: 'Why local AI is the future',
      description: 'Discussing the benefits of running models like Ollama and Whisper locally.',
      format: 'educational',
      platform: 'linkedin',
      status: 'draft',
      priority: 'high',
      source_type: 'ai',
    },
  ]).select()

  // 5. Insert Idea Variants
  if (ideas) {
    console.log('🔀 Inserting idea variants...')
    await supabase.from('idea_variants').insert([
      {
        workspace_id: workspaceId,
        idea_id: ideas[1].id,
        variant_type: 'short',
        hook: 'You won\'t believe these 10 AI tools exist.',
        script: 'First tool is...',
        cta: 'Follow for more!',
        status: 'published',
      },
      {
        workspace_id: workspaceId,
        idea_id: ideas[1].id,
        variant_type: 'detailed',
        hook: 'Stop paying for SaaS. Use these local AI tools instead.',
        script: 'Here is a breakdown...',
        cta: 'Link in bio.',
        status: 'draft',
      },
    ])
  }

  // 6. Insert Videos
  console.log('🎥 Inserting videos...')
  const { data: videos } = await supabase.from('videos').insert([
    {
      workspace_id: workspaceId,
      title: 'SaaS Tutorial - Raw Footage',
      processing_status: 'completed',
      transcription_status: 'completed',
      status: 'published',
      duration_seconds: 600,
    },
    {
      workspace_id: workspaceId,
      title: 'AI Tools Review - Draft',
      processing_status: 'processing',
      transcription_status: 'draft',
      status: 'processing',
      duration_seconds: 180,
    },
    {
      workspace_id: workspaceId,
      title: 'Indie Hacker Vlog - Part 1',
      processing_status: 'completed',
      transcription_status: 'completed',
      status: 'draft',
      duration_seconds: 300,
    },
  ]).select()

  // 7. Insert Transcripts
  if (videos) {
    console.log('📝 Inserting transcripts...')
    await supabase.from('transcripts').insert([
      {
        workspace_id: workspaceId,
        video_id: videos[0].id,
        language: 'en',
        content: 'Hello everyone, today we are building a SaaS...',
        segments_json: [
          { start: 0, end: 5, text: 'Hello everyone,' },
          { start: 5, end: 10, text: 'today we are building a SaaS...' },
        ],
      },
      {
        workspace_id: workspaceId,
        video_id: videos[2].id,
        language: 'fr',
        content: 'Bonjour tout le monde, bienvenue dans mon vlog...',
        segments_json: [
          { start: 0, end: 5, text: 'Bonjour tout le monde,' },
          { start: 5, end: 10, text: 'bienvenue dans mon vlog...' },
        ],
      },
    ])

    // 8. Insert Clips
    console.log('✂️ Inserting clips...')
    const { data: clips } = await supabase.from('clips').insert([
      {
        workspace_id: workspaceId,
        video_id: videos[0].id,
        title: 'Building the Auth Layer',
        start_ms: 60000,
        end_ms: 120000,
        status: 'published',
      },
      {
        workspace_id: workspaceId,
        video_id: videos[0].id,
        title: 'Supabase Integration',
        start_ms: 180000,
        end_ms: 240000,
        status: 'draft',
      },
    ]).select()

    // 9. Insert Render Jobs
    if (clips) {
      console.log('🎬 Inserting render jobs...')
      await supabase.from('render_jobs').insert([
        {
          workspace_id: workspaceId,
          clip_id: clips[0].id,
          engine: 'remotion',
          status: 'completed',
          output_url: 'https://example.com/render1.mp4',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          finished_at: new Date(Date.now() - 3300000).toISOString(),
        },
      ])
    }
  }

  // 10. Insert Posts
  console.log('📮 Inserting posts...')
  const { data: posts } = await supabase.from('posts').insert([
    {
      workspace_id: workspaceId,
      idea_id: ideas?.[0]?.id,
      platform: 'youtube',
      title: 'Building a SaaS in 2024',
      caption: 'The ultimate guide.',
      status: 'published',
      published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      workspace_id: workspaceId,
      idea_id: ideas?.[1]?.id,
      platform: 'tiktok',
      title: 'AI Tools Review',
      caption: 'Check these out!',
      status: 'scheduled',
      scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      workspace_id: workspaceId,
      idea_id: ideas?.[2]?.id,
      platform: 'instagram',
      title: 'Indie Hacker Life',
      caption: 'Building daily.',
      status: 'failed',
      scheduled_for: new Date(Date.now() - 3600000).toISOString(),
    },
  ]).select()

  // 11. Insert Metrics
  if (posts) {
    console.log('📊 Inserting metrics...')
    await supabase.from('post_metrics').insert([
      {
        workspace_id: workspaceId,
        post_id: posts[0].id,
        views: 12500,
        likes: 850,
        comments: 42,
        shares: 120,
        saves: 300,
        retention_rate: 0.65,
      },
      {
        workspace_id: workspaceId,
        post_id: posts[0].id,
        views: 11000,
        likes: 780,
        collected_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ])
  }

  // 12. Insert Workflow Runs
  console.log('🤖 Inserting workflow runs...')
  await supabase.from('workflow_runs').insert([
    {
      workspace_id: workspaceId,
      workflow_name: 'video-transcription',
      status: 'completed',
      started_at: new Date(Date.now() - 7200000).toISOString(),
      finished_at: new Date(Date.now() - 7100000).toISOString(),
    },
    {
      workspace_id: workspaceId,
      workflow_name: 'post-scheduling',
      status: 'failed',
      error_message: 'API quota exceeded for TikTok.',
      started_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ])

  // 13. Insert Logs
  console.log('📜 Inserting logs...')
  await supabase.from('logs').insert([
    { workspace_id: workspaceId, severity: 'info', source: 'system', message: 'Workspace initialized.' },
    { workspace_id: workspaceId, severity: 'info', source: 'video-processor', message: 'Video "SaaS Tutorial" uploaded successfully.' },
    { workspace_id: workspaceId, severity: 'warn', source: 'publisher', message: 'Instagram connection token expiring soon.' },
    { workspace_id: workspaceId, severity: 'error', source: 'api', message: 'Failed to fetch YouTube metrics: 403 Forbidden' },
  ])

  console.log('✅ Seeding completed!')
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
