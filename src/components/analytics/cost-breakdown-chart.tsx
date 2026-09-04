"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

const COLORS = ["#0C0A09", "#57534E", "#78716C", "#A8A29E", "#D6D3D1", "#8B7355"];

interface CostBreakdownChartProps {
  data: { label: string; value: number }[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-popover">
      <p className="text-xs font-medium text-foreground">{item.name}</p>
      <p className="text-xs text-secondary">{formatCurrency(item.value)}</p>
    </div>
  );
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Komposisi Biaya</CardTitle>
        <CardDescription>Distribusi biaya produksi 90 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full flex-1 space-y-2">
            {data.map((item, index) => (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-secondary">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {item.label}
                </span>
                <span className="font-medium text-foreground">
                  {formatPercent(total > 0 ? (item.value / total) * 100 : 0, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
