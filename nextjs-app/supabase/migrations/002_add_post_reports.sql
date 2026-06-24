-- 댓글 신고 기능
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
