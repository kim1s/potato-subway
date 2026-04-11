import { Router } from "express";
import mongoose from "mongoose";
import { Content } from "../models/Content.js";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_KEY_RE = /^\d{4}-\d{2}$/;

/** GET /api/contents/daily?date=YYYY-MM-DD (생략 시 서버 기준 UTC 오늘) */
router.get("/daily", async (req, res) => {
  let publishDate = req.query.date;
  if (!publishDate) {
    publishDate = new Date().toISOString().slice(0, 10);
  } else if (typeof publishDate !== "string" || !DATE_RE.test(publishDate)) {
    return res.status(400).json({
      error: "date는 YYYY-MM-DD 형식의 문자열이어야 합니다.",
    });
  }

  const doc = await Content.findOne({ publishDate, isActive: true }).lean();
  if (!doc) {
    return res.status(404).json({ error: "해당 날짜에 등록된 단어가 없습니다." });
  }
  return res.json(doc);
});

/** GET /api/contents/month/:monthKey (예: 2026-03) */
router.get("/month/:monthKey", async (req, res) => {
  const { monthKey } = req.params;
  if (!MONTH_KEY_RE.test(monthKey)) {
    return res.status(400).json({
      error: "monthKey는 YYYY-MM 형식이어야 합니다.",
    });
  }
  const items = await Content.find({ monthKey, isActive: true })
    .sort({ order: 1 })
    .lean();
  return res.json(items);
});

/** GET /api/contents/:id */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "잘못된 id입니다." });
  }
  const doc = await Content.findOne({ _id: id, isActive: true }).lean();
  if (!doc) {
    return res.status(404).json({ error: "단어를 찾을 수 없습니다." });
  }
  return res.json(doc);
});

export default router;
