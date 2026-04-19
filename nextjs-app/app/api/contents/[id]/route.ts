import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [row] = await sql`
    SELECT * FROM contents WHERE id = ${id} LIMIT 1
  `;

  if (!row) {
    return NextResponse.json({ error: "단어를 찾을 수 없어요." }, { status: 404 });
  }
  return NextResponse.json(row);
}
