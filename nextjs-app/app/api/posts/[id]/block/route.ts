import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const blockerId = typeof body?.blockerId === "string" ? body.blockerId : null;

  if (!blockerId) {
    return NextResponse.json({ error: "blockerId가 필요해요." }, { status: 400 });
  }

  const [post] = await sql`SELECT user_id FROM posts WHERE id = ${id}`;
  if (!post) {
    return NextResponse.json({ error: "댓글을 찾을 수 없어요." }, { status: 404 });
  }
  if (!post.user_id) {
    return NextResponse.json({ error: "차단할 수 없는 댓글이에요." }, { status: 400 });
  }
  if (post.user_id === blockerId) {
    return NextResponse.json({ error: "자기 자신은 차단할 수 없어요." }, { status: 400 });
  }

  await sql`
    INSERT INTO blocked_users (blocker_user_id, blocked_user_id)
    VALUES (${blockerId}, ${post.user_id})
    ON CONFLICT DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
