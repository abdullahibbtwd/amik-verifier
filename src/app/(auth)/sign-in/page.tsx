"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { AuthField, AuthShell } from "@/components/auth";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  return (
    <AuthShell
      title="Secure access to your verification dashboard"
      subtitle="Sign in to run NIN and BVN lookups, manage your wallet, and download slips — all from one platform."
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Enter your credentials to continue.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <AuthField
            id="email"
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            defaultValue="adaeze@example.com"
            autoComplete="email"
          />

          <div className="space-y-2">
            <AuthField
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              defaultValue="password123"
              autoComplete="current-password"
              passwordToggle
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-secondary transition-colors hover:text-secondary/80"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <ButtonLink href="/dashboard" className="h-11 w-full text-sm">
            Sign in
            <ArrowRight className="size-4" />
          </ButtonLink>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          <span>Your session is encrypted and secure.</span>
        </div>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-secondary transition-colors hover:text-secondary/80"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
