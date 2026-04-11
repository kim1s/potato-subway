import { Router } from "express";
import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Content } from "../models/Content.js";
import { hashClientIp } from "../lib/ipHash.js";

const router = Router();

/** GET /api/posts?wordId= — 해당 단어의 댓글 목록 (최신순), ipHash 미포함 */
router.get("/", async (req, res) => {
  const { wordId } = req.query;
  if (!wordId || typeof wordId !== "string" || !mongoose.isValidObjectId(wordId)) {
    return res.status(400).json({ error: "유효한 wordId가 필요합니다." });
  }

  const exists = await Content.exists({ _id: wordId, isActive: true });
  if (!exists) {
    return res.status(404).json({ error: "단어를 찾을 수 없습니다." });
  }

  const posts = await Post.find({ wordId })
    .sort({ createdAt: -1 })
    .select("-ipHash")
    .lean();

  return res.json({ posts });
});

/** POST /api/posts — body: { wordId, content } */
router.post("/", async (req, res) => {
  const { wordId, content: text } = req.body ?? {};

  if (!wordId || typeof wordId !== "string" || !mongoose.isValidObjectId(wordId)) {
    return res.status(400).json({ error: "유효한 wordId가 필요합니다." });
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "댓글 내용을 입력해 주세요." });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: "댓글은 2000자 이하로 작성해 주세요." });
  }

  const exists = await Content.exists({ _id: wordId, isActive: true });
  if (!exists) {
    return res.status(404).json({ error: "단어를 찾을 수 없습니다." });
  }

  try {
    const doc = await Post.create({
      wordId,
      content: text.trim(),
      ipHash: hashClientIp(req),
    });
    const out = doc.toObject();
    delete out.ipHash;
    return res.status(201).json(out);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const details = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: "유효성 검사 실패", details });
    }
    console.error(err);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
