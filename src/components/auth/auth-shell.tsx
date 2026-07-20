import Link from "next/link";
import { FileCheck2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Licensed verification",
    description: "Instant, secure NIN and BVN lookups through trusted providers.",
  },
  {
    icon: Wallet,
    title: "Wallet-based billing",
    description: "Fund once, pay per lookup — no surprise charges.",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready records",
    description: "Every verification logged for compliance and accountability.",
  },
  {
    icon: Lock,
    title: "Data protection",
    description: "Encrypted in transit and at rest. Your data stays private.",
  },
];

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh">
      {/* Brand panel — desktop */}
      <aside className="relative hidden w-[45%] max-w-xl flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#00C89725,_transparent_55%)]" />
        <div className="relative">
          <Logo priority variant="light" className="size-12 lg:size-16" />
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
              {subtitle}
            </p>
          </div>

          <ul className="space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15">
                  <item.icon className="size-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/65">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Amik Verifier & Data
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 lg:border-none lg:px-10 lg:pt-10">
          <Logo variant="light" className="size-10 lg:hidden" />
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-block"
          >
            ← Back to home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
