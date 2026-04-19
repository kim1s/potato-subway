import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { requireUploadSecret } from "@/lib/auth";

interface ContentItem {
  word: string;
  meaning: { ko: string; en: string };
  examples: { en: string; ko: string }[];
  publishDate: string;
  monthKey: string;
  order: number;
}

export async function POST(request: NextRequest) {
  if (!requireUploadSecret(request)) {
    return NextResponse.json({ error: "인증이 필요해요." }, { status: 401 });
  }

  const body = await request.json();
  const items: ContentItem[] = body.items ?? body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items 배열이 필요해요." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO contents (word, meaning_ko, meaning_en, examples, publish_date, month_key, "order")
    SELECT * FROM ${sql(items.map((item) => ({
      word: item.word,
      meaning_ko: item.meaning?.ko ?? null,
      meaning_en: item.meaning?.en ?? null,
      examples: JSON.stringify(item.examples),
      publish_date: item.publishDate,
      month_key: item.monthKey,
      order: item.order,
    })))}
    ON CONFLICT (month_key, "order") DO UPDATE SET
      word = EXCLUDED.word,
      meaning_ko = EXCLUDED.meaning_ko,
      meaning_en = EXCLUDED.meaning_en,
      examples = EXCLUDED.examples,
      publish_date = EXCLUDED.publish_date,
      updated_at = now()
    RETURNING *
  `;

  return NextResponse.json({ inserted: rows.length, data: rows }, { status: 201 });
}
