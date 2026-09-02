import type { Metadata } from "next";
import { DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardSummary } from "@/actions/dashboard";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan performa bisnis Anda bulan ini." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pendapatan"
          value={summary.revenue}
          formatter={formatCurrency}
          changePercent={summary.revenueChangePercent}
          icon={DollarSign}
          index={0}
        />
        <StatCard
          label="Biaya"
          value={summary.cost}
          formatter={formatCurrency}
          changePercent={summary.costChangePercent}
          icon={TrendingDown}
          index={1}
        />
        <StatCard
          label="Profit"
          value={summary.profit}
          formatter={formatCurrency}
          changePercent={summary.profitChangePercent}
          icon={TrendingUp}
          index={2}
        />
        <StatCard
          label="Margin"
          value={summary.marginPercent}
          formatter={(v) => formatPercent(v)}
          changePercent={summary.marginChangePercent}
          icon={Percent}
          index={3}
        />
      </div>

      <div className="mt-4">
        <RevenueChart data={summary.monthlyOverview} />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Aksi Cepat</h3>
        <QuickActions />
      </div>
    </div>
  );
}
