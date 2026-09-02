import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TrendChart } from "@/components/analytics/trend-chart";
import { CostBreakdownChart } from "@/components/analytics/cost-breakdown-chart";
import { ProductPerformance } from "@/components/analytics/product-performance";
import { AiInsightsPanel } from "@/components/analytics/ai-insights-panel";
import { getAnalyticsData } from "@/actions/analytics";

export const metadata: Metadata = { title: "Analitik" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData(90);

  return (
    <div className="space-y-4">
      <PageHeader title="Analitik" description="Tren, komposisi biaya, dan performa produk secara mendalam." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart data={data.trend} />
        </div>
        <CostBreakdownChart data={data.costBreakdown} />
      </div>

      <ProductPerformance topProducts={data.topProducts} laggingProducts={data.laggingProducts} />

      <AiInsightsPanel />
    </div>
  );
}
