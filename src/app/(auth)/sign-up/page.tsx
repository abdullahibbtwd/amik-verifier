"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { AuthField, AuthShell } from "@/components/auth";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Start verifying identities in minutes"
      subtitle="Create your account to access NIN and BVN lookups, wallet funding, and downloadable slips — built for agents and businesses."
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Register to get started with Amik Verifier & Data.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <AuthField
            id="name"
            label="Full name"
            icon={User}
            placeholder="Adaeze Okonkwo"
            autoComplete="name"
          />

          <AuthField
            id="email"
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            autoComplete="email"
          />

          <AuthField
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Create a strong password"
            autoComplete="new-password"
            passwordToggle
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree that identity data will be handled
            securely and in compliance with applicable privacy regulations.
          </p>

          <ButtonLink
            href="/dashboard"
            className="h-11 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Create account
            <ArrowRight className="size-4" />
          </ButtonLink>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          <span>We never share your personal data with third parties.</span>
        </div>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-secondary transition-colors hover:text-secondary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
