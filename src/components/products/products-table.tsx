"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, PackageSearch } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductFormDialog } from "./product-form-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductsTableProps {
  products: Product[];
  defaultMarginPercent: number;
}

export function ProductsTable({ products, defaultMarginPercent }: ProductsTableProps) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Belum ada produk"
        description="Tambahkan produk pertama Anda untuk mulai melacak HPP dan profitabilitas."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Biaya/unit</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <TableCell>
                <p className="font-medium text-foreground">{product.name}</p>
                {product.sku && <p className="text-xs text-stone-400">{product.sku}</p>}
              </TableCell>
              <TableCell className="text-secondary">{product.category}</TableCell>
              <TableCell className="text-secondary">{formatCurrency(product.cost_per_item)}</TableCell>
              <TableCell className="font-medium text-foreground">{formatCurrency(product.selling_price)}</TableCell>
              <TableCell className="text-secondary">{formatPercent(product.margin_percent)}</TableCell>
              <TableCell>
                <Badge variant={product.status === "active" ? "success" : "outline"}>
                  {product.status === "active" ? "Aktif" : "Diarsipkan"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Menu aksi untuk ${product.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(product)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleting(product)} className="text-destructive">
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
        <ProductFormDialog
          mode="edit"
          product={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          defaultMarginPercent={defaultMarginPercent}
        />
      )}

      {deleting && (
        <DeleteProductDialog
          productId={deleting.id}
          productName={deleting.name}
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
        />
      )}
    </>
  );
}
