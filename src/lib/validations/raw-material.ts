import { z } from "zod";

export const rawMaterialSchema = z.object({
  name: z.string().min(2, "Nama bahan minimal 2 karakter").max(120),
  unit: z.string().min(1, "Satuan wajib diisi").max(20),
  pricePerUnit: z.coerce.number().min(0, "Tidak boleh negatif"),
  stockQuantity: z.coerce.number().min(0, "Tidak boleh negatif"),
});

export type RawMaterialInput = z.infer<typeof rawMaterialSchema>;

export const recipeItemSchema = z.object({
  rawMaterialId: z.string().uuid(),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
});

export const recipeItemsSchema = z.array(recipeItemSchema).default([]);

export type RecipeItemInput = z.infer<typeof recipeItemSchema>;

export const COMMON_UNITS = ["gram", "kg", "ml", "liter", "pcs", "lembar", "butir", "sdm", "sdt"] as const;
