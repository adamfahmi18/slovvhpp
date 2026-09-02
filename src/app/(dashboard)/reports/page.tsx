import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/components/reports/reports-view";
import { getReportRows } from "@/actions/reports";
import type { PeriodType } from "@/types";

export const metadata: Metadata = { title: "Laporan" };
export const dynamic = "force-dynamic";

const VALID_PERIODS: PeriodType[] = ["daily", "weekly", "monthly", "yearly"];
const RANGE_DAYS: Record<PeriodType, number> = {
  daily: 30,
  weekly: 90,
  monthly: 365,
  yearly: 365 * 3,
};

interface ReportsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const period = (VALID_PERIODS.includes(params.period as PeriodType) ? params.period : "monthly") as PeriodType;

  const rows = await getReportRows(period, RANGE_DAYS[period]);

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Ringkasan pendapatan, biaya, dan profit per periode. Ekspor ke Excel atau PDF."
      />
      <ReportsView period={period} rows={rows} />
    </div>
  );
}
