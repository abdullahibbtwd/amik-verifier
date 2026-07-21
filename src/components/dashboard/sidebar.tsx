"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/auth/auth-context";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/lookup", label: "Lookup", icon: FileSearch },
  { href: "/history", label: "History", icon: History },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

type DashboardSidebarProps = {
  onNavigate?: () => void;
  showToggle?: boolean;
  forceExpanded?: boolean;
};

export function DashboardSidebar({
  onNavigate,
  showToggle = false,
  forceExpanded = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();
  const isCollapsed = forceExpanded ? false : collapsed;

  async function handleSignOut() {
    await logout();
    onNavigate?.();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "relative flex h-dvh shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[4.75rem]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border transition-[padding] duration-300 ease-in-out",
          isCollapsed ? "justify-center gap-1 px-2" : "justify-between px-4 lg:px-5"
        )}
      >
        <Logo
          href="/dashboard"
          variant="light"
          className={cn(
            "shrink-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "size-9" : "size-11 lg:size-16"
          )}
        />
        {showToggle ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm transition-all duration-300 ease-in-out",
                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "truncate whitespace-nowrap transition-all duration-300 ease-in-out",
                  isCollapsed
                    ? "pointer-events-none w-0 opacity-0"
                    : "w-auto opacity-100"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          title={isCollapsed ? "Sign out" : undefined}
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center rounded-lg py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-300 ease-in-out hover:bg-white/5 hover:text-sidebar-foreground",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          <span
            className={cn(
              "truncate whitespace-nowrap transition-all duration-300 ease-in-out",
              isCollapsed
                ? "pointer-events-none w-0 opacity-0"
                : "w-auto opacity-100"
            )}
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
