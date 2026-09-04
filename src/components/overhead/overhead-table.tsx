"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Receipt } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { OverheadFormDialog } from "./overhead-form-dialog";
import { DeleteOverheadDialog } from "./delete-overhead-dialog";
import { formatCurrency } from "@/lib/utils";
import type { OverheadCost } from "@/types";

interface OverheadTableProps {
  items: OverheadCost[];
}

export function OverheadTable({ items }: OverheadTableProps) {
  const [editing, setEditing] = useState<OverheadCost | null>(null);
  const [deleting, setDeleting] = useState<OverheadCost | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Belum ada biaya overhead"
        description="Tambahkan biaya tetap bulanan seperti sewa, gaji, atau listrik agar dialokasikan otomatis ke setiap unit produksi."
      />
    );
  }

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Biaya</TableHead>
            <TableHead>Jumlah / Bulan</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <TableCell>
                <p className="font-medium text-foreground">{item.name}</p>
              </TableCell>
              <TableCell className="font-medium text-foreground">{formatCurrency(item.amount)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Menu aksi untuk ${item.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(item)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleting(item)} className="text-destructive">
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
          <TableRow className="bg-muted/40">
            <TableCell className="font-heading font-semibold text-foreground">Total / Bulan</TableCell>
            <TableCell className="font-heading font-semibold text-foreground">{formatCurrency(total)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      {editing && (
        <OverheadFormDialog
          mode="edit"
          item={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteOverheadDialog
          itemId={deleting.id}
          itemName={deleting.name}
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
        />
      )}
    </>
  );
}
