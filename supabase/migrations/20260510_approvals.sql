-- Approval workflow columns on posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'none'
    CHECK (approval_status IN ('none', 'pending_review', 'changes_requested', 'approved')),
  ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES auth.users(id);

-- Post comments for approval thread
CREATE TABLE IF NOT EXISTS post_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  user_id     uuid REFERENCES auth.users(id),
  author_name text NOT NULL DEFAULT 'Team member',
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage comments"
  ON post_comments FOR ALL
  USING (workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);
