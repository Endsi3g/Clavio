CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'general',
  platforms TEXT[] DEFAULT '{}',
  structure JSONB NOT NULL DEFAULT '[]',
  source_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  source_type TEXT, -- 'pdf', 'txt', 'docx', 'manual', 'ai_generated'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can read content_templates"
  ON content_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content_templates.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace members can insert content_templates"
  ON content_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content_templates.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace members can update content_templates"
  ON content_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content_templates.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace members can delete content_templates"
  ON content_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content_templates.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_content_templates_workspace
  ON content_templates(workspace_id, created_at DESC);
