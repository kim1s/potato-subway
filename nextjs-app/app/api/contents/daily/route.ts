import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date 파라미터가 필요해요 (YYYY-MM-DD)" }, { status: 400 });
  }

  const [row] = await sql`
    SELECT * FROM contents
    WHERE publish_date = ${date} AND is_active = true
    LIMIT 1
  `;

  if (!row) {
    return NextResponse.json({ error: "해당 날짜의 단어가 없어요." }, { status: 404 });
  }
  return NextResponse.json(row);
}
