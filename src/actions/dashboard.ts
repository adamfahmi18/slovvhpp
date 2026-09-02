"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { AnalyticsDay, DashboardSummary } from "@/types";

// See the comment in actions/reports.ts: analytics.date is a date-only
// Postgres value, so every Date here is built and read via UTC methods to
// stay correct no matter which timezone the server process runs in.
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(date);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createServiceClient();

  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  since.setDate(1);

  const { data } = await supabase
    .from("analytics")
    .select("*")
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const rows = (data ?? []) as AnalyticsDay[];

  // "Now" anchored to UTC calendar fields so it lines up with the
  // UTC-parsed rows above (both sides of every monthKey() comparison use
  // the same convention).
  const nowInstant = new Date();
  const now = new Date(Date.UTC(nowInstant.getUTCFullYear(), nowInstant.getUTCMonth(), 1));
  const currentKey = monthKey(now);
  const prevDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevKey = monthKey(prevDate);

  const byMonth = new Map<string, { revenue: number; cost: number; profit: number }>();
  for (const row of rows) {
    const d = parseDateOnly(row.date);
    const key = monthKey(d);
    const entry = byMonth.get(key) ?? { revenue: 0, cost: 0, profit: 0 };
    entry.revenue += Number(row.revenue) || 0;
    entry.cost += Number(row.cost) || 0;
    entry.profit += Number(row.profit) || 0;
    byMonth.set(key, entry);
  }

  const current = byMonth.get(currentKey) ?? { revenue: 0, cost: 0, profit: 0 };
  const previous = byMonth.get(prevKey) ?? { revenue: 0, cost: 0, profit: 0 };

  const currentMargin = current.revenue > 0 ? (current.profit / current.revenue) * 100 : 0;
  const previousMargin = previous.revenue > 0 ? (previous.profit / previous.revenue) * 100 : 0;

  const monthlyOverview: DashboardSummary["monthlyOverview"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKey(d);
    const entry = byMonth.get(key);
    monthlyOverview.push({
      month: monthLabel(d),
      revenue: entry?.revenue ?? 0,
      cost: entry?.cost ?? 0,
      profit: entry?.profit ?? 0,
    });
  }

  return {
    revenue: current.revenue,
    cost: current.cost,
    profit: current.profit,
    marginPercent: currentMargin,
    revenueChangePercent: percentChange(current.revenue, previous.revenue),
    costChangePercent: percentChange(current.cost, previous.cost),
    profitChangePercent: percentChange(current.profit, previous.profit),
    marginChangePercent: currentMargin - previousMargin,
    monthlyOverview,
  };
}
