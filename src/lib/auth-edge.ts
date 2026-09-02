import { jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "slovv_session";

/**
 * Edge-compatible session check for middleware. Uses `jose` only (no
 * bcrypt/node APIs), so it can run in the Edge runtime. Kept independent
 * from src/lib/auth.ts (which is marked "server-only") so middleware can
 * import it safely.
 */
export async function verifySessionEdge(token: string | undefined) {
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}
