import { z } from "zod";

export const calculationSchema = z.object({
  productName: z.string().min(2, "Nama produk minimal 2 karakter").max(120),
  rawMaterialCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  packagingCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  laborCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  utilityCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  operationalCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  additionalCost: z.coerce.number().min(0, "Tidak boleh negatif"),
  quantityProduced: z.coerce.number().int().min(1, "Minimal 1"),
  marginPercent: z.coerce.number().min(0).max(95, "Maksimal 95%"),
});

export type CalculationInput = z.infer<typeof calculationSchema>;
