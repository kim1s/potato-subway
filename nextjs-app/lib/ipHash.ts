import crypto from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "default-salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
