"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { logoutAction } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";

function usePageTitle() {
  const pathname = usePathname();
  const match = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Dashboard";
}

interface TopNavProps {
  fullName: string;
  username: string;
}

export function TopNav({ fullName, username }: TopNavProps) {
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-gradient-to-r from-amber-50/70 via-surface to-surface px-4 backdrop-blur supports-[backdrop-filter]:from-amber-50/50 supports-[backdrop-filter]:bg-surface/80 lg:px-6">
      <h1 className="font-heading text-base font-semibold text-foreground lg:text-lg">{title}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Avatar className="h-8 w-8 ring-2 ring-amber-100">
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-700 text-white">
              {initials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">{fullName}</p>
            <p className="text-xs leading-tight text-secondary">@{username}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Pengaturan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
