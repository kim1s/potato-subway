-- 사용자별 차단 기능
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_user_id);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- 신고된 댓글 24시간 내 영구 삭제 배치를 위한 숨김 시각 기록
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
