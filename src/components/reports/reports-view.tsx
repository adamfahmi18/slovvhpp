"use client";

import { useRouter, usePathname } from "next/navigation";
import { FileSpreadsheet, FileText, ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { exportToExcel } from "@/lib/export/excel";
import { exportToPdf } from "@/lib/export/pdf";
import type { PeriodType, Report } from "@/types";

const PERIOD_LABELS: Record<PeriodType, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export function ReportsView({ period, rows }: { period: PeriodType; rows: Report[] }) {
  const router = useRouter();
  const pathname = usePathname();

  function handlePeriodChange(value: string) {
    router.push(`${pathname}?period=${value}`);
  }

  function handleExportExcel() {
    exportToExcel(
      rows.map((row) => ({
        Periode: `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`,
        Pendapatan: row.total_revenue,
        Biaya: row.total_cost,
        Profit: row.total_profit,
        "Margin Rata-rata (%)": Number(row.average_margin.toFixed(1)),
      })),
      `laporan-${period}`,
      PERIOD_LABELS[period]
    );
  }

  function handleExportPdf() {
    exportToPdf({
      title: `Laporan ${PERIOD_LABELS[period]} — Slovv HPP`,
      subtitle: `Total ${rows.length} periode`,
      columns: ["Periode", "Pendapatan", "Biaya", "Profit", "Margin"],
      rows: rows.map((row) => [
        `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`,
        formatCurrency(row.total_revenue),
        formatCurrency(row.total_cost),
        formatCurrency(row.total_profit),
        formatPercent(row.average_margin),
      ]),
      fileName: `laporan-${period}`,
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={rows.length === 0}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={rows.length === 0}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada data laporan"
            description="Data akan muncul di sini setelah aktivitas produksi dan penjualan tercatat."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Pendapatan</TableHead>
                <TableHead>Biaya</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">
                    {formatDate(row.period_start)} – {formatDate(row.period_end)}
                  </TableCell>
                  <TableCell>{formatCurrency(row.total_revenue)}</TableCell>
                  <TableCell>{formatCurrency(row.total_cost)}</TableCell>
                  <TableCell className="text-success">{formatCurrency(row.total_profit)}</TableCell>
                  <TableCell>{formatPercent(row.average_margin)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
