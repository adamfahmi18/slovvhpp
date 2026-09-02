import Link from "next/link";
import { Calculator, PackagePlus, FileBarChart, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";

const ACTIONS = [
  {
    label: "Hitung HPP",
    description: "Kalkulasi biaya produksi baru",
    href: "/calculator",
    icon: Calculator,
  },
  {
    label: "Tambah Produk",
    description: "Simpan produk baru ke katalog",
    href: "/products",
    icon: PackagePlus,
  },
  {
    label: "Lihat Laporan",
    description: "Ringkasan performa periode",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    label: "Buka Analitik",
    description: "Tren dan performa produk",
    href: "/analytics",
    icon: LineChart,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="group h-full p-4 transition-colors hover:border-primary/30 hover:bg-muted/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="mt-0.5 text-xs text-secondary">{action.description}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
