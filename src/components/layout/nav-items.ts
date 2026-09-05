import {
  Calculator,
  Package,
  Wheat,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Dashboard, Laporan, dan Analitik sengaja disembunyikan dari navigasi —
// fokus aplikasi ini adalah HPP (Kalkulator, Produk, Bahan Baku, Overhead).
// Routenya masih ada di src/app/(dashboard)/{dashboard,reports,analytics}
// kalau suatu saat mau dimunculkan lagi, tinggal tambahkan ke sini.
export const NAV_ITEMS: NavItem[] = [
  { label: "Kalkulator HPP", href: "/calculator", icon: Calculator },
  { label: "Produk", href: "/products", icon: Package },
  { label: "Bahan Baku", href: "/bahan-baku", icon: Wheat },
  { label: "Overhead", href: "/overhead", icon: Receipt },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

// Primary items shown in the mobile bottom tab bar (kept short for
// thumb reach); the rest live behind "Lainnya".
export const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  NAV_ITEMS[0], // Kalkulator HPP
  NAV_ITEMS[1], // Produk
  NAV_ITEMS[2], // Bahan Baku
  NAV_ITEMS[3], // Overhead
];

export const MOBILE_MORE_ITEMS: NavItem[] = [
  NAV_ITEMS[4], // Pengaturan
];
