"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { overheadCostSchema, overheadSettingsSchema } from "@/lib/validations/overhead";
import type { ActionResult, OverheadCost, OverheadSummary } from "@/types";

export async function getOverheadCosts(): Promise<OverheadCost[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("overhead_costs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as OverheadCost[];
}

/**
 * Total monthly overhead ÷ estimated monthly production = overhead cost per
 * unit. This is the single source of truth used everywhere HPP is computed
 * (Kalkulator, form Produk, dan saat menyimpan produk/kalkulasi), so the
 * allocation always matches what's configured on the Overhead page.
 */
export async function getOverheadSummary(): Promise<OverheadSummary> {
  const supabase = createServiceClient();
  const [{ data: items }, { data: settings }] = await Promise.all([
    supabase.from("overhead_costs").select("*").order("created_at", { ascending: false }),
    supabase.from("app_settings").select("estimated_monthly_production").eq("id", true).maybeSingle(),
  ]);

  const rows = (items ?? []) as OverheadCost[];
  const totalMonthlyOverhead = rows.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const estimatedMonthlyProduction = Math.max(0, Number(settings?.estimated_monthly_production) || 0);
  const overheadPerUnit = estimatedMonthlyProduction > 0 ? totalMonthlyOverhead / estimatedMonthlyProduction : 0;

  return { items: rows, totalMonthlyOverhead, estimatedMonthlyProduction, overheadPerUnit };
}

/**
 * Overhead cost per unit only — the value every HPP calculation multiplies
 * by `quantityProduced` before persisting `overhead_cost`. Kept separate
 * from `getOverheadSummary` so server actions that only need the number
 * don't have to pull the full item list.
 */
export async function getOverheadPerUnit(): Promise<number> {
  const { overheadPerUnit } = await getOverheadSummary();
  return overheadPerUnit;
}

export async function createOverheadCost(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = overheadCostSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data biaya overhead.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  const supabase = createServiceClient();
  const { error } = await supabase.from("overhead_costs").insert({
    user_id: session?.userId ?? null,
    name: parsed.data.name,
    amount: parsed.data.amount,
  });

  if (error) {
    return { success: false, message: "Gagal menyimpan biaya overhead. Coba lagi." };
  }

  revalidatePath("/overhead");
  revalidatePath("/calculator");
  revalidatePath("/products");
  return { success: true, message: "Biaya overhead berhasil ditambahkan." };
}

export async function updateOverheadCost(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = overheadCostSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data biaya overhead.", errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("overhead_costs")
    .update({ name: parsed.data.name, amount: parsed.data.amount })
    .eq("id", id);

  if (error) {
    return { success: false, message: "Gagal memperbarui biaya overhead. Coba lagi." };
  }

  revalidatePath("/overhead");
  revalidatePath("/calculator");
  revalidatePath("/products");
  return { success: true, message: "Biaya overhead berhasil diperbarui." };
}

export async function deleteOverheadCost(id: string): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("overhead_costs").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Gagal menghapus biaya overhead." };
  }

  revalidatePath("/overhead");
  revalidatePath("/calculator");
  revalidatePath("/products");
  return { success: true, message: "Biaya overhead berhasil dihapus." };
}

export async function updateOverheadSettingsAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = overheadSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali estimasi produksi bulanan.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ estimated_monthly_production: parsed.data.estimatedMonthlyProduction })
    .eq("id", true);

  if (error) {
    return { success: false, message: "Gagal menyimpan estimasi produksi." };
  }

  revalidatePath("/overhead");
  revalidatePath("/calculator");
  revalidatePath("/products");
  return { success: true, message: "Estimasi produksi bulanan berhasil disimpan." };
}
