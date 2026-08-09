import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [post] = await sql`
    DELETE FROM posts WHERE id = ${id} RETURNING id, user_id
  `;

  if (!post) {
    return NextResponse.json({ error: "댓글을 찾을 수 없어요." }, { status: 404 });
  }

  if (post.user_id) {
    const [{ report_count }] = await sql`
      INSERT INTO user_report_counts (user_id, report_count)
      VALUES (${post.user_id}, 1)
      ON CONFLICT (user_id) DO UPDATE SET report_count = user_report_counts.report_count + 1
      RETURNING report_count
    `;
    if (report_count >= 3) {
      await sql`
        INSERT INTO banned_users (user_id, report_count)
        VALUES (${post.user_id}, ${report_count})
        ON CONFLICT (user_id) DO UPDATE SET report_count = EXCLUDED.report_count
      `;
    }
  }

  return NextResponse.json({ success: true });
}
