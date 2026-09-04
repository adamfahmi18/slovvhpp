import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { HppForm } from "@/components/calculator/hpp-form";
import { getSystemSettings } from "@/actions/settings";
import { getOverheadSummary } from "@/actions/overhead";

export const metadata: Metadata = { title: "Kalkulator HPP" };
export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const [settings, overhead] = await Promise.all([getSystemSettings(), getOverheadSummary()]);

  return (
    <div>
      <PageHeader
        title="Kalkulator HPP"
        description="Hitung harga pokok produksi dan harga jual yang disarankan secara instan."
      />
      <HppForm
        defaultMarginPercent={Number(settings.default_margin_percent) || 30}
        overheadPerUnit={overhead.overheadPerUnit}
      />
    </div>
  );
}
