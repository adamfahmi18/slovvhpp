"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TrendChartProps {
  data: { date: string; revenue: number; profit: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-popover">
      <p className="mb-1 text-xs font-medium text-secondary">{formatDate(label)}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} className="text-xs font-medium text-foreground">
          <span className="capitalize text-secondary">{item.name}:</span> {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pendapatan &amp; Profit</CardTitle>
        <CardDescription>90 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E7E5E4" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#57534E", fontSize: 11 }}
                tickFormatter={(v) => formatDate(v, { day: "numeric", month: "short" })}
                minTickGap={32}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#57534E", fontSize: 11 }}
                tickFormatter={(v) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-secondary">{value}</span>}
              />
              <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#0C0A09" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
