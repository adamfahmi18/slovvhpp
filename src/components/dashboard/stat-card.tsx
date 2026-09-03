"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  format: "currency" | "percent";
  changePercent: number;
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ label, value, format, changePercent, icon: Icon, index = 0 }: StatCardProps) {
  const isPositive = changePercent >= 0;
  const formatter = format === "percent" ? (v: number) => formatPercent(v) : formatCurrency;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-xs font-medium text-secondary">{label}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <AnimatedCounter
            value={value}
            formatter={formatter}
            className="font-heading text-2xl font-semibold tracking-tight text-foreground"
          />
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(changePercent).toFixed(1)}%
            <span className="font-normal text-stone-400">vs bulan lalu</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
