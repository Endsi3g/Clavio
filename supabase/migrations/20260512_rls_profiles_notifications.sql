-- ─── Upgrade RLS on profiles and notifications to use auth.uid() ──────────────
-- These tables were created before the workspace_member_access migration and
-- still use hardcoded UUID policies.

-- profiles: use auth.uid() directly (user owns their own profile row)
DROP POLICY IF EXISTS "workspace_access" ON profiles;
CREATE POLICY "own_profile_access" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- notifications: use workspace membership
DROP POLICY IF EXISTS "workspace_access" ON notifications;
CREATE POLICY "workspace_member_access" ON notifications
  USING (workspace_id IN (SELECT user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT user_workspace_ids()));
