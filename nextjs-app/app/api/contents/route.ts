import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { requireUploadSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!requireUploadSecret(request)) {
    return NextResponse.json({ error: "인증이 필요해요." }, { status: 401 });
  }

  const body = await request.json();
  const { word, meaning, examples, publishDate, monthKey, order } = body;

  if (!word || !publishDate || !monthKey || !order || !examples?.length) {
    return NextResponse.json({ error: "필수 필드가 빠졌어요." }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO contents (word, meaning_ko, meaning_en, examples, publish_date, month_key, "order")
    VALUES (
      ${word},
      ${meaning?.ko ?? null},
      ${meaning?.en ?? null},
      ${JSON.stringify(examples)},
      ${publishDate},
      ${monthKey},
      ${order}
    )
    RETURNING *
  `;

  return NextResponse.json(row, { status: 201 });
}
