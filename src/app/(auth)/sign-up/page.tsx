"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { api } from "../../../../convex/_generated/api";
import { AuthField, AuthShell } from "@/components/auth";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  signupSchema,
  type SignupInput,
} from "@/lib/validations/auth";

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();
  const signup = useMutation(api.auth.signup.signup);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupInput) {
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const result = await signup(payload);
      toast.message({
        title: "Account created",
        description: "Check your email for a 6-digit verification code.",
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(result.email)}`
      );
    } catch (error) {
      toast.message({
        title: "Sign up failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create your account.",
      });
    }
  }

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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="name"
            label="Full name"
            icon={User}
            placeholder="Adaeze Okonkwo"
            autoComplete="name"
            error={errors.name?.message}
            disabled={isSubmitting}
            {...register("name")}
          />

          <AuthField
            id="phone"
            label="Phone number"
            icon={Phone}
            placeholder="08012345678"
            autoComplete="tel"
            error={errors.phone?.message}
            disabled={isSubmitting}
            {...register("phone")}
          />

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

          <AuthField
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Create a strong password"
            autoComplete="new-password"
            passwordToggle
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register("password")}
          />

          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            icon={Lock}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            passwordToggle
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree that identity data will be handled
            securely and in compliance with applicable privacy regulations.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
            <ArrowRight className="size-4" />
          </Button>
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
