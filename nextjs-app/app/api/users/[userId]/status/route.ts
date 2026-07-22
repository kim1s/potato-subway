import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [banned] = await sql`SELECT 1 FROM banned_users WHERE user_id = ${userId}`;

  return NextResponse.json({ banned: !!banned });
}
