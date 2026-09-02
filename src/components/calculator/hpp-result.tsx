"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { HppResult } from "@/lib/calculations/hpp";

const BREAKDOWN_COLORS: Record<string, string> = {
  "Bahan Baku": "#0C0A09",
  Kemasan: "#57534E",
  "Tenaga Kerja": "#78716C",
  Utilitas: "#A8A29E",
  Operasional: "#D6D3D1",
  Tambahan: "#E7E5E4",
};

export function HppResultPanel({ result }: { result: HppResult }) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Hasil Kalkulasi</CardTitle>
          <CardDescription>Diperbarui otomatis saat Anda mengubah input</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <ResultItem label="Total Biaya" value={formatCurrency(result.totalCost)} />
          <ResultItem label="Biaya per Unit" value={formatCurrency(result.costPerItem)} />
          <ResultItem label="Harga Jual Disarankan" value={formatCurrency(result.sellingPrice)} highlight />
          <ResultItem label="Profit per Unit" value={formatCurrency(result.profitPerItem)} success />
          <ResultItem label="Margin" value={formatPercent(result.marginPercent)} className="col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rincian Biaya</CardTitle>
          <CardDescription>Kontribusi setiap komponen terhadap total biaya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {result.costBreakdown.map((item) => (
              <motion.div
                key={item.label}
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ backgroundColor: BREAKDOWN_COLORS[item.label] }}
              />
            ))}
          </div>
          <ul className="space-y-2">
            {result.costBreakdown.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: BREAKDOWN_COLORS[item.label] }}
                  />
                  {item.label}
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.value)}
                  <span className="ml-1.5 text-xs text-stone-400">{formatPercent(item.percent, 0)}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultItem({
  label,
  value,
  highlight,
  success,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-secondary">{label}</p>
      <p
        className={`mt-1 font-heading text-lg font-semibold ${
          success ? "text-success" : highlight ? "text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
