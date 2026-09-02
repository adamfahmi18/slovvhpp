import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireApiSession } from "@/lib/api-auth";
import { calculateHpp } from "@/lib/calculations/hpp";
import { productSchema } from "@/lib/validations/product";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiSession();
  if (response) return response;

  const { id } = await params;
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ success: false, message: "Produk tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiSession();
  if (response) return response;

  const { id } = await params;
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
    .update({
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
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Gagal memperbarui produk." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiSession();
  if (response) return response;

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus produk." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
}
