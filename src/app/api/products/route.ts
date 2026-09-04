import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireApiSession } from "@/lib/api-auth";
import { calculateHpp } from "@/lib/calculations/hpp";
import { productSchema } from "@/lib/validations/product";
import { syncProductRecipe } from "@/actions/raw-materials";
import { getOverheadPerUnit } from "@/actions/overhead";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Number(searchParams.get("pageSize")) || 10);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const status = searchParams.get("status") ?? "all";

  const supabase = createServiceClient();
  let query = supabase.from("products").select("*", { count: "exact" });

  if (search) query = query.ilike("name", `%${search}%`);
  if (category !== "all") query = query.eq("category", category);
  if (status !== "all") query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    return NextResponse.json({ success: false, message: "Gagal mengambil data produk." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ?? [],
    meta: { total: count ?? 0, page, pageSize },
  });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Data tidak valid.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Insert first (placeholder cost fields) so the recipe rows have a
  // product_id to reference, then recompute and patch the real costs.
  // raw_material_cost is intentionally NOT taken from the request body:
  // it's always derived server-side from `recipeItems`, the same as the
  // web UI, so it can't be set arbitrarily via the API.
  const { data: inserted, error: insertError } = await supabase
    .from("products")
    .insert({
      user_id: session!.userId,
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
    return NextResponse.json({ success: false, message: "Gagal membuat produk." }, { status: 500 });
  }

  const [{ rawMaterialCost }, overheadPerUnit] = await Promise.all([
    syncProductRecipe(inserted.id, (body as Record<string, unknown> | null)?.recipeItems ?? []),
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

  const { data, error } = await supabase
    .from("products")
    .update({
      raw_material_cost: rawMaterialCost,
      overhead_cost: overheadCost,
      total_cost: hpp.totalCost,
      cost_per_item: hpp.costPerItem,
      selling_price: hpp.sellingPrice,
      profit_per_item: hpp.profitPerItem,
    })
    .eq("id", inserted.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Gagal membuat produk." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
