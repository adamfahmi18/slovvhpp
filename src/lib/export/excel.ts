"use client";

import * as XLSX from "xlsx";
import { formatDate } from "@/lib/utils";

export interface ExportRow {
  [key: string]: string | number;
}

export function exportToExcel(rows: ExportRow[], fileName: string, sheetName = "Laporan") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 14),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${fileName}-${formatDate(new Date()).replace(/\s/g, "-")}.xlsx`);
}
