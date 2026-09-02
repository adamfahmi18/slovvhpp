"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, TrendingUp, DollarSign, Package, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateBusinessAnalysis } from "@/actions/ai";
import type { AiAnalysisResult } from "@/lib/ai/analyze";

export function AiInsightsPanel() {
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasRun, setHasRun] = useState(false);

  function handleGenerate() {
    setHasRun(true);
    startTransition(async () => {
      const analysis = await generateBusinessAnalysis();
      setResult(analysis);
    });
  }

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-surface to-muted/30">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Analisis AI</CardTitle>
            <CardDescription>Rekomendasi bisnis berbasis data performa Anda</CardDescription>
          </div>
        </div>
        <Button size="sm" variant={result ? "outline" : "default"} onClick={handleGenerate} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : result ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {result ? "Perbarui" : "Buat Analisis"}
        </Button>
      </CardHeader>

      <CardContent>
        {!hasRun && (
          <p className="text-sm text-secondary">
            Dapatkan ringkasan performa, saran efisiensi biaya, optimasi profit, dan rekomendasi harga — disusun
            layaknya konsultan bisnis, dari data 30 hari terakhir.
          </p>
        )}

        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        <AnimatePresence>
          {!isPending && result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <InsightBlock icon={DollarSign} title="Efisiensi Biaya" items={result.costEfficiency} />
                <InsightBlock icon={TrendingUp} title="Optimasi Profit" items={result.profitOptimization} />
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-secondary" />
                  <p className="text-sm font-medium text-foreground">Performa Produk</p>
                </div>
                <p className="text-sm leading-relaxed text-secondary">{result.productPerformance}</p>
              </div>

              <InsightBlock icon={Tag} title="Rekomendasi Harga" items={result.pricingRecommendations} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function InsightBlock({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof DollarSign;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-secondary" />
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm leading-relaxed text-secondary">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
