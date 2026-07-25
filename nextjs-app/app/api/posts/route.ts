import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { hashIp, getClientIp } from "@/lib/ipHash";

export async function GET(request: NextRequest) {
  const wordId = request.nextUrl.searchParams.get("wordId");
  if (!wordId) {
    return NextResponse.json({ error: "wordId 파라미터가 필요해요." }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, word_id, content, likes, created_at
    FROM posts
    WHERE word_id = ${wordId} AND is_hidden = false
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ posts: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { wordId, content, userId } = body;

  if (!wordId || !content?.trim()) {
    return NextResponse.json({ error: "wordId와 content가 필요해요." }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "댓글은 2000자 이하로 작성해주세요." }, { status: 400 });
  }

  if (userId) {
    const [banned] = await sql`SELECT 1 FROM banned_users WHERE user_id = ${userId}`;
    if (banned) {
      return NextResponse.json({ error: "댓글 작성이 제한되었습니다." }, { status: 403 });
    }

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM posts
      WHERE user_id = ${userId} AND created_at >= date_trunc('day', now())
    `;
    if (count >= 10) {
      return NextResponse.json(
        { error: "하루에 작성할 수 있는 댓글은 10개까지예요." },
        { status: 429 }
      );
    }
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  const [row] = await sql`
    INSERT INTO posts (word_id, content, ip_hash, user_id)
    VALUES (${wordId}, ${content.trim()}, ${ipHash}, ${userId ?? null})
    RETURNING *
  `;

  return NextResponse.json(row, { status: 201 });
}
