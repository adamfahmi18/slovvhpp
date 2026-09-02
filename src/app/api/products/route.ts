import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireApiSession } from "@/lib/api-auth";
import { calculateHpp } from "@/lib/calculations/hpp";
import { productSchema } from "@/lib/validations/product";

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

  const hpp = calculateHpp(parsed.data);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: session!.userId,
      name: parsed.data.name,
      category: parsed.data.category || "Umum",
      sku: parsed.data.sku || null,
      raw_material_cost: parsed.data.rawMaterialCost,
      packaging_cost: parsed.data.packagingCost,
      labor_cost: parsed.data.laborCost,
      utility_cost: parsed.data.utilityCost,
      operational_cost: parsed.data.operationalCost,
      additional_cost: parsed.data.additionalCost,
      quantity_produced: parsed.data.quantityProduced,
      margin_percent: parsed.data.marginPercent,
      total_cost: hpp.totalCost,
      cost_per_item: hpp.costPerItem,
      selling_price: hpp.sellingPrice,
      profit_per_item: hpp.profitPerItem,
      status: parsed.data.status,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Gagal membuat produk." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
