"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden">
        <div className="relative hidden shrink-0 md:block">
          <DashboardSidebar showToggle />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopbar />
          <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 [scrollbar-gutter:stable]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
