"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { rawMaterialSchema, recipeItemsSchema } from "@/lib/validations/raw-material";
import type { ActionResult, PaginatedResult, RawMaterial, RecipeItemWithMaterial } from "@/types";

export interface GetRawMaterialsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getRawMaterials(params: GetRawMaterialsParams = {}): Promise<PaginatedResult<RawMaterial>> {
  const { search = "", page = 1, pageSize = 10 } = params;
  const supabase = createServiceClient();

  let query = supabase.from("raw_materials").select("*", { count: "exact" });
  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.order("name", { ascending: true }).range(from, to);

  if (error) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as RawMaterial[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Full, unpaginated list — used to populate the raw material picker in the recipe builder. */
export async function getAllRawMaterials(): Promise<RawMaterial[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("raw_materials").select("*").order("name", { ascending: true });
  if (error) return [];
  return (data ?? []) as RawMaterial[];
}

export async function getProductRecipe(productId: string): Promise<RecipeItemWithMaterial[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_recipe_items")
    .select("id, product_id, raw_material_id, quantity, raw_material:raw_materials(id, name, unit, price_per_unit)")
    .eq("product_id", productId);

  if (error || !data) return [];
  // Supabase types the joined relation as an array even for a to-one join; normalize it.
  return data.map((row) => ({
    ...row,
    raw_material: Array.isArray(row.raw_material) ? row.raw_material[0] : row.raw_material,
  })) as unknown as RecipeItemWithMaterial[];
}

export async function createRawMaterial(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = rawMaterialSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data bahan baku.", errors: parsed.error.flatten().fieldErrors };
  }

  const session = await getSession();
  const supabase = createServiceClient();
  const { error } = await supabase.from("raw_materials").insert({
    user_id: session?.userId ?? null,
    name: parsed.data.name,
    unit: parsed.data.unit,
    price_per_unit: parsed.data.pricePerUnit,
    stock_quantity: parsed.data.stockQuantity,
  });

  if (error) {
    return { success: false, message: "Gagal menyimpan bahan baku. Coba lagi." };
  }

  revalidatePath("/bahan-baku");
  revalidatePath("/products");
  return { success: true, message: "Bahan baku berhasil ditambahkan." };
}

export async function updateRawMaterial(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = rawMaterialSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Periksa kembali data bahan baku.", errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("raw_materials")
    .update({
      name: parsed.data.name,
      unit: parsed.data.unit,
      price_per_unit: parsed.data.pricePerUnit,
      stock_quantity: parsed.data.stockQuantity,
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: "Gagal memperbarui bahan baku. Coba lagi." };
  }

  revalidatePath("/bahan-baku");
  revalidatePath("/products");
  return { success: true, message: "Bahan baku berhasil diperbarui." };
}

export async function deleteRawMaterial(id: string): Promise<ActionResult> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("raw_materials").delete().eq("id", id);

  if (error) {
    // Foreign key restrict: material is still used in one or more product recipes.
    if (error.code === "23503") {
      return {
        success: false,
        message: "Bahan ini masih dipakai di resep produk. Hapus dari resep produk terlebih dahulu.",
      };
    }
    return { success: false, message: "Gagal menghapus bahan baku." };
  }

  revalidatePath("/bahan-baku");
  return { success: true, message: "Bahan baku berhasil dihapus." };
}

/**
 * Replace a product's recipe with the given items and return the computed
 * raw material cost (sum of quantity × price_per_unit). Used by the product
 * create/update actions so `raw_material_cost` always matches the recipe.
 */
export async function syncProductRecipe(
  productId: string,
  itemsRaw: unknown
): Promise<{ rawMaterialCost: number }> {
  const parsed = recipeItemsSchema.safeParse(itemsRaw);
  const items = parsed.success ? parsed.data : [];

  const supabase = createServiceClient();
  await supabase.from("product_recipe_items").delete().eq("product_id", productId);

  if (items.length === 0) return { rawMaterialCost: 0 };

  const materialIds = items.map((item) => item.rawMaterialId);
  const { data: materials } = await supabase
    .from("raw_materials")
    .select("id, price_per_unit")
    .in("id", materialIds);

  const priceById = new Map((materials ?? []).map((m: { id: string; price_per_unit: number }) => [m.id, m.price_per_unit]));

  const rawMaterialCost = items.reduce((sum, item) => sum + item.quantity * (priceById.get(item.rawMaterialId) ?? 0), 0);

  await supabase.from("product_recipe_items").insert(
    items.map((item) => ({
      product_id: productId,
      raw_material_id: item.rawMaterialId,
      quantity: item.quantity,
    }))
  );

  return { rawMaterialCost };
}
