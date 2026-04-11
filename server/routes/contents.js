import { Router } from "express";
import mongoose from "mongoose";
import { Content } from "../models/Content.js";
import { requireUploadSecret } from "../middleware/requireUploadSecret.js";

const router = Router();

function formatValidationError(err) {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    return { error: "유효성 검사 실패", details };
  }
  if (err.code === 11000) {
    return {
      error: "이미 같은 monthKey와 order를 가진 콘텐츠가 있습니다.",
    };
  }
  return { error: err.message ?? "저장 중 오류가 발생했습니다." };
}

/**
 * POST /api/contents
 * Body: { word, meaning, examples, publishDate, monthKey, order, isActive? }
 */
router.post("/", requireUploadSecret, async (req, res) => {
  try {
    const doc = await Content.create(req.body);
    return res.status(201).json(doc.toObject());
  } catch (err) {
    const body = formatValidationError(err);
    const status =
      err instanceof mongoose.Error.ValidationError || err.code === 11000
        ? 400
        : 500;
    return res.status(status).json(body);
  }
});

/**
 * POST /api/contents/batch
 * Body: { items: [ { word, meaning, examples, publishDate, monthKey, order, isActive? }, ... ] }
 */
router.post("/batch", requireUploadSecret, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "items는 비어 있지 않은 배열이어야 합니다.",
    });
  }

  const created = [];
  const failed = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const doc = await Content.create(items[i]);
      created.push(doc.toObject());
    } catch (err) {
      failed.push({
        index: i,
        ...formatValidationError(err),
      });
    }
  }

  const payload = {
    createdCount: created.length,
    failedCount: failed.length,
    created,
    failed,
  };
  if (created.length === items.length) {
    return res.status(201).json(payload);
  }
  if (created.length === 0) {
    return res.status(400).json(payload);
  }
  return res.status(200).json(payload);
});

export default router;
