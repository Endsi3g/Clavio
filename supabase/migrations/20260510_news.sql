-- News preferences per workspace
CREATE TABLE IF NOT EXISTS news_preferences (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{"ai","world"}',
  keywords TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id)
);

ALTER TABLE news_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can read news_preferences"
  ON news_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = news_preferences.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace admins can upsert news_preferences"
  ON news_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = news_preferences.workspace_id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('admin', 'owner')
    )
  );

-- Cached news articles per workspace
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  category TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can read news_items"
  ON news_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = news_items.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace members can insert news_items"
  ON news_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = news_items.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_news_items_workspace
  ON news_items(workspace_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_items_category
  ON news_items(workspace_id, category);
