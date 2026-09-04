import { z } from "zod";

export const overheadCostSchema = z.object({
  name: z.string().min(2, "Nama biaya minimal 2 karakter").max(120),
  amount: z.coerce.number().min(0, "Tidak boleh negatif"),
});

export type OverheadCostInput = z.infer<typeof overheadCostSchema>;

export const overheadSettingsSchema = z.object({
  estimatedMonthlyProduction: z.coerce
    .number()
    .min(1, "Estimasi produksi minimal 1 unit/bulan"),
});

export type OverheadSettingsInput = z.infer<typeof overheadSettingsSchema>;
