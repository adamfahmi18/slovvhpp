"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Save, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculationSchema, type CalculationInput } from "@/lib/validations/calculation";
import { calculateHpp } from "@/lib/calculations/hpp";
import { HppResultPanel } from "./hpp-result";
import { saveCalculation } from "@/actions/calculations";
import { createProductFromCalculation } from "@/actions/products";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";

const FIELDS: { name: keyof CalculationInput; label: string; placeholder: string }[] = [
  { name: "rawMaterialCost", label: "Biaya Bahan Baku", placeholder: "0" },
  { name: "packagingCost", label: "Biaya Kemasan", placeholder: "0" },
  { name: "laborCost", label: "Biaya Tenaga Kerja", placeholder: "0" },
  { name: "utilityCost", label: "Biaya Utilitas", placeholder: "0" },
  { name: "operationalCost", label: "Biaya Operasional", placeholder: "0" },
  { name: "additionalCost", label: "Biaya Tambahan", placeholder: "0" },
];

const DEFAULT_VALUES: CalculationInput = {
  productName: "",
  rawMaterialCost: 0,
  packagingCost: 0,
  laborCost: 0,
  utilityCost: 0,
  operationalCost: 0,
  additionalCost: 0,
  quantityProduced: 1,
  marginPercent: 30,
};

export function HppForm({
  defaultMarginPercent = 30,
  overheadPerUnit = 0,
}: {
  defaultMarginPercent?: number;
  overheadPerUnit?: number;
}) {
  const [isSaving, startSaving] = useTransition();
  const [isCreatingProduct, startCreatingProduct] = useTransition();

  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CalculationInput>({
    resolver: zodResolver(calculationSchema),
    defaultValues: { ...DEFAULT_VALUES, marginPercent: defaultMarginPercent },
    mode: "onChange",
  });

  const values = watch();
  const [marginPercent, setMarginPercent] = useState(defaultMarginPercent);

  const quantityProduced = Number(values.quantityProduced) || 1;
  const overheadCost = overheadPerUnit * quantityProduced;

  const result = useMemo(
    () =>
      calculateHpp({
        rawMaterialCost: Number(values.rawMaterialCost) || 0,
        packagingCost: Number(values.packagingCost) || 0,
        laborCost: Number(values.laborCost) || 0,
        utilityCost: Number(values.utilityCost) || 0,
        operationalCost: Number(values.operationalCost) || 0,
        overheadCost,
        additionalCost: Number(values.additionalCost) || 0,
        quantityProduced,
        marginPercent,
      }),
    [values, marginPercent, overheadCost, quantityProduced]
  );

  function handleSave() {
    const current = getValues();
    const parsed = calculationSchema.safeParse({ ...current, marginPercent });
    if (!parsed.success) {
      toast.error("Lengkapi nama produk dan pastikan angka valid sebelum menyimpan.");
      return;
    }
    const formData = new FormData();
    Object.entries(parsed.data).forEach(([key, value]) => formData.set(key, String(value)));

    startSaving(async () => {
      const res = await saveCalculation(null, formData);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  function handleCreateProduct() {
    const current = getValues();
    const parsed = calculationSchema.safeParse({ ...current, marginPercent });
    if (!parsed.success) {
      toast.error("Lengkapi nama produk dan pastikan angka valid sebelum menyimpan.");
      return;
    }
    startCreatingProduct(async () => {
      const res = await createProductFromCalculation(parsed.data);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:col-span-3"
      >
        <Card>
          <CardHeader>
            <CardTitle>Detail Produksi</CardTitle>
            <CardDescription>Masukkan seluruh komponen biaya untuk satu batch produksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="productName">Nama Produk</Label>
              <Input id="productName" placeholder="Contoh: Kopi Susu 250ml" {...register("productName")} />
              {errors.productName && <p className="text-xs text-destructive">{errors.productName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                      Rp
                    </span>
                    <Input
                      id={field.name}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      placeholder={field.placeholder}
                      className="pl-9"
                      {...register(field.name, { valueAsNumber: true })}
                    />
                  </div>
                  {errors[field.name] && (
                    <p className="text-xs text-destructive">{errors[field.name]?.message as string}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantityProduced">Jumlah Diproduksi</Label>
              <Input
                id="quantityProduced"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="1"
                {...register("quantityProduced", { valueAsNumber: true })}
              />
              {errors.quantityProduced && (
                <p className="text-xs text-destructive">{errors.quantityProduced.message}</p>
              )}
            </div>

            <div className="space-y-1 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alokasi Overhead (otomatis)</Label>
                <span className="text-sm font-medium text-foreground">{formatCurrency(overheadCost)}</span>
              </div>
              <p className="text-xs text-secondary">
                {formatCurrency(overheadPerUnit)}/unit × {quantityProduced} unit — dihitung dari total biaya
                overhead bulanan ÷ estimasi produksi bulanan. Atur di{" "}
                <Link href="/overhead" className="font-medium text-foreground underline underline-offset-2">
                  menu Overhead
                </Link>
                .
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="marginPercent">Target Margin</Label>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {formatPercent(marginPercent, 0)}
                </span>
              </div>
              <input
                id="marginPercent"
                type="range"
                min={0}
                max={80}
                step={1}
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-300 accent-stone-900"
              />
              <p className="text-xs text-secondary">
                Menentukan harga jual yang disarankan dan profit per unit di sebelah kanan.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Kalkulasi
              </Button>
              <Button type="button" className="flex-1" onClick={handleCreateProduct} disabled={isCreatingProduct}>
                {isCreatingProduct ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackagePlus className="h-4 w-4" />
                )}
                Jadikan Produk
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="lg:col-span-2"
      >
        <HppResultPanel result={result} />
      </motion.div>
    </div>
  );
}
