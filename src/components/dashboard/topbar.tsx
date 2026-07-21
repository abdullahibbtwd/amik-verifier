"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { user, initials, isLoading, logout } = useAuth();

  async function handleSignOut() {
    await logout();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 max-w-[85vw] border-none bg-sidebar p-0 shadow-2xl transition duration-300 ease-in-out data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full"
        >
          <DashboardSidebar
            forceExpanded
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <div className="hidden md:block" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-muted">
              <Avatar>
                <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                  {isLoading ? "…" : initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                {isLoading ? (
                  <>
                    <Skeleton className="mb-1 h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {user?.name ?? "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </>
                )}
              </div>
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings/security">Security</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
