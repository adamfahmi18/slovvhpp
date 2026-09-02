"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { AnalyticsDay, PeriodType, Report } from "@/types";

/**
 * `analytics.date` is a Postgres `date` (no time component), returned as a
 * "YYYY-MM-DD" string. Parsing that with `new Date(str)` yields UTC
 * midnight, but reading it back with local getters (`getFullYear`,
 * `getMonth`, `getDay`, ...) re-interprets it in the *server process's*
 * timezone — which silently shifts the calendar day by one outside UTC
 * hosts. Everything below works on the UTC representation explicitly so
 * bucketing is correct regardless of where the server runs.
 */
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeekUtc(date: Date) {
  const d = new Date(date.getTime());
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setUTCDate(diff);
  return d;
}

function bucketKey(date: Date, period: PeriodType) {
  if (period === "daily") return toDateOnlyString(date);
  if (period === "weekly") return toDateOnlyString(startOfWeekUtc(date));
  if (period === "monthly")
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return `${date.getUTCFullYear()}-01-01`;
}

/**
 * Builds report rows on the fly from the `analytics` daily rollups, bucketed
 * by the requested period. This keeps Reports accurate without depending on
 * a separate scheduled job to populate the `reports` table.
 */
export async function getReportRows(periodType: PeriodType, rangeDays = 180): Promise<Report[]> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - rangeDays);

  const { data } = await supabase
    .from("analytics")
    .select("*")
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const rows = (data ?? []) as AnalyticsDay[];

  const buckets = new Map<
    string,
    { revenue: number; cost: number; profit: number; margins: number[]; start: Date; end: Date }
  >();

  for (const row of rows) {
    const d = parseDateOnly(row.date);
    const key = bucketKey(d, periodType);
    const entry = buckets.get(key) ?? {
      revenue: 0,
      cost: 0,
      profit: 0,
      margins: [],
      start: d,
      end: d,
    };
    entry.revenue += Number(row.revenue) || 0;
    entry.cost += Number(row.cost) || 0;
    entry.profit += Number(row.profit) || 0;
    if (Number(row.revenue) > 0) entry.margins.push((Number(row.profit) / Number(row.revenue)) * 100);
    entry.start = d < entry.start ? d : entry.start;
    entry.end = d > entry.end ? d : entry.end;
    buckets.set(key, entry);
  }

  const results: Report[] = Array.from(buckets.entries())
    .map(([key, entry]) => ({
      id: key,
      period_type: periodType,
      period_start: entry.start.toISOString().slice(0, 10),
      period_end: entry.end.toISOString().slice(0, 10),
      total_revenue: entry.revenue,
      total_cost: entry.cost,
      total_profit: entry.profit,
      average_margin: entry.margins.length
        ? entry.margins.reduce((a, b) => a + b, 0) / entry.margins.length
        : 0,
      units_sold: 0,
      product_count: 0,
      created_at: entry.end.toISOString(),
    }))
    .sort((a, b) => (a.period_start < b.period_start ? 1 : -1));

  return results;
}
