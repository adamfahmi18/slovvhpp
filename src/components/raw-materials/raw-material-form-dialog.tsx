"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { rawMaterialSchema, COMMON_UNITS, type RawMaterialInput } from "@/lib/validations/raw-material";
import { createRawMaterial, updateRawMaterial } from "@/actions/raw-materials";
import type { RawMaterial } from "@/types";

interface RawMaterialFormDialogProps {
  mode: "create" | "edit";
  material?: RawMaterial;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildDefaultValues(material: RawMaterial | undefined): RawMaterialInput {
  if (!material) {
    return { name: "", unit: "pcs", pricePerUnit: 0, stockQuantity: 0 };
  }
  return {
    name: material.name,
    unit: material.unit,
    pricePerUnit: material.price_per_unit,
    stockQuantity: material.stock_quantity,
  };
}

export function RawMaterialFormDialog({ mode, material, open, onOpenChange }: RawMaterialFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RawMaterialInput>({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: buildDefaultValues(material),
  });

  useEffect(() => {
    if (open) reset(buildDefaultValues(material));
  }, [open, material, reset]);

  const values = watch();

  function onSubmit(data: RawMaterialInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.set(key, String(value ?? "")));

    startTransition(async () => {
      const result =
        mode === "create" ? await createRawMaterial(null, formData) : await updateRawMaterial(material!.id, null, formData);

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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Bahan Baku" : "Edit Bahan Baku"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Bahan ini bisa dipakai di resep produk untuk menghitung HPP secara otomatis."
              : "Perubahan harga akan otomatis memperbarui HPP produk yang memakai bahan ini."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Bahan</Label>
            <Input id="name" placeholder="Tepung Terigu" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="unit">Satuan</Label>
              <Select value={values.unit} onValueChange={(v) => setValue("unit", v)}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pricePerUnit">Harga / Satuan</Label>
              <Input
                id="pricePerUnit"
                type="number"
                inputMode="decimal"
                min={0}
                {...register("pricePerUnit", { valueAsNumber: true })}
              />
              {errors.pricePerUnit && <p className="text-xs text-destructive">{errors.pricePerUnit.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stockQuantity">Stok Saat Ini (opsional)</Label>
            <Input
              id="stockQuantity"
              type="number"
              inputMode="decimal"
              min={0}
              {...register("stockQuantity", { valueAsNumber: true })}
            />
            {errors.stockQuantity && <p className="text-xs text-destructive">{errors.stockQuantity.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Simpan Bahan" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
