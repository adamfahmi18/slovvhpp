/**
 * Core HPP (Harga Pokok Produksi) calculation logic.
 * Shared by the calculator page (live preview) and server actions (persisted
 * calculations), so the numbers are always computed the same way.
 */

export interface HppInput {
  rawMaterialCost: number;
  packagingCost: number;
  laborCost: number;
  utilityCost: number;
  operationalCost: number;
  additionalCost: number;
  quantityProduced: number;
  marginPercent: number;
}

export interface HppResult {
  totalCost: number;
  costPerItem: number;
  sellingPrice: number;
  profitPerItem: number;
  marginPercent: number;
  costBreakdown: { label: string; value: number; percent: number }[];
}

export function calculateHpp(input: HppInput): HppResult {
  const quantity = Math.max(1, Math.floor(input.quantityProduced || 1));
  const margin = Math.max(0, input.marginPercent ?? 0);

  const costs = {
    "Bahan Baku": Math.max(0, input.rawMaterialCost || 0),
    Kemasan: Math.max(0, input.packagingCost || 0),
    "Tenaga Kerja": Math.max(0, input.laborCost || 0),
    Utilitas: Math.max(0, input.utilityCost || 0),
    Operasional: Math.max(0, input.operationalCost || 0),
    Tambahan: Math.max(0, input.additionalCost || 0),
  };

  const totalCost = Object.values(costs).reduce((sum, value) => sum + value, 0);
  const costPerItem = totalCost / quantity;

  // Selling price suggestion: cost per item marked up so that `margin`% of
  // the selling price is profit (margin-on-price, not markup-on-cost).
  // sellingPrice - costPerItem = sellingPrice * (margin / 100)
  // sellingPrice * (1 - margin/100) = costPerItem
  const marginFraction = Math.min(0.95, margin / 100);
  const sellingPrice = marginFraction >= 1 ? costPerItem : costPerItem / (1 - marginFraction);
  const profitPerItem = sellingPrice - costPerItem;

  const costBreakdown = Object.entries(costs).map(([label, value]) => ({
    label,
    value,
    percent: totalCost > 0 ? (value / totalCost) * 100 : 0,
  }));

  return {
    totalCost,
    costPerItem,
    sellingPrice,
    profitPerItem,
    marginPercent: margin,
    costBreakdown,
  };
}

export function marginFromPrice(costPerItem: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - costPerItem) / sellingPrice) * 100;
}
