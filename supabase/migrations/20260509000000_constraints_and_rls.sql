-- ─── Unique constraint on settings ────────────────────────────────────────────
-- Required for upsert(onConflict: 'workspace_id,key') to work correctly.
ALTER TABLE settings
  ADD CONSTRAINT IF NOT EXISTS settings_workspace_key_unique
  UNIQUE (workspace_id, key);

-- ─── Unique constraint on integrations ─────────────────────────────────────────
-- Required for upsert(onConflict: 'workspace_id,provider') to work correctly.
ALTER TABLE integrations
  ADD CONSTRAINT IF NOT EXISTS integrations_workspace_provider_unique
  UNIQUE (workspace_id, provider);

-- ─── Row Level Security ─────────────────────────────────────────────────────────
-- All tables use workspace_id as the isolation boundary.
-- These policies lock every table to the single known workspace UUID.
-- When multi-workspace support is added, replace the literal with auth.uid() or a JWT claim.

DO $$
DECLARE
  wid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  -- ideas
  ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON ideas;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON ideas USING (workspace_id = %L)', wid);

  -- idea_variants
  ALTER TABLE idea_variants ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON idea_variants;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON idea_variants USING (workspace_id = %L)', wid);

  -- videos
  ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON videos;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON videos USING (workspace_id = %L)', wid);

  -- transcripts
  ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON transcripts;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON transcripts USING (workspace_id = %L)', wid);

  -- clips
  ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON clips;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON clips USING (workspace_id = %L)', wid);

  -- render_jobs
  ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON render_jobs;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON render_jobs USING (workspace_id = %L)', wid);

  -- posts
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON posts;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON posts USING (workspace_id = %L)', wid);

  -- post_metrics
  ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON post_metrics;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON post_metrics USING (workspace_id = %L)', wid);

  -- assets
  ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON assets;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON assets USING (workspace_id = %L)', wid);

  -- workflow_runs
  ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON workflow_runs;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON workflow_runs USING (workspace_id = %L)', wid);

  -- integrations
  ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON integrations;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON integrations USING (workspace_id = %L)', wid);

  -- logs
  ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON logs;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON logs USING (workspace_id = %L)', wid);

  -- settings
  ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "workspace_isolation" ON settings;
  EXECUTE format('CREATE POLICY "workspace_isolation" ON settings USING (workspace_id = %L)', wid);

END $$;

-- ─── Video cascade deletes ──────────────────────────────────────────────────────
-- Ensure orphan rows are cleaned up when a video is deleted.
-- NOTE: Only add if foreign keys don't already have CASCADE.
-- These are safe to run multiple times (drops and re-adds).
ALTER TABLE transcripts
  DROP CONSTRAINT IF EXISTS transcripts_video_id_fkey;
ALTER TABLE transcripts
  ADD CONSTRAINT transcripts_video_id_fkey
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE clips
  DROP CONSTRAINT IF EXISTS clips_video_id_fkey;
ALTER TABLE clips
  ADD CONSTRAINT clips_video_id_fkey
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE render_jobs
  DROP CONSTRAINT IF EXISTS render_jobs_clip_id_fkey;
ALTER TABLE render_jobs
  ADD CONSTRAINT render_jobs_clip_id_fkey
  FOREIGN KEY (clip_id) REFERENCES clips(id) ON DELETE CASCADE;
