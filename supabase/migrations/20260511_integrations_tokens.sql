-- ─── Add encrypted token columns to integrations + published_url to posts ──
-- These columns are required by lib/token-refresh.ts and api/posts/publish

ALTER TABLE integrations
  ADD COLUMN IF NOT EXISTS access_token_enc  TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_enc TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_user_id  TEXT,
  ADD COLUMN IF NOT EXISTS scopes            TEXT[];

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS published_url TEXT;

-- Ensure one integration per workspace/provider pair
ALTER TABLE integrations
  DROP CONSTRAINT IF EXISTS integrations_workspace_provider_unique;
ALTER TABLE integrations
  ADD CONSTRAINT integrations_workspace_provider_unique
  UNIQUE (workspace_id, provider);
