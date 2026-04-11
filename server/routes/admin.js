import { Router } from "express";
import { Content } from "../models/Content.js";
import { fetchNotionRows } from "../lib/notionImport.js";

const router = Router();

/**
 * GET /api/admin/config
 * 어드민 페이지에서 사용할 기본 설정값 반환
 */
router.get("/config", (req, res) => {
  res.json({
    notionDatabaseUrl: process.env.NOTION_DATABASE_URL ?? "",
  });
});

/**
 * POST /api/admin/import-notion
 * Body: { notionUrl: string }
 *
 * Notion Database를 읽어 Content 컬렉션에 upsert한다.
 * - 이미 존재하는 publishDate → 내용 업데이트 (order 유지)
 * - 새로운 publishDate → 신규 삽입 (order 자동 부여)
 */
router.post("/import-notion", async (req, res) => {
  const { notionUrl } = req.body ?? {};
  if (!notionUrl || typeof notionUrl !== "string") {
    return res.status(400).json({ error: "notionUrl이 필요해요." });
  }

  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    return res.status(503).json({
      error:
        "서버에 NOTION_TOKEN이 설정되어 있지 않아요. docker-compose.yml 또는 .env를 확인해주세요.",
    });
  }

  let rows;
  try {
    rows = await fetchNotionRows(notionUrl, notionToken);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (rows.length === 0) {
    return res.json({ imported: 0, updated: 0, failed: [], message: "가져올 데이터가 없어요." });
  }

  // 월별 현재 최대 order 조회
  const monthKeys = [...new Set(rows.map((r) => r.monthKey))];
  const maxOrderMap = {};
  for (const mk of monthKeys) {
    const doc = await Content.findOne({ monthKey: mk })
      .sort({ order: -1 })
      .select("order")
      .lean();
    maxOrderMap[mk] = doc?.order ?? 0;
  }

  // 기존 publishDate 목록 조회
  const publishDates = rows.map((r) => r.publishDate);
  const existing = await Content.find({ publishDate: { $in: publishDates } })
    .select("publishDate order")
    .lean();
  const existingMap = Object.fromEntries(existing.map((d) => [d.publishDate, d]));

  let imported = 0;
  let updated = 0;
  const failed = [];

  for (const row of rows) {
    try {
      const exists = existingMap[row.publishDate];
      if (exists) {
        await Content.findOneAndUpdate(
          { publishDate: row.publishDate },
          { $set: { ...row, order: exists.order } }
        );
        updated++;
      } else {
        maxOrderMap[row.monthKey] += 1;
        await Content.create({ ...row, order: maxOrderMap[row.monthKey] });
        // 이후 같은 월의 신규 항목이 또 오면 existingMap에 추가해둠
        existingMap[row.publishDate] = { publishDate: row.publishDate, order: maxOrderMap[row.monthKey] };
        imported++;
      }
    } catch (err) {
      failed.push({ publishDate: row.publishDate, error: err.message });
    }
  }

  return res.json({ imported, updated, failed });
});

export default router;
