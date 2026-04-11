import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import "./models/index.js";
import contentsPublicRouter from "./routes/contentsPublic.js";
import contentsRouter from "./routes/contents.js";
import postsRouter from "./routes/posts.js";

/** macOS는 5000번을 AirPlay가 쓰는 경우가 많아 기본값을 피합니다. */
const PORT = Number(process.env.PORT) || 5050;
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/project-potato";

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error:
        "데이터베이스에 연결되지 않았습니다. MongoDB를 실행하거나 MONGODB_URI를 확인하세요.",
    });
  }
  next();
}

app.get("/", (req, res) => {
  res.send("OK");
});

app.use("/api/contents", requireDb, contentsPublicRouter);
app.use("/api/contents", requireDb, contentsRouter);
app.use("/api/posts", requireDb, postsRouter);

async function main() {
  await new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      resolve();
    });
    server.on("error", reject);
  });

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB 연결 성공");
  } catch (err) {
    console.error(
      `MongoDB 연결 실패 — 브라우저에서 http://localhost:${PORT} 는 OK로 열리지만 API는 DB 연결 후 사용할 수 있습니다.`
    );
    console.error(err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
