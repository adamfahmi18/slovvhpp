"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateHpp } from "@/lib/calculations/hpp";
import { productSchema } from "@/lib/validations/product";
import { syncProductRecipe } from "@/actions/raw-materials";
import { getOverheadPerUnit } from "@/actions/overhead";
import type { ActionResult, PaginatedResult, Product } from "@/types";

export interface GetProductsParams {
  search?: string;
  category?: string;
  status?: "active" | "archived" | "all";
  page?: number;
  pageSize?: number;
}

export async function getProducts(params: GetProductsParams = {}): Promise<PaginatedResult<Product>> {
  const { search = "", category = "all", status = "all", page = 1, pageSize = 10 } = params;
  const supabase = createServiceClient();

  let query = supabase.from("products").select("*", { count: "exact" });

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }
  if (category !== "all") {
    query = query.eq("category", category);
  }
  if (status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as Product[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductCategories(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("products").select("category");
  const set = new Set((data ?? []).map((row: { category: string }) => row.category));
  return Array.from(set).sort();
}

export async function createProduct(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data produk.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  const supabase = createServiceClient();

  // Insert first (placeholder cost fields) so the recipe rows have a
  // product_id to reference, then recompute and patch the real costs.
  const { data: inserted, error: insertError } = await supabase
    .from("products")
    .insert({
      user_id: session?.userId ?? null,
      name: parsed.data.name,
      category: parsed.data.category || "Umum",
      sku: parsed.data.sku || null,
      packaging_cost: parsed.data.packagingCost,
      labor_cost: parsed.data.laborCost,
      utility_cost: parsed.data.utilityCost,
      operational_cost: parsed.data.operationalCost,
      additional_cost: parsed.data.additionalCost,
      quantity_produced: parsed.data.quantityProduced,
      margin_percent: parsed.data.marginPercent,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, message: "Gagal menyimpan produk. Coba lagi." };
  }

  const [{ rawMaterialCost }, overheadPerUnit] = await Promise.all([
    syncProductRecipe(inserted.id, parseRecipeItems(formData)),
    getOverheadPerUnit(),
  ]);
  const overheadCost = overheadPerUnit * parsed.data.quantityProduced;
  const hpp = calculateHpp({
    rawMaterialCost,
    packagingCost: parsed.data.packagingCost,
    laborCost: parsed.data.laborCost,
    utilityCost: parsed.data.utilityCost,
    operationalCost: parsed.data.operationalCost,
    overheadCost,
    additionalCost: parsed.data.additionalCost,
    quantityProduced: parsed.data.quantityProduced,
    marginPercent: parsed.data.marginPercent,
  });

  const { error } = await supabase
    .from("products")
    .update({
      raw_material_cost: rawMaterialCost,
      overhead_cost: overheadCost,
      total_cost: hpp.totalCost,
      cost_per_item: hpp.costPerItem,
      selling_price: hpp.sellingPrice,
      profit_per_item: hpp.profitPerItem,
    })
    .eq("id", inserted.id);

  if (error) {
    return { success: false, message: "Gagal menyimpan produk. Coba lagi." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true, message: "Produk berhasil ditambahkan." };
}

function parseRecipeItems(formData: FormData): unknown {
  const raw = formData.get("recipeItems");
  if (!raw) return [];
  try {
    return JSON.parse(String(raw));
  } catch {
    return [];
  }
}

export async function updateProduct(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data produk.", errors: parsed.error.flatten().fieldErrors };
  }

  const [{ rawMaterialCost }, overheadPerUnit] = await Promise.all([
    syncProductRecipe(id, parseRecipeItems(formData)),
    getOverheadPerUnit(),
  ]);
  const overheadCost = overheadPerUnit * parsed.data.quantityProduced;
  const hpp = calculateHpp({
    rawMaterialCost,
    packagingCost: parsed.data.packagingCost,
    laborCost: parsed.data.laborCost,
    utilityCost: parsed.data.utilityCost,
    operationalCost: parsed.data.operationalCost,
    overheadCost,
    additionalCost: parsed.data.additionalCost,
    quantityProduced: parsed.data.quantityProduced,
    marginPercent: parsed.data.marginPercent,
  });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      category: parsed.data.category || "Umum",
      sku: parsed.data.sku || null,
      raw_material_cost: rawMaterialCost,
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
      status: parsed.data.status,
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: "Gagal memperbarui produk. Coba lagi." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true, message: "Produk berhasil diperbarui." };
}

export async function createProductFromCalculation(input: {
  productName: string;
  rawMaterialCost: number;
  packagingCost: number;
  laborCost: number;
  utilityCost: number;
  operationalCost: number;
  additionalCost: number;
  quantityProduced: number;
  marginPercent: number;
}): Promise<ActionResult> {
  const session = await getSession();
  const overheadPerUnit = await getOverheadPerUnit();
  const overheadCost = overheadPerUnit * input.quantityProduced;
  const hpp = calculateHpp({ ...input, overheadCost });
  const supabase = createServiceClient();

  const { error } = await supabase.from("products").insert({
    user_id: session?.userId ?? null,
    name: input.productName,
    category: "Umum",
    raw_material_cost: input.rawMaterialCost,
    packaging_cost: input.packagingCost,
    labor_cost: input.laborCost,
    utility_cost: input.utilityCost,
    operational_cost: input.operationalCost,
    overhead_cost: overheadCost,
    additional_cost: input.additionalCost,
    quantity_produced: input.quantityProduced,
    margin_percent: input.marginPercent,
    total_cost: hpp.totalCost,
    cost_per_item: hpp.costPerItem,
    selling_price: hpp.sellingPrice,
    profit_per_item: hpp.profitPerItem,
    status: "active",
  });

  if (error) {
    return { success: false, message: "Gagal menyimpan produk dari kalkulator." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true, message: "Produk baru berhasil dibuat dari hasil kalkulasi." };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Gagal menghapus produk." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true, message: "Produk berhasil dihapus." };
}
