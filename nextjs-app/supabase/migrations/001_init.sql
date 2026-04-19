-- contents 테이블
CREATE TABLE IF NOT EXISTS contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  meaning_ko TEXT,
  meaning_en TEXT,
  examples JSONB NOT NULL DEFAULT '[]',
  publish_date DATE NOT NULL,
  month_key TEXT NOT NULL,
  "order" INTEGER NOT NULL CHECK ("order" >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (month_key, "order")
);

CREATE INDEX IF NOT EXISTS idx_contents_publish_date ON contents(publish_date);
CREATE INDEX IF NOT EXISTS idx_contents_month_active ON contents(month_key, is_active);

-- posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  ip_hash TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_word_id_created ON posts(word_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_ip_hash ON posts(ip_hash);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화 (anon은 읽기만, 쓰기는 service role에서)
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contents_select" ON contents FOR SELECT USING (true);
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
