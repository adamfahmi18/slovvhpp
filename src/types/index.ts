export interface Product {
  id: string;
  user_id: string | null;
  name: string;
  category: string;
  sku: string | null;
  raw_material_cost: number;
  packaging_cost: number;
  labor_cost: number;
  utility_cost: number;
  operational_cost: number;
  overhead_cost: number;
  additional_cost: number;
  quantity_produced: number;
  total_cost: number;
  cost_per_item: number;
  margin_percent: number;
  selling_price: number;
  profit_per_item: number;
  units_sold: number;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Calculation {
  id: string;
  user_id: string | null;
  product_id: string | null;
  product_name: string;
  raw_material_cost: number;
  packaging_cost: number;
  labor_cost: number;
  utility_cost: number;
  operational_cost: number;
  overhead_cost: number;
  additional_cost: number;
  quantity_produced: number;
  margin_percent: number;
  total_cost: number;
  cost_per_item: number;
  selling_price: number;
  profit_per_item: number;
  created_at: string;
}

export interface RawMaterial {
  id: string;
  user_id: string | null;
  name: string;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity: number;
}

export interface RecipeItemWithMaterial extends RecipeItem {
  raw_material: Pick<RawMaterial, "id" | "name" | "unit" | "price_per_unit">;
}

export interface OverheadCost {
  id: string;
  user_id: string | null;
  name: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

/** Total monthly overhead divided by estimated monthly production. */
export interface OverheadSummary {
  items: OverheadCost[];
  totalMonthlyOverhead: number;
  estimatedMonthlyProduction: number;
  overheadPerUnit: number;
}

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export interface Report {
  id: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  average_margin: number;
  units_sold: number;
  product_count: number;
  created_at: string;
}

export interface AnalyticsDay {
  id: string;
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  raw_material_cost: number;
  packaging_cost: number;
  labor_cost: number;
  utility_cost: number;
  operational_cost: number;
  overhead_cost: number;
  top_product_id: string | null;
  created_at: string;
}

export interface DashboardSummary {
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  revenueChangePercent: number;
  costChangePercent: number;
  profitChangePercent: number;
  marginChangePercent: number;
  monthlyOverview: { month: string; revenue: number; cost: number; profit: number }[];
}

export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
