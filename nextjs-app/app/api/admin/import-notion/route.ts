import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { fetchNotionRows } from "@/lib/notionImport";

export async function POST(request: NextRequest) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "NOTION_TOKEN이 설정되지 않았어요." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const notionUrl = (body as { notionUrl?: string }).notionUrl ?? process.env.NOTION_DATABASE_URL;
  if (!notionUrl) {
    return NextResponse.json({ error: "notionUrl이 필요해요." }, { status: 400 });
  }

  let rows;
  try {
    rows = await fetchNotionRows(notionUrl, token);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ message: "가져올 데이터가 없어요.", upserted: 0 });
  }

  // month별 현재 최대 order 조회
  const existing = await sql<{ month_key: string; max_order: number }[]>`
    SELECT month_key, MAX("order") as max_order
    FROM contents
    GROUP BY month_key
  `;
  const monthOrderMap = new Map(existing.map((r) => [r.month_key, r.max_order]));

  const toInsert = rows.map((row) => {
    const next = (monthOrderMap.get(row.monthKey) ?? 0) + 1;
    monthOrderMap.set(row.monthKey, next);
    return {
      word: row.word,
      meaning_ko: row.meaning.ko,
      meaning_en: row.meaning.en,
      examples: JSON.stringify(row.examples),
      publish_date: row.publishDate,
      month_key: row.monthKey,
      order: next,
      is_active: row.isActive,
    };
  });

  const result = await sql`
    INSERT INTO contents (word, meaning_ko, meaning_en, examples, publish_date, month_key, "order", is_active)
    SELECT * FROM ${sql(toInsert)}
    ON CONFLICT (month_key, "order") DO UPDATE SET
      word = EXCLUDED.word,
      meaning_ko = EXCLUDED.meaning_ko,
      meaning_en = EXCLUDED.meaning_en,
      examples = EXCLUDED.examples,
      publish_date = EXCLUDED.publish_date,
      updated_at = now()
    RETURNING id
  `;

  return NextResponse.json({ message: "임포트 완료!", upserted: result.length });
}
