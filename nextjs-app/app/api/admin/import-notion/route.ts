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
      notion_page_id: row.notionPageId,
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

  let count: number;
  try {
    count = await sql.begin(async (sql) => {
      // 1. 기존 row 조회
      const existing = await sql`
        SELECT id, notion_page_id, TO_CHAR(publish_date, 'YYYY-MM-DD') AS publish_date
        FROM contents
      `;
      // notion_page_id로 우선 매칭하고, 아직 태그되지 않은 예전 row는 날짜로 한 번만 매칭(백필)한다.
      // 날짜만으로 매칭하면 노션에서 날짜를 옮겼을 때 예전 날짜에 유령 row가 남을 수 있다.
      const byNotionId = new Map(
        existing.filter((r) => r.notion_page_id).map((r) => [r.notion_page_id as string, r.id as string])
      );
      const byUntaggedDate = new Map(
        existing.filter((r) => !r.notion_page_id).map((r) => [r.publish_date as string, r.id as string])
      );

      // 2. 업데이트 / 신규 삽입 분류
      const toUpdate: Array<typeof newRows[number] & { id: string }> = [];
      const toInsert: typeof newRows = [];
      const matchedIds = new Set<string>();

      for (const row of newRows) {
        const id = byNotionId.get(row.notion_page_id) ?? byUntaggedDate.get(row.publish_date);
        if (id) {
          matchedIds.add(id);
          toUpdate.push({ ...row, id });
        } else {
          toInsert.push(row);
        }
      }

      // 3. 매칭되지 않은 기존 row는 노션에서 삭제된 것이므로 제거 (posts는 CASCADE로 함께 삭제됨)
      const idsToDelete = existing.filter((r) => !matchedIds.has(r.id as string)).map((r) => r.id as string);
      if (idsToDelete.length > 0) {
        await sql`DELETE FROM contents WHERE id = ANY(${idsToDelete}::uuid[])`;
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
            notion_page_id = v.notion_page_id,
            word         = v.word,
            meaning_ko   = v.meaning_ko,
            meaning_en   = v.meaning_en,
            examples     = v.examples::jsonb,
            publish_date = v.publish_date::date,
            month_key    = v.month_key,
            "order"      = v.ord::int,
            is_active    = true,
            updated_at   = now()
          FROM unnest(
            ${toUpdate.map((r) => r.id)}::uuid[],
            ${toUpdate.map((r) => r.notion_page_id)}::text[],
            ${toUpdate.map((r) => r.word)}::text[],
            ${toUpdate.map((r) => r.meaning_ko ?? "")}::text[],
            ${toUpdate.map((r) => r.meaning_en ?? "")}::text[],
            ${toUpdate.map((r) => JSON.stringify(r.examples))}::text[],
            ${toUpdate.map((r) => r.publish_date)}::text[],
            ${toUpdate.map((r) => r.month_key)}::text[],
            ${toUpdate.map((r) => r.order)}::int[]
          ) AS v(id, notion_page_id, word, meaning_ko, meaning_en, examples, publish_date, month_key, ord)
          WHERE contents.id = v.id
        `;
      }

      // 5. 신규 row 삽입
      if (toInsert.length > 0) {
        await sql`
          INSERT INTO contents ${sql(
            toInsert.map((r) => ({
              notion_page_id: r.notion_page_id,
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
