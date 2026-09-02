"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, LogOut } from "lucide-react";
import { MOBILE_PRIMARY_ITEMS, MOBILE_MORE_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MOBILE_MORE_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85 lg:hidden">
        <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_PRIMARY_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-stone-400"
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-stone-400")} strokeWidth={active ? 2.4 : 2} />
                <span className={cn(active ? "text-primary" : "text-stone-400")}>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
          >
            <MoreHorizontal className={cn("h-5 w-5", moreActive ? "text-primary" : "text-stone-400")} />
            <span className={cn(moreActive ? "text-primary" : "text-stone-400")}>Lainnya</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Menu lainnya</SheetTitle>
          </SheetHeader>
          <div className="mt-3 space-y-1">
            {MOBILE_MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex h-12 items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Icon className="h-[18px] w-[18px] text-secondary" />
                  {item.label}
                </Link>
              );
            })}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive-soft"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Keluar
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
