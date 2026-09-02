"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, destroySession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types";

export async function loginAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    rememberMe: formData.get("rememberMe") === "on",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda masukkan.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { username, password, rememberMe } = parsed.data;

  let redirectTo: string | null = null;

  try {
    const supabase = createServiceClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password_hash, full_name, role")
      .eq("username", username)
      .maybeSingle();

    if (error || !user) {
      return { success: false, message: "Username atau password salah." };
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return { success: false, message: "Username atau password salah." };
    }

    await createSession(
      {
        userId: user.id,
        username: user.username,
        fullName: user.full_name || user.username,
        role: user.role,
      },
      rememberMe
    );

    redirectTo = "/dashboard";
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server. Periksa konfigurasi Supabase Anda.",
    };
  }

  if (redirectTo) redirect(redirectTo);
  return { success: true, message: "Berhasil masuk." };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
