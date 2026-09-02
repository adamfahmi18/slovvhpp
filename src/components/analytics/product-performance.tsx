import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Product } from "@/types";

type SlimProduct = Pick<Product, "id" | "name" | "units_sold" | "profit_per_item" | "margin_percent">;

export function ProductPerformance({
  topProducts,
  laggingProducts,
}: {
  topProducts: SlimProduct[];
  laggingProducts: SlimProduct[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PerformanceCard
        title="Produk Terlaris"
        description="Berdasarkan unit terjual"
        icon={TrendingUp}
        iconClass="text-success"
        products={topProducts}
      />
      <PerformanceCard
        title="Margin Terendah"
        description="Perlu ditinjau ulang harga atau biaya"
        icon={TrendingDown}
        iconClass="text-warning"
        products={laggingProducts}
      />
    </div>
  );
}

function PerformanceCard({
  title,
  description,
  icon: Icon,
  iconClass,
  products,
}: {
  title: string;
  description: string;
  icon: typeof TrendingUp;
  iconClass: string;
  products: SlimProduct[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada data produk yang cukup.</p>
        ) : (
          <ul className="space-y-3">
            {products.map((product, index) => (
              <li key={product.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-secondary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-stone-400">{formatNumber(product.units_sold)} unit terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(product.profit_per_item)}</p>
                  <p className="text-xs text-stone-400">{formatPercent(product.margin_percent)} margin</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
