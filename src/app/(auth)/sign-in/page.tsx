"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { AuthField, AuthShell } from "@/components/auth";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AuthUser } from "@/lib/auth/types";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { setUser, refreshUser } = useAuth();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        error?: string;
        user?: AuthUser;
      };

      if (!response.ok) {
        if (response.status === 403) {
          toast.message({
            title: "Email not verified",
            description: data.error,
          });
          router.push(
            `/verify-email?email=${encodeURIComponent(values.email)}`
          );
          return;
        }

        throw new Error(data.error ?? "Invalid email or password.");
      }

      if (data.user) {
        setUser(data.user);
      } else {
        await refreshUser();
      }

      toast.message({
        title: "Welcome back",
        description: "You are signed in.",
      });
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      toast.message({
        title: "Sign in failed",
        description:
          error instanceof Error ? error.message : "Unable to sign in.",
      });
    }
  }

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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="email"
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register("email")}
          />

          <div className="space-y-2">
            <AuthField
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              passwordToggle
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register("password")}
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

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-sm">
            {isSubmitting ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
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

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
