"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { BottomNav } from "./bottom-nav";
import { PageTransition } from "./page-transition";

interface DashboardShellProps {
  children: ReactNode;
  fullName: string;
  username: string;
}

export function DashboardShell({ children, fullName, username }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} fullName={fullName} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav fullName={fullName} username={username} />
        <main className="flex-1 px-4 pb-24 pt-5 lg:px-6 lg:pb-8 lg:pt-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
