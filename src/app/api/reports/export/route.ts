import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getReportRows } from "@/actions/reports";
import type { PeriodType } from "@/types";

const VALID_PERIODS: PeriodType[] = ["daily", "weekly", "monthly", "yearly"];

/**
 * Returns report rows as JSON for a given period, for external tools or
 * scripts that want to build their own export. The web UI exports
 * Excel/PDF client-side directly from the Reports page for a snappier UX.
 */
export async function GET(request: NextRequest) {
  const { response } = await requireApiSession();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const period = (VALID_PERIODS.includes(searchParams.get("period") as PeriodType)
    ? searchParams.get("period")
    : "monthly") as PeriodType;

  const rows = await getReportRows(period);
  return NextResponse.json({ success: true, period, data: rows });
}
