import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function MarketingFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Logo variant="light" className="size-10 lg:size-14" />
        <div className="flex gap-6 text-sm text-primary-foreground/70">
          <Link href="/pricing" className="transition-colors hover:text-primary-foreground">
            Pricing
          </Link>
          <Link href="/sign-in" className="transition-colors hover:text-primary-foreground">
            Sign in
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-primary-foreground">
            Dashboard
          </Link>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Amik Verifier & Data. All identity data
          is handled securely and in compliance with applicable regulations.
        </p>
      </div>
    </footer>
  );
}
