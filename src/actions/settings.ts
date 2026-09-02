"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession, createSession } from "@/lib/auth";
import {
  profileSchema,
  changeUsernameSchema,
  changePasswordSchema,
  systemSettingsSchema,
} from "@/lib/validations/settings";
import type { ActionResult } from "@/types";

export async function getSystemSettings() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("app_settings").select("*").eq("id", true).maybeSingle();
  return (
    data ?? {
      company_name: "Bisnis Saya",
      default_margin_percent: 30,
      currency: "IDR",
    }
  );
}

export async function updateProfileAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) {
    return { success: false, message: "Nama tidak valid.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan masuk kembali." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: parsed.data.fullName })
    .eq("id", session.userId);

  if (error) return { success: false, message: "Gagal memperbarui profil." };

  await createSession({ ...session, fullName: parsed.data.fullName }, true);
  revalidatePath("/settings");
  return { success: true, message: "Profil berhasil diperbarui." };
}

export async function changeUsernameAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = changeUsernameSchema.safeParse({
    newUsername: formData.get("newUsername"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { success: false, message: "Periksa kembali input Anda.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan masuk kembali." };

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.password_hash))) {
    return { success: false, message: "Password saat ini salah.", errors: { currentPassword: ["Password saat ini salah"] } };
  }

  const { error } = await supabase
    .from("users")
    .update({ username: parsed.data.newUsername })
    .eq("id", session.userId);

  if (error) {
    return { success: false, message: "Username sudah digunakan atau gagal diperbarui." };
  }

  await createSession({ ...session, username: parsed.data.newUsername }, true);
  revalidatePath("/settings");
  return { success: true, message: "Username berhasil diperbarui." };
}

export async function changePasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, message: "Periksa kembali input Anda.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan masuk kembali." };

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.password_hash))) {
    return { success: false, message: "Password saat ini salah.", errors: { currentPassword: ["Password saat ini salah"] } };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  const { error } = await supabase.from("users").update({ password_hash: newHash }).eq("id", session.userId);

  if (error) return { success: false, message: "Gagal memperbarui password." };

  return { success: true, message: "Password berhasil diperbarui." };
}

export async function updateSystemSettingsAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = systemSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Periksa kembali pengaturan sistem.", errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("app_settings")
    .update({
      company_name: parsed.data.companyName,
      default_margin_percent: parsed.data.defaultMarginPercent,
      currency: parsed.data.currency,
    })
    .eq("id", true);

  if (error) return { success: false, message: "Gagal menyimpan pengaturan sistem." };

  revalidatePath("/settings");
  return { success: true, message: "Pengaturan sistem berhasil disimpan." };
}
