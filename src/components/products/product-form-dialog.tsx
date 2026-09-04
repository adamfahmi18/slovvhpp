"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { calculateHpp } from "@/lib/calculations/hpp";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { createProduct, updateProduct } from "@/actions/products";
import { getProductRecipe } from "@/actions/raw-materials";
import type { Product, RawMaterial } from "@/types";

interface ProductFormDialogProps {
  mode: "create" | "edit";
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMarginPercent: number;
  rawMaterials: RawMaterial[];
  overheadPerUnit: number;
}

const COST_FIELDS: { name: keyof ProductInput; label: string }[] = [
  { name: "packagingCost", label: "Kemasan" },
  { name: "laborCost", label: "Tenaga Kerja" },
  { name: "utilityCost", label: "Utilitas" },
  { name: "operationalCost", label: "Operasional" },
  { name: "additionalCost", label: "Tambahan" },
];

interface RecipeRow {
  key: string;
  rawMaterialId: string;
  quantity: number;
}

let rowKeySeq = 0;
function nextRowKey() {
  rowKeySeq += 1;
  return `row-${rowKeySeq}`;
}

function buildDefaultValues(product: Product | undefined, defaultMarginPercent: number): ProductInput {
  if (!product) {
    return {
      name: "",
      category: "Umum",
      sku: "",
      rawMaterialCost: 0,
      packagingCost: 0,
      laborCost: 0,
      utilityCost: 0,
      operationalCost: 0,
      additionalCost: 0,
      quantityProduced: 1,
      marginPercent: defaultMarginPercent,
      status: "active",
    };
  }
  return {
    name: product.name,
    category: product.category,
    sku: product.sku ?? "",
    rawMaterialCost: product.raw_material_cost,
    packagingCost: product.packaging_cost,
    laborCost: product.labor_cost,
    utilityCost: product.utility_cost,
    operationalCost: product.operational_cost,
    additionalCost: product.additional_cost,
    quantityProduced: product.quantity_produced,
    marginPercent: product.margin_percent,
    status: product.status,
  };
}

export function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
  defaultMarginPercent,
  rawMaterials,
  overheadPerUnit,
}: ProductFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [recipeRows, setRecipeRows] = useState<RecipeRow[]>([]);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: buildDefaultValues(product, defaultMarginPercent),
  });

  useEffect(() => {
    if (!open) return;
    reset(buildDefaultValues(product, defaultMarginPercent));

    if (mode === "edit" && product) {
      setLoadingRecipe(true);
      getProductRecipe(product.id)
        .then((items) => {
          setRecipeRows(
            items.map((item) => ({ key: nextRowKey(), rawMaterialId: item.raw_material_id, quantity: item.quantity }))
          );
        })
        .finally(() => setLoadingRecipe(false));
    } else {
      setRecipeRows([]);
    }
  }, [open, product, mode, defaultMarginPercent, reset]);

  const materialById = useMemo(() => new Map(rawMaterials.map((m) => [m.id, m])), [rawMaterials]);

  const recipeCost = useMemo(
    () =>
      recipeRows.reduce((sum, row) => {
        const material = materialById.get(row.rawMaterialId);
        return sum + (material ? row.quantity * material.price_per_unit : 0);
      }, 0),
    [recipeRows, materialById]
  );

  useEffect(() => {
    setValue("rawMaterialCost", recipeCost);
  }, [recipeCost, setValue]);

  function addRecipeRow() {
    setRecipeRows((rows) => [...rows, { key: nextRowKey(), rawMaterialId: rawMaterials[0]?.id ?? "", quantity: 1 }]);
  }

  function updateRecipeRow(key: string, patch: Partial<RecipeRow>) {
    setRecipeRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRecipeRow(key: string) {
    setRecipeRows((rows) => rows.filter((row) => row.key !== key));
  }

  const values = watch();
  const quantityProduced = Number(values.quantityProduced) || 1;
  const overheadCost = overheadPerUnit * quantityProduced;

  const preview = useMemo(
    () =>
      calculateHpp({
        rawMaterialCost: recipeCost,
        packagingCost: Number(values.packagingCost) || 0,
        laborCost: Number(values.laborCost) || 0,
        utilityCost: Number(values.utilityCost) || 0,
        operationalCost: Number(values.operationalCost) || 0,
        overheadCost,
        additionalCost: Number(values.additionalCost) || 0,
        quantityProduced,
        marginPercent: Number(values.marginPercent) || 0,
      }),
    [values, recipeCost, overheadCost, quantityProduced]
  );

  function onSubmit(data: ProductInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.set(key, String(value ?? "")));
    formData.set(
      "recipeItems",
      JSON.stringify(
        recipeRows
          .filter((row) => row.rawMaterialId && row.quantity > 0)
          .map((row) => ({ rawMaterialId: row.rawMaterialId, quantity: row.quantity }))
      )
    );

    startTransition(async () => {
      const result =
        mode === "create" ? await createProduct(null, formData) : await updateProduct(product!.id, null, formData);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Produk" : "Edit Produk"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi rincian biaya untuk menghitung HPP produk baru."
              : "Perbarui rincian biaya produk. HPP akan dihitung ulang otomatis."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" placeholder="Umum" {...register("category")} />
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU (opsional)</Label>
              <Input id="sku" {...register("sku")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={(v) => setValue("status", v as ProductInput["status"])}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="archived">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Resep (Bahan Baku)</Label>
              <span className="text-xs text-secondary">
                Biaya bahan: <span className="font-medium text-foreground">{formatCurrency(recipeCost)}</span>
              </span>
            </div>

            {loadingRecipe && <p className="text-xs text-secondary">Memuat resep...</p>}

            {!loadingRecipe && rawMaterials.length === 0 && (
              <p className="text-xs text-secondary">
                Belum ada bahan baku. Tambahkan dulu di halaman{" "}
                <span className="font-medium text-foreground">Bahan Baku</span>.
              </p>
            )}

            {!loadingRecipe && rawMaterials.length > 0 && (
              <div className="space-y-2">
                {recipeRows.map((row) => {
                  const material = materialById.get(row.rawMaterialId);
                  const subtotal = material ? row.quantity * material.price_per_unit : 0;
                  return (
                    <div key={row.key} className="flex items-center gap-2">
                      <Select
                        value={row.rawMaterialId}
                        onValueChange={(v) => updateRecipeRow(row.key, { rawMaterialId: v })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Pilih bahan" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        className="w-20 shrink-0"
                        value={row.quantity}
                        onChange={(e) => updateRecipeRow(row.key, { quantity: Number(e.target.value) || 0 })}
                      />
                      <span className="w-24 shrink-0 text-right text-xs text-secondary">
                        {formatCurrency(subtotal)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeRecipeRow(row.key)}
                        aria-label="Hapus bahan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                <Button type="button" variant="outline" size="sm" onClick={addRecipeRow}>
                  <Plus className="h-4 w-4" /> Tambah Bahan
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Alokasi Overhead (otomatis)</Label>
              <span className="text-sm font-medium text-foreground">{formatCurrency(overheadCost)}</span>
            </div>
            <p className="text-xs text-secondary">
              {formatCurrency(overheadPerUnit)}/unit × {quantityProduced} unit dari total biaya overhead bulanan ÷
              estimasi produksi. Atur di{" "}
              <Link href="/overhead" className="font-medium text-foreground underline underline-offset-2">
                menu Overhead
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {COST_FIELDS.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  {...register(field.name, { valueAsNumber: true })}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantityProduced">Jumlah Produksi</Label>
              <Input
                id="quantityProduced"
                type="number"
                min={1}
                {...register("quantityProduced", { valueAsNumber: true })}
              />
              {errors.quantityProduced && (
                <p className="text-xs text-destructive">{errors.quantityProduced.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="marginPercent">Target Margin (%)</Label>
              <Input
                id="marginPercent"
                type="number"
                min={0}
                max={95}
                {...register("marginPercent", { valueAsNumber: true })}
              />
              {errors.marginPercent && <p className="text-xs text-destructive">{errors.marginPercent.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div>
              <p className="text-xs text-secondary">Biaya/unit</p>
              <p className="font-medium text-foreground">{formatCurrency(preview.costPerItem)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Harga jual</p>
              <p className="font-medium text-foreground">{formatCurrency(preview.sellingPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Margin</p>
              <p className="font-medium text-foreground">{formatPercent(preview.marginPercent)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Simpan Produk" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
