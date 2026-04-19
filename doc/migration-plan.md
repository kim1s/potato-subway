# Potato on the Subway — Next.js + Supabase + Vercel 마이그레이션 계획

## 배경

현재 프로젝트는 Docker 기반 모노레포(React/Vite + Express + MongoDB)로 구성되어 있음.
Vercel은 Docker를 지원하지 않으므로, 서버리스 친화적인 Next.js 풀스택으로 전환 필요.

---

## 현재 구조 요약

```
potato-subway/
├── client/project-potato-react/   # React 19 + Vite + TailwindCSS
│   └── src/
│       ├── App.jsx                # 메인 UI
│       ├── AdminApp.jsx           # 어드민 UI
│       └── components/ui/         # shadcn 컴포넌트
└── server/                        # Express 5 + Mongoose
    ├── models/                    # Content, Post 모델
    ├── routes/                    # API 라우트
    └── lib/                       # ipHash, notionImport
```

---

## 목표 구조

```
potato-subway/
├── doc/
├── nextjs-app/                    # 새 Next.js 15 풀스택 앱
│   ├── app/
│   │   ├── page.tsx               # 메인 페이지 (기존 App.jsx)
│   │   ├── admin/page.tsx         # 어드민 페이지 (기존 AdminApp.jsx)
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── contents/          # 기존 Express 라우트 이전
│   │       │   ├── route.ts       # GET /api/contents/daily, POST
│   │       │   ├── batch/route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── daily/route.ts
│   │       │   └── month/[monthKey]/route.ts
│   │       ├── posts/route.ts
│   │       └── admin/
│   │           ├── route.ts
│   │           └── import-notion/route.ts
│   ├── components/
│   │   └── ui/                    # shadcn 컴포넌트 그대로 이전
│   ├── lib/
│   │   ├── supabase.ts            # Supabase 클라이언트
│   │   ├── ipHash.ts              # IP 해싱 유틸
│   │   └── notionImport.ts        # Notion 연동
│   └── supabase/
│       └── migrations/            # DB 스키마 마이그레이션 SQL
└── (기존 client/, server/ 는 보존 후 추후 삭제)
```

---

## 기술 스택 변경

| 항목 | 기존 | 변경 |
|------|------|------|
| 프레임워크 | React 19 + Vite / Express 5 | Next.js 15 (App Router) |
| 언어 | JavaScript | TypeScript |
| DB | MongoDB + Mongoose | Supabase (PostgreSQL) |
| ORM/Client | Mongoose | Supabase JS Client |
| 인증 (어드민) | Bearer Token (env) | Supabase Auth 또는 동일 방식 유지 |
| 배포 | Docker | Vercel |
| 스타일링 | TailwindCSS 4 + shadcn | TailwindCSS 4 + shadcn (동일) |

---

## Supabase 테이블 설계

### `contents` 테이블 (기존 Content 모델)

```sql
CREATE TABLE contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  meaning_ko TEXT,
  meaning_en TEXT,
  examples JSONB NOT NULL DEFAULT '[]',  -- [{en, ko}, ...]
  publish_date DATE NOT NULL,
  month_key TEXT NOT NULL,               -- YYYY-MM
  "order" INTEGER NOT NULL CHECK ("order" >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (month_key, "order")
);

CREATE INDEX idx_contents_publish_date ON contents(publish_date);
CREATE INDEX idx_contents_month_active ON contents(month_key, is_active);
```

### `posts` 테이블 (기존 Post 모델)

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  ip_hash TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_posts_word_id_created ON posts(word_id, created_at DESC);
CREATE INDEX idx_posts_ip_hash ON posts(ip_hash);
```

---

## 작업 단계

### Phase 1: Next.js 프로젝트 초기화 ✅
- [x] `nextjs-app/` 디렉터리에 Next.js 16 + TypeScript 프로젝트 생성
- [x] TailwindCSS 4 설정
- [x] shadcn/ui 초기화 및 기존 컴포넌트 복사 (badge, card, input, button)
- [x] 경로 alias(`@/*`) 설정

### Phase 2: Supabase 설정 ✅
- [ ] Supabase 프로젝트 생성 (사용자가 직접)
- [x] `contents`, `posts` 테이블 마이그레이션 SQL 작성 (`supabase/migrations/001_init.sql`)
- [x] `lib/supabase.ts` 클라이언트 모듈 작성
- [x] 환경변수 `.env.local.example` 템플릿 작성
- [x] `types/database.ts` 타입 정의

### Phase 3: API 라우트 마이그레이션 (Express → Next.js API Routes) ✅
- [x] `GET /api/contents/daily` — 오늘의 단어
- [x] `GET /api/contents/month/[monthKey]` — 월별 단어
- [x] `GET /api/contents/[id]` — 단어 상세
- [x] `POST /api/contents` — 단어 생성 (어드민)
- [x] `POST /api/contents/batch` — 단어 일괄 생성 (어드민)
- [x] `GET /api/posts` — 댓글 목록
- [x] `POST /api/posts` — 댓글 작성
- [x] `GET /api/admin` — 어드민 설정
- [x] `POST /api/admin/import-notion` — Notion 임포트
- [x] `lib/auth.ts` — 어드민 인증 미들웨어
- [x] `lib/ipHash.ts` — IP 해싱 유틸

### Phase 4: 프론트엔드 마이그레이션 (React → Next.js) ✅
- [x] `app/page.tsx` — 기존 `App.jsx` 이전 (TypeScript)
- [x] `app/admin/page.tsx` — 기존 `AdminApp.jsx` 이전 (TypeScript)
- [x] `app/layout.tsx` — 레이아웃 및 메타데이터 (DM Sans 폰트)
- [x] `lib/notionImport.ts` — Notion 연동 이전
- [x] `app/globals.css` — 기존 App.css 통합
- [x] `public/heroes/` — 히어로 이미지 복사

### Phase 5: Vercel 배포 설정 ✅
- [x] `vercel.json` 설정
- [x] 빌드 성공 확인 (`npm run build`)
- [ ] Supabase 프로젝트 생성 후 실제 배포

---

## Vercel 배포 가이드

### 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_init.sql` 실행
3. Settings > API에서 URL, anon key, service_role key 복사

### 2. Vercel 배포
1. GitHub에 `nextjs-app/` 디렉터리 푸시 (또는 monorepo root에서 Root Directory를 `nextjs-app`으로 설정)
2. Vercel에서 Import Project
3. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CONTENT_UPLOAD_SECRET`
   - `IP_HASH_SALT`
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_URL`

---

## 환경변수 목록

### 기존 → 신규 매핑

| 기존 | 신규 | 설명 |
|------|------|------|
| `MONGODB_URI` | ❌ (제거) | Supabase로 대체 |
| `CONTENT_UPLOAD_SECRET` | `CONTENT_UPLOAD_SECRET` | 어드민 인증 토큰 (유지) |
| `IP_HASH_SALT` | `IP_HASH_SALT` | IP 해싱 salt (유지) |
| `NOTION_TOKEN` | `NOTION_TOKEN` | Notion API 토큰 (유지) |
| `NOTION_DATABASE_URL` | `NOTION_DATABASE_URL` | Notion DB URL (유지) |
| `VITE_PROXY_TARGET` | ❌ (제거) | Next.js 내장 API로 불필요 |
| ❌ (신규) | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| ❌ (신규) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| ❌ (신규) | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (서버 전용) |

---

## 참고

- Next.js App Router 공식 문서: https://nextjs.org/docs
- Supabase JS 클라이언트: https://supabase.com/docs/reference/javascript
- Vercel 배포: https://vercel.com/docs/frameworks/nextjs
