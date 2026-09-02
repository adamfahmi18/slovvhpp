import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

/**
 * REST login endpoint, provided alongside the `loginAction` server action
 * used by the web form — useful for external/API clients (e.g. a future
 * mobile app) that can't call a Next.js Server Action directly.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Data tidak valid.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, password, rememberMe } = parsed.data;
  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash, full_name, role")
    .eq("username", username)
    .maybeSingle();

  if (error || !user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ success: false, message: "Username atau password salah." }, { status: 401 });
  }

  await createSession(
    { userId: user.id, username: user.username, fullName: user.full_name || user.username, role: user.role },
    rememberMe
  );

  return NextResponse.json({ success: true, message: "Berhasil masuk." });
}
