import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "backpack-blitz-admin";
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "development-only-change-me";
}
function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}
export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
export function isValidAdminToken(token: string | undefined) {
  if (!token) return false;
  const [payload, provided] = token.split(".");
  if (!payload || !provided) return false;
  const expected = signature(payload);
  try {
    if (provided.length !== expected.length ||
      !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
export async function requireAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return isValidAdminToken(token);
}
export const adminCookie = { name: COOKIE_NAME, maxAge: MAX_AGE };
