-- ============================================================
-- Clavio — Profiles and Notifications
-- ============================================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  full_name    text,
  email        text,
  avatar_url   text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON profiles
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 2. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL,
  title        text        NOT NULL,
  message      text        NOT NULL,
  type         text        NOT NULL DEFAULT 'info', -- info, success, warning, error
  is_read      boolean     NOT NULL DEFAULT false,
  entity_type  text,
  entity_id    uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_access" ON notifications
  FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON notifications (workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read      ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at   ON notifications (created_at DESC);

-- Trigger for profiles updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
