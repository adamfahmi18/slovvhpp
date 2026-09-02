"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/utils";

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
}

export function exportToPdf({ title, subtitle, columns, rows, fileName }: PdfExportOptions) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.setTextColor(12, 10, 9);
  doc.text(title, 14, 18);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(87, 83, 78);
    doc.text(subtitle, 14, 25);
  }

  autoTable(doc, {
    startY: subtitle ? 32 : 26,
    head: [columns],
    body: rows,
    theme: "plain",
    headStyles: {
      fillColor: [12, 10, 9],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [231, 229, 228],
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 249],
    },
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text(`Dibuat pada ${formatDate(new Date())} — Slovv HPP`, 14, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${fileName}-${formatDate(new Date()).replace(/\s/g, "-")}.pdf`);
}
