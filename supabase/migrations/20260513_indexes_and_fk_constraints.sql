-- Performance indexes for RLS user_workspace_ids() function
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- FK constraints to prevent orphaned rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_profiles_workspace'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT fk_profiles_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_notifications_workspace'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_post_comments_workspace'
  ) THEN
    ALTER TABLE post_comments
      ADD CONSTRAINT fk_post_comments_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;
