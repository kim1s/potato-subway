import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { fetchNotionRows } from "@/lib/notionImport";

export const maxDuration = 60;

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

  // publish_date 기준으로 정렬 후 월별 순서 번호 결정 (랜덤 API 응답 순서에 의존하지 않음)
  rows.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  const monthOrderMap = new Map<string, number>();
  const newRows = rows.map((row) => {
    const next = (monthOrderMap.get(row.monthKey) ?? 0) + 1;
    monthOrderMap.set(row.monthKey, next);
    return {
      word: row.word,
      meaning_ko: row.meaning.ko,
      meaning_en: row.meaning.en,
      examples: row.examples,
      publish_date: row.publishDate,
      month_key: row.monthKey,
      order: next,
      is_active: row.isActive,
    };
  });

  const notionDates = newRows.map((r) => r.publish_date);

  let count: number;
  try {
    count = await sql.begin(async (sql) => {
      // 1. 기존 row 조회
      const existing = await sql`
        SELECT id, TO_CHAR(publish_date, 'YYYY-MM-DD') AS publish_date
        FROM contents
      `;
      const existingMap = new Map(existing.map((r) => [r.publish_date as string, r.id as string]));

      // 2. 노션에 없어진 날짜 삭제 (posts는 CASCADE로 함께 삭제됨)
      await sql`
        DELETE FROM contents
        WHERE NOT (TO_CHAR(publish_date, 'YYYY-MM-DD') = ANY(${notionDates}::text[]))
      `;

      // 3. 업데이트 / 신규 삽입 분류
      const toUpdate: Array<typeof newRows[number] & { id: string }> = [];
      const toInsert: typeof newRows = [];

      for (const row of newRows) {
        const id = existingMap.get(row.publish_date);
        if (id) toUpdate.push({ ...row, id });
        else toInsert.push(row);
      }

      // 4. 기존 row 업데이트
      // month_key를 먼저 임시값으로 변경해 UNIQUE(month_key, order) 충돌 방지
      if (toUpdate.length > 0) {
        await sql`
          UPDATE contents SET month_key = 'tmp-' || id::text
          WHERE id = ANY(${toUpdate.map((r) => r.id)}::uuid[])
        `;
        await sql`
          UPDATE contents SET
            word       = v.word,
            meaning_ko = v.meaning_ko,
            meaning_en = v.meaning_en,
            examples   = v.examples::jsonb,
            month_key  = v.month_key,
            "order"    = v.ord::int,
            is_active  = true,
            updated_at = now()
          FROM unnest(
            ${toUpdate.map((r) => r.id)}::uuid[],
            ${toUpdate.map((r) => r.word)}::text[],
            ${toUpdate.map((r) => r.meaning_ko ?? "")}::text[],
            ${toUpdate.map((r) => r.meaning_en ?? "")}::text[],
            ${toUpdate.map((r) => JSON.stringify(r.examples))}::text[],
            ${toUpdate.map((r) => r.month_key)}::text[],
            ${toUpdate.map((r) => r.order)}::int[]
          ) AS v(id, word, meaning_ko, meaning_en, examples, month_key, ord)
          WHERE contents.id = v.id
        `;
      }

      // 5. 신규 row 삽입
      if (toInsert.length > 0) {
        await sql`
          INSERT INTO contents ${sql(
            toInsert.map((r) => ({
              word: r.word,
              meaning_ko: r.meaning_ko,
              meaning_en: r.meaning_en,
              examples: sql.json(r.examples),
              publish_date: r.publish_date,
              month_key: r.month_key,
              order: r.order,
              is_active: r.is_active,
            }))
          )}
        `;
      }

      return toUpdate.length + toInsert.length;
    });
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    console.error("Import error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ message: "임포트 완료!", upserted: count });
}
