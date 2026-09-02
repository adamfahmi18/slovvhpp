import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Guard for API route handlers: returns the session if valid, or a 401
 * NextResponse to return immediately.
 */
export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 }) };
  }
  return { session, response: null };
}
