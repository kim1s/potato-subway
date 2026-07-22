-- 익명 사용자 ID 기반 반복 신고 사용자 차단
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

CREATE TABLE IF NOT EXISTS banned_users (
  user_id TEXT PRIMARY KEY,
  report_count INTEGER NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
