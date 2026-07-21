"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowRight, Mail } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { AuthShell } from "@/components/auth";
import { OtpInput } from "@/components/auth/otp-input";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const verifyEmail = useMutation(api.auth.verifyEmail.verifyEmail);
  const resendCode = useMutation(api.auth.signup.resendCode);

  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email) {
      setError("Missing email. Please sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await verifyEmail({ email, code });
      toast.message({
        title: "Email verified",
        description: "You can now sign in to your account.",
      });
      router.push("/sign-in");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify your email."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!email) {
      toast.message({
        title: "Email required",
        description: "Go back and sign up again.",
      });
      return;
    }

    setIsResending(true);
    try {
      await resendCode({ email });
      toast.message({
        title: "Code sent",
        description: "Check your inbox for the verification code.",
      });
    } catch (err) {
      toast.message({
        title: "Unable to resend code",
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox to activate your account."
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Enter verification code</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              "your email"
            )}
            .
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="text-sm font-medium">Verification code</p>
            <OtpInput
              value={code}
              onChange={(next) => {
                setCode(next);
                if (error) setError(undefined);
              }}
              disabled={isSubmitting}
              error={error}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="h-11 w-full cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending}
          className="w-full cursor-pointer text-center text-sm font-medium text-secondary transition-colors hover:text-secondary/80 disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend verification code"}
        </button>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          <span>Code expires in 10 minutes. Check spam if you don&apos;t see it.</span>
        </div>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            href="/sign-in"
            className="cursor-pointer font-medium text-secondary transition-colors hover:text-secondary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
