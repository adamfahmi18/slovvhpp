"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteOverheadCost } from "@/actions/overhead";

interface DeleteOverheadDialogProps {
  itemId: string;
  itemName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteOverheadDialog({ itemId, itemName, open, onOpenChange }: DeleteOverheadDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOverheadCost(itemId);
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
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive-soft">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Hapus biaya overhead ini?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{itemName}</span> akan dihapus permanen dan tidak lagi
            dihitung dalam alokasi overhead per unit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus Biaya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
