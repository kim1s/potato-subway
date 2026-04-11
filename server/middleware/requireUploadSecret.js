/**
 * Set CONTENT_UPLOAD_SECRET in env. Send the same value as:
 *   Authorization: Bearer <secret>
 *   or header x-upload-secret: <secret>
 */
export function requireUploadSecret(req, res, next) {
  const secret = process.env.CONTENT_UPLOAD_SECRET;
  if (!secret) {
    return res.status(503).json({
      error: "CONTENT_UPLOAD_SECRET 환경 변수가 설정되어 있지 않습니다.",
    });
  }
  const auth = req.get("authorization");
  const bearer =
    typeof auth === "string" && auth.match(/^Bearer\s+(.+)$/i)?.[1];
  const headerSecret = req.get("x-upload-secret");
  const token = bearer ?? headerSecret;
  if (!token || token !== secret) {
    return res.status(401).json({ error: "인증되지 않았습니다." });
  }
  next();
}
