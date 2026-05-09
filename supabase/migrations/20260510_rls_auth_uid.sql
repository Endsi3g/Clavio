-- ─── Upgrade RLS policies to use auth.uid() workspace membership ──────────────
-- Replaces the hardcoded single-UUID policies with dynamic auth.uid() checks.
-- Each policy allows access when the workspace_id belongs to a workspace
-- the authenticated user is a member of.

CREATE OR REPLACE FUNCTION user_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
$$;

-- Helper: also allow service role (bypasses RLS entirely — no change needed)

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ideas', 'idea_variants', 'videos', 'transcripts', 'clips',
    'render_jobs', 'posts', 'post_metrics', 'assets', 'workflow_runs',
    'integrations', 'logs', 'settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "workspace_isolation" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "workspace_member_access" ON %I
       USING (workspace_id IN (SELECT user_workspace_ids()))
       WITH CHECK (workspace_id IN (SELECT user_workspace_ids()))',
      t
    );
  END LOOP;
END $$;

-- post_comments table (created in approvals migration)
DROP POLICY IF EXISTS "workspace members can manage comments" ON post_comments;
CREATE POLICY "workspace_member_access" ON post_comments
  USING (workspace_id IN (SELECT user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT user_workspace_ids()));

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION user_workspace_ids() TO authenticated, anon;
