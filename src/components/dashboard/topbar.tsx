"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
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
import { mockUser } from "@/lib/mock-data";

export function DashboardTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <button className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-muted">
              <Avatar>
                <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                  {mockUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground">{mockUser.email}</p>
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
          <DropdownMenuItem>
            <Link href="/sign-in">Sign out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
