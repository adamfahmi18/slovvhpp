"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Wheat } from "lucide-react";
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
import { RawMaterialFormDialog } from "./raw-material-form-dialog";
import { DeleteRawMaterialDialog } from "./delete-raw-material-dialog";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { RawMaterial } from "@/types";

interface RawMaterialsTableProps {
  materials: RawMaterial[];
}

export function RawMaterialsTable({ materials }: RawMaterialsTableProps) {
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [deleting, setDeleting] = useState<RawMaterial | null>(null);

  if (materials.length === 0) {
    return (
      <EmptyState
        icon={Wheat}
        title="Belum ada bahan baku"
        description="Tambahkan bahan baku pertama Anda agar bisa dipakai di resep produk dan menghitung HPP secara otomatis."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bahan</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Harga / Satuan</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material, index) => (
            <motion.tr
              key={material.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <TableCell>
                <p className="font-medium text-foreground">{material.name}</p>
              </TableCell>
              <TableCell className="text-secondary">{material.unit}</TableCell>
              <TableCell className="font-medium text-foreground">{formatCurrency(material.price_per_unit)}</TableCell>
              <TableCell className="text-secondary">
                {formatNumber(material.stock_quantity)} {material.unit}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Menu aksi untuk ${material.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(material)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleting(material)} className="text-destructive">
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <RawMaterialFormDialog
          mode="edit"
          material={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteRawMaterialDialog
          materialId={deleting.id}
          materialName={deleting.name}
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
        />
      )}
    </>
  );
}
