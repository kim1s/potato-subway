import crypto from "crypto";

function clientIp(req) {
  const forwarded = req.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  return req.socket?.remoteAddress ?? "";
}

/**
 * 익명·남용 방지용. 원문 IP는 저장하지 않고 해시만 저장합니다.
 * 프로덕션에서는 반드시 IP_HASH_SALT를 설정하세요.
 */
export function hashClientIp(req) {
  const salt =
    process.env.IP_HASH_SALT ?? "dev-only-change-ip-hash-salt-in-production";
  const ip = clientIp(req);
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
