"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketingNav() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo priority variant="light" className="size-11 lg:size-16" />
        <nav className="hidden items-center gap-6 text-sm text-primary-foreground/80 md:flex">
          <Link href="/pricing" className="transition-colors hover:text-primary-foreground">
            Pricing
          </Link>
          {!isLoading && !isAuthenticated ? (
            <Link href="/sign-in" className="transition-colors hover:text-primary-foreground">
              Sign in
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-28 bg-white/15" />
          ) : isAuthenticated ? (
            <ButtonLink
              href="/dashboard"
              size="sm"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink
                href="/sign-in"
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                Sign in
              </ButtonLink>
              <ButtonLink
                href="/sign-up"
                size="sm"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Create account
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
