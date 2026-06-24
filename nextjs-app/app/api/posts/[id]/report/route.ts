import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { hashIp, getClientIp } from "@/lib/ipHash";

const REPORT_REASONS = ["spam", "abuse", "sexual", "other"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = REPORT_REASONS.includes(body?.reason) ? body.reason : null;

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  const [post] = await sql`
    UPDATE posts SET is_hidden = true WHERE id = ${id} RETURNING id
  `;

  if (!post) {
    return NextResponse.json({ error: "댓글을 찾을 수 없어요." }, { status: 404 });
  }

  await sql`
    INSERT INTO post_reports (post_id, ip_hash, reason)
    VALUES (${id}, ${ipHash}, ${reason})
    ON CONFLICT (post_id, ip_hash) DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
