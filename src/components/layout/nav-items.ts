import {
  LayoutDashboard,
  Calculator,
  Package,
  Wheat,
  Receipt,
  FileBarChart,
  LineChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalkulator HPP", href: "/calculator", icon: Calculator },
  { label: "Produk", href: "/products", icon: Package },
  { label: "Bahan Baku", href: "/bahan-baku", icon: Wheat },
  { label: "Overhead", href: "/overhead", icon: Receipt },
  { label: "Laporan", href: "/reports", icon: FileBarChart },
  { label: "Analitik", href: "/analytics", icon: LineChart },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

// Primary items shown in the mobile bottom tab bar (kept short for
// thumb reach); the rest live behind "Lainnya".
export const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Kalkulator HPP
  NAV_ITEMS[2], // Produk
  NAV_ITEMS[3], // Bahan Baku
];

export const MOBILE_MORE_ITEMS: NavItem[] = [
  NAV_ITEMS[4], // Overhead
  NAV_ITEMS[5], // Laporan
  NAV_ITEMS[6], // Analitik
  NAV_ITEMS[7], // Pengaturan
];
