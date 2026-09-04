"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { AnalyticsDay, Product } from "@/types";

export interface AnalyticsData {
  trend: { date: string; revenue: number; profit: number }[];
  costBreakdown: { label: string; value: number }[];
  topProducts: Pick<Product, "id" | "name" | "units_sold" | "profit_per_item" | "margin_percent">[];
  laggingProducts: Pick<Product, "id" | "name" | "units_sold" | "profit_per_item" | "margin_percent">[];
}

export async function getAnalyticsData(rangeDays = 90): Promise<AnalyticsData> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - rangeDays);

  const [{ data: analyticsRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("analytics")
      .select("*")
      .gte("date", since.toISOString().slice(0, 10))
      .order("date", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, units_sold, profit_per_item, margin_percent")
      .eq("status", "active"),
  ]);

  const rows = (analyticsRows ?? []) as AnalyticsDay[];
  const products = (productRows ?? []) as Product[];

  const trend = rows.map((row) => ({
    date: row.date,
    revenue: Number(row.revenue) || 0,
    profit: Number(row.profit) || 0,
  }));

  const totals = rows.reduce(
    (acc, row) => {
      acc.rawMaterial += Number(row.raw_material_cost) || 0;
      acc.packaging += Number(row.packaging_cost) || 0;
      acc.labor += Number(row.labor_cost) || 0;
      acc.utility += Number(row.utility_cost) || 0;
      acc.operational += Number(row.operational_cost) || 0;
      acc.overhead += Number(row.overhead_cost) || 0;
      return acc;
    },
    { rawMaterial: 0, packaging: 0, labor: 0, utility: 0, operational: 0, overhead: 0 }
  );

  const costBreakdown = [
    { label: "Bahan Baku", value: totals.rawMaterial },
    { label: "Kemasan", value: totals.packaging },
    { label: "Tenaga Kerja", value: totals.labor },
    { label: "Utilitas", value: totals.utility },
    { label: "Operasional", value: totals.operational },
    { label: "Overhead", value: totals.overhead },
  ];

  const sortedByUnitsSold = [...products].sort((a, b) => b.units_sold - a.units_sold);
  const sortedByMargin = [...products].sort((a, b) => a.margin_percent - b.margin_percent);

  return {
    trend,
    costBreakdown,
    topProducts: sortedByUnitsSold.slice(0, 5),
    laggingProducts: sortedByMargin.slice(0, 5),
  };
}
