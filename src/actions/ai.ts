"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { generateAiAnalysis, type AiAnalysisResult } from "@/lib/ai/analyze";
import { getSystemSettings } from "@/actions/settings";
import type { Product, AnalyticsDay } from "@/types";

export async function generateBusinessAnalysis(): Promise<AiAnalysisResult> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [{ data: productRows }, { data: analyticsRows }, settings] = await Promise.all([
    supabase.from("products").select("*").eq("status", "active"),
    supabase.from("analytics").select("*").gte("date", since.toISOString().slice(0, 10)),
    getSystemSettings(),
  ]);

  const products = (productRows ?? []) as Product[];
  const analytics = (analyticsRows ?? []) as AnalyticsDay[];

  const totals = analytics.reduce(
    (acc, row) => {
      acc.revenue += Number(row.revenue) || 0;
      acc.cost += Number(row.cost) || 0;
      acc.profit += Number(row.profit) || 0;
      acc.rawMaterial += Number(row.raw_material_cost) || 0;
      acc.packaging += Number(row.packaging_cost) || 0;
      acc.labor += Number(row.labor_cost) || 0;
      acc.utility += Number(row.utility_cost) || 0;
      acc.operational += Number(row.operational_cost) || 0;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0, rawMaterial: 0, packaging: 0, labor: 0, utility: 0, operational: 0 }
  );

  const totalCostBreakdown = totals.rawMaterial + totals.packaging + totals.labor + totals.utility + totals.operational;
  const costBreakdown = [
    { label: "Bahan Baku", percent: totalCostBreakdown > 0 ? (totals.rawMaterial / totalCostBreakdown) * 100 : 0 },
    { label: "Kemasan", percent: totalCostBreakdown > 0 ? (totals.packaging / totalCostBreakdown) * 100 : 0 },
    { label: "Tenaga Kerja", percent: totalCostBreakdown > 0 ? (totals.labor / totalCostBreakdown) * 100 : 0 },
    { label: "Utilitas", percent: totalCostBreakdown > 0 ? (totals.utility / totalCostBreakdown) * 100 : 0 },
    { label: "Operasional", percent: totalCostBreakdown > 0 ? (totals.operational / totalCostBreakdown) * 100 : 0 },
  ];

  const sortedByUnits = [...products].sort((a, b) => b.units_sold - a.units_sold);
  const sortedByMargin = [...products].sort((a, b) => a.margin_percent - b.margin_percent);

  return generateAiAnalysis({
    companyName: settings.company_name,
    totalRevenue: totals.revenue,
    totalCost: totals.cost,
    totalProfit: totals.profit,
    averageMargin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
    topProducts: sortedByUnits.slice(0, 3).map((p) => ({
      name: p.name,
      unitsSold: p.units_sold,
      profitPerItem: p.profit_per_item,
      marginPercent: p.margin_percent,
    })),
    laggingProducts: sortedByMargin.slice(0, 3).map((p) => ({
      name: p.name,
      unitsSold: p.units_sold,
      profitPerItem: p.profit_per_item,
      marginPercent: p.margin_percent,
    })),
    costBreakdown,
  });
}
