"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateHpp } from "@/lib/calculations/hpp";
import { calculationSchema } from "@/lib/validations/calculation";
import { getOverheadPerUnit } from "@/actions/overhead";
import type { ActionResult, Calculation } from "@/types";

export async function saveCalculation(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = calculationSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali input kalkulator.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  const overheadPerUnit = await getOverheadPerUnit();
  const overheadCost = overheadPerUnit * parsed.data.quantityProduced;
  const hpp = calculateHpp({ ...parsed.data, overheadCost });
  const supabase = createServiceClient();

  const { error } = await supabase.from("calculations").insert({
    user_id: session?.userId ?? null,
    product_name: parsed.data.productName,
    raw_material_cost: parsed.data.rawMaterialCost,
    packaging_cost: parsed.data.packagingCost,
    labor_cost: parsed.data.laborCost,
    utility_cost: parsed.data.utilityCost,
    operational_cost: parsed.data.operationalCost,
    overhead_cost: overheadCost,
    additional_cost: parsed.data.additionalCost,
    quantity_produced: parsed.data.quantityProduced,
    margin_percent: parsed.data.marginPercent,
    total_cost: hpp.totalCost,
    cost_per_item: hpp.costPerItem,
    selling_price: hpp.sellingPrice,
    profit_per_item: hpp.profitPerItem,
  });

  if (error) {
    return { success: false, message: "Gagal menyimpan kalkulasi." };
  }

  revalidatePath("/calculator");
  return { success: true, message: "Kalkulasi tersimpan ke riwayat." };
}

export async function getRecentCalculations(limit = 8): Promise<Calculation[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Calculation[];
}
