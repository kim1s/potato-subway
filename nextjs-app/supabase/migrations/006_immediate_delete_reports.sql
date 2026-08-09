-- 신고 시 즉시 영구 삭제로 전환. 반복 신고 사용자 카운트를 게시물 존재 여부와
-- 무관하게 유지하기 위한 테이블.
CREATE TABLE IF NOT EXISTS user_report_counts (
  user_id TEXT PRIMARY KEY,
  report_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE user_report_counts ENABLE ROW LEVEL SECURITY;

-- 더 이상 사용하지 않는 지연 삭제용 컬럼 제거
ALTER TABLE posts DROP COLUMN IF EXISTS hidden_at;
