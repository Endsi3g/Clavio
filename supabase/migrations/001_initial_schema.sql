-- ============================================================
-- Clavio — Initial Database Schema
-- Workspace ID: 00000000-0000-0000-0000-000000000001
-- ============================================================

-- Auto-update trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  key          text        NOT NULL,
  value_json   jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, key)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON settings
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_settings_workspace_id ON settings (workspace_id);
CREATE INDEX IF NOT EXISTS idx_settings_key           ON settings (key);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. ideas
-- ============================================================
CREATE TABLE IF NOT EXISTS ideas (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  title        text        NOT NULL,
  description  text,
  format       text,
  platform     text,
  pillar       text,
  status       text        NOT NULL DEFAULT 'draft',
  priority     text,
  source_type  text,
  source_ref   text,
  prompt       text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON ideas
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_ideas_workspace_id ON ideas (workspace_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status        ON ideas (status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at    ON ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_platform      ON ideas (platform);
CREATE INDEX IF NOT EXISTS idx_ideas_pillar        ON ideas (pillar);

CREATE TRIGGER trg_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. idea_variants (references ideas)
-- ============================================================
CREATE TABLE IF NOT EXISTS idea_variants (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  idea_id      uuid        NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
  variant_type text,
  hook         text,
  script       text,
  cta          text,
  status       text        NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE idea_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON idea_variants
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_idea_variants_workspace_id ON idea_variants (workspace_id);
CREATE INDEX IF NOT EXISTS idx_idea_variants_idea_id      ON idea_variants (idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_variants_status       ON idea_variants (status);
CREATE INDEX IF NOT EXISTS idx_idea_variants_created_at   ON idea_variants (created_at DESC);

CREATE TRIGGER trg_idea_variants_updated_at
  BEFORE UPDATE ON idea_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. videos
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         uuid        NOT NULL,
  title                text        NOT NULL,
  source_url           text,
  storage_path         text,
  duration_seconds     integer,
  processing_status    text        NOT NULL DEFAULT 'draft',
  transcription_status text        NOT NULL DEFAULT 'draft',
  status               text        NOT NULL DEFAULT 'draft',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON videos
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_videos_workspace_id         ON videos (workspace_id);
CREATE INDEX IF NOT EXISTS idx_videos_status               ON videos (status);
CREATE INDEX IF NOT EXISTS idx_videos_processing_status    ON videos (processing_status);
CREATE INDEX IF NOT EXISTS idx_videos_transcription_status ON videos (transcription_status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at           ON videos (created_at DESC);

CREATE TRIGGER trg_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. transcripts (references videos)
-- ============================================================
CREATE TABLE IF NOT EXISTS transcripts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid        NOT NULL,
  video_id      uuid        NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  language      text        NOT NULL,
  content       text        NOT NULL,
  segments_json jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON transcripts
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_transcripts_workspace_id ON transcripts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_video_id     ON transcripts (video_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_language     ON transcripts (language);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at   ON transcripts (created_at DESC);

-- ============================================================
-- 6. clips (references videos)
-- ============================================================
CREATE TABLE IF NOT EXISTS clips (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  video_id     uuid        NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  title        text        NOT NULL,
  start_ms     integer     NOT NULL,
  end_ms       integer     NOT NULL,
  caption      text,
  aspect_ratio text,
  status       text        NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON clips
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_clips_workspace_id ON clips (workspace_id);
CREATE INDEX IF NOT EXISTS idx_clips_video_id     ON clips (video_id);
CREATE INDEX IF NOT EXISTS idx_clips_status       ON clips (status);
CREATE INDEX IF NOT EXISTS idx_clips_created_at   ON clips (created_at DESC);

CREATE TRIGGER trg_clips_updated_at
  BEFORE UPDATE ON clips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. render_jobs (references clips)
-- ============================================================
CREATE TABLE IF NOT EXISTS render_jobs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     uuid        NOT NULL,
  clip_id          uuid        NOT NULL REFERENCES clips (id) ON DELETE CASCADE,
  engine           text        NOT NULL,
  composition_name text,
  status           text        NOT NULL DEFAULT 'draft',
  input_json       jsonb,
  output_url       text,
  error_message    text,
  started_at       timestamptz,
  finished_at      timestamptz
);

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON render_jobs
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_render_jobs_workspace_id ON render_jobs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_clip_id      ON render_jobs (clip_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status       ON render_jobs (status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_engine       ON render_jobs (engine);

-- ============================================================
-- 8. posts (references ideas, clips)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid        NOT NULL,
  idea_id       uuid        REFERENCES ideas (id) ON DELETE SET NULL,
  clip_id       uuid        REFERENCES clips (id) ON DELETE SET NULL,
  platform      text        NOT NULL,
  title         text        NOT NULL,
  caption       text,
  hashtags      text,
  media_url     text,
  status        text        NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON posts
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_posts_workspace_id  ON posts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_posts_idea_id       ON posts (idea_id);
CREATE INDEX IF NOT EXISTS idx_posts_clip_id       ON posts (clip_id);
CREATE INDEX IF NOT EXISTS idx_posts_status        ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_platform      ON posts (platform);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_created_at    ON posts (created_at DESC);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. post_metrics (references posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_metrics (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid        NOT NULL,
  post_id             uuid        NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  views               integer,
  likes               integer,
  comments            integer,
  shares              integer,
  saves               integer,
  clicks              integer,
  watch_time_seconds  integer,
  retention_rate      numeric(5, 4),
  collected_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON post_metrics
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_post_metrics_workspace_id ON post_metrics (workspace_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id      ON post_metrics (post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_collected_at ON post_metrics (collected_at DESC);

-- ============================================================
-- 10. assets
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  asset_type   text        NOT NULL,
  name         text        NOT NULL,
  url          text        NOT NULL,
  mime_type    text,
  size_bytes   integer,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON assets
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_assets_workspace_id ON assets (workspace_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type   ON assets (asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at   ON assets (created_at DESC);

-- ============================================================
-- 11. workflow_runs
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_runs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid        NOT NULL,
  workflow_name text        NOT NULL,
  entity_type   text,
  entity_id     uuid,
  status        text        NOT NULL DEFAULT 'draft',
  input_json    jsonb,
  output_json   jsonb,
  error_message text,
  started_at    timestamptz,
  finished_at   timestamptz
);

ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON workflow_runs
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workspace_id  ON workflow_runs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status        ON workflow_runs (status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_name ON workflow_runs (workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_entity_type   ON workflow_runs (entity_type);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_entity_id     ON workflow_runs (entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started_at    ON workflow_runs (started_at DESC);

-- ============================================================
-- 12. integrations
-- ============================================================
CREATE TABLE IF NOT EXISTS integrations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  provider     text        NOT NULL,
  status       text        NOT NULL DEFAULT 'disconnected',
  config_json  jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON integrations
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_integrations_workspace_id ON integrations (workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider     ON integrations (provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status       ON integrations (status);

CREATE TRIGGER trg_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 13. logs
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  severity     text        NOT NULL DEFAULT 'info',
  source       text        NOT NULL,
  entity_type  text,
  entity_id    uuid,
  message      text        NOT NULL,
  payload_json jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON logs
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_logs_workspace_id ON logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_logs_severity     ON logs (severity);
CREATE INDEX IF NOT EXISTS idx_logs_source       ON logs (source);
CREATE INDEX IF NOT EXISTS idx_logs_entity_type  ON logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_logs_entity_id    ON logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at   ON logs (created_at DESC);
