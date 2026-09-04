"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOverheadSettingsAction } from "@/actions/overhead";
import { useSettingsForm, SubmitButton } from "@/components/settings/settings-form-shell";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface OverheadSettingsCardProps {
  totalMonthlyOverhead: number;
  estimatedMonthlyProduction: number;
  overheadPerUnit: number;
}

export function OverheadSettingsCard({
  totalMonthlyOverhead,
  estimatedMonthlyProduction,
  overheadPerUnit,
}: OverheadSettingsCardProps) {
  const { state, formAction } = useSettingsForm(updateOverheadSettingsAction, true);

  return (
    <Card className="mb-6">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Alokasi Overhead per Unit</CardTitle>
          <CardDescription>
            Total biaya overhead bulanan dibagi estimasi jumlah unit yang diproduksi setiap bulan. Hasilnya otomatis
            ditambahkan ke setiap perhitungan HPP di Kalkulator dan Produk.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-secondary">Total Overhead / Bulan</p>
            <p className="mt-1 font-heading text-lg font-semibold text-foreground">
              {formatCurrency(totalMonthlyOverhead)}
            </p>
          </div>
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="estimatedMonthlyProduction">Estimasi Produksi / Bulan (unit)</Label>
            <Input
              id="estimatedMonthlyProduction"
              name="estimatedMonthlyProduction"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={estimatedMonthlyProduction}
            />
            {state?.errors?.estimatedMonthlyProduction && (
              <p className="text-xs text-destructive">{state.errors.estimatedMonthlyProduction[0]}</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-secondary">Overhead per Unit</p>
            <p className="mt-1 font-heading text-lg font-semibold text-foreground">
              {formatCurrency(overheadPerUnit)}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              {formatCurrency(totalMonthlyOverhead)} ÷ {formatNumber(estimatedMonthlyProduction)} unit
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Simpan Estimasi</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
