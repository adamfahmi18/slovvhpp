import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { OverheadSettingsCard } from "@/components/overhead/overhead-settings-card";
import { OverheadToolbar } from "@/components/overhead/overhead-toolbar";
import { OverheadTable } from "@/components/overhead/overhead-table";
import { getOverheadSummary } from "@/actions/overhead";

export const metadata: Metadata = { title: "Overhead" };
export const dynamic = "force-dynamic";

export default async function OverheadPage() {
  const { items, totalMonthlyOverhead, estimatedMonthlyProduction, overheadPerUnit } = await getOverheadSummary();

  return (
    <div>
      <PageHeader
        title="Overhead"
        description="Kelola biaya tetap bulanan (sewa, gaji, listrik, dll) yang dialokasikan otomatis ke setiap unit produksi."
      />

      <OverheadSettingsCard
        totalMonthlyOverhead={totalMonthlyOverhead}
        estimatedMonthlyProduction={estimatedMonthlyProduction}
        overheadPerUnit={overheadPerUnit}
      />

      <OverheadToolbar />

      <Card className="overflow-hidden">
        <OverheadTable items={items} />
      </Card>
    </div>
  );
}
