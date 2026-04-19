export function requireUploadSecret(request: Request): boolean {
  const secret = process.env.CONTENT_UPLOAD_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  const headerSecret = request.headers.get("x-upload-secret") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return bearerToken === secret || headerSecret === secret;
}
