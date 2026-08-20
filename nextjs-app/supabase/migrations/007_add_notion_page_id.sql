-- 노션 페이지 고유 ID로 콘텐츠를 매칭하기 위한 컬럼.
-- 기존에는 날짜 문자열로만 매칭해서, 노션에서 항목의 날짜를 바꾸면
-- 예전 날짜에 유령 row가 남는 버그가 있었다.
ALTER TABLE contents ADD COLUMN IF NOT EXISTS notion_page_id TEXT UNIQUE;
