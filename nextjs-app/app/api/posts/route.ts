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
    WHERE word_id = ${wordId}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ posts: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { wordId, content } = body;

  if (!wordId || !content?.trim()) {
    return NextResponse.json({ error: "wordId와 content가 필요해요." }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "댓글은 2000자 이하로 작성해주세요." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  const [row] = await sql`
    INSERT INTO posts (word_id, content, ip_hash)
    VALUES (${wordId}, ${content.trim()}, ${ipHash})
    RETURNING *
  `;

  return NextResponse.json(row, { status: 201 });
}
