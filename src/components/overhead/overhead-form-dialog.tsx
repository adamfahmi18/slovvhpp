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
import { overheadCostSchema, type OverheadCostInput } from "@/lib/validations/overhead";
import { createOverheadCost, updateOverheadCost } from "@/actions/overhead";
import type { OverheadCost } from "@/types";

interface OverheadFormDialogProps {
  mode: "create" | "edit";
  item?: OverheadCost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildDefaultValues(item: OverheadCost | undefined): OverheadCostInput {
  if (!item) return { name: "", amount: 0 };
  return { name: item.name, amount: item.amount };
}

export function OverheadFormDialog({ mode, item, open, onOpenChange }: OverheadFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OverheadCostInput>({
    resolver: zodResolver(overheadCostSchema),
    defaultValues: buildDefaultValues(item),
  });

  useEffect(() => {
    if (open) reset(buildDefaultValues(item));
  }, [open, item, reset]);

  function onSubmit(data: OverheadCostInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.set(key, String(value ?? "")));

    startTransition(async () => {
      const result =
        mode === "create" ? await createOverheadCost(null, formData) : await updateOverheadCost(item!.id, null, formData);

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
          <DialogTitle>{mode === "create" ? "Tambah Biaya Overhead" : "Edit Biaya Overhead"}</DialogTitle>
          <DialogDescription>
            Biaya tetap bulanan (sewa, gaji, listrik, dll). Totalnya dibagi otomatis ke setiap unit produksi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Biaya</Label>
            <Input id="name" placeholder="Sewa Tempat" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Jumlah / Bulan</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                Rp
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={0}
                className="pl-9"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Simpan Biaya" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
