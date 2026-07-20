import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  FileCheck2,
  IdCard,
  Lock,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, servicePricing } from "@/lib/mock-data";

const pricingIcons = {
  nin: IdCard,
  bvn: CreditCard,
  data: Smartphone,
} as const;

const steps = [
  {
    icon: Wallet,
    title: "Fund Wallet",
    description:
      "Top up securely via bank transfer to your dedicated virtual account. Payments are processed through licensed payment partners.",
  },
  {
    icon: Search,
    title: "Run Verification",
    description:
      "Submit a NIN or BVN for instant lookup. Every request is logged with a full audit trail for compliance.",
  },
  {
    icon: FileCheck2,
    title: "Download Slip",
    description:
      "Retrieve verified records and generate downloadable identity slips — basic or premium — ready for your records.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#00C89718,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0F2B4610,_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-medium text-secondary">
              <ShieldCheck className="size-3.5" />
              Built for agents, businesses & walk-in centres
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Nigeria&apos;s trusted platform for{" "}
              <span className="text-secondary">NIN, BVN</span> & data
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Run instant identity verifications, buy data and airtime, and
              generate slips — all from one wallet. Licensed providers. Clear
              pricing. No API keys needed to get started.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "NIN from", price: formatCurrency(350) },
                { label: "BVN from", price: formatCurrency(250) },
                { label: "1GB data", price: formatCurrency(650) },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm"
                >
                  <span className="text-muted-foreground">{chip.label} </span>
                  <span className="font-semibold text-foreground">
                    {chip.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/sign-up" size="lg">
                Create free account
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="outline" size="lg">
                Explore demo
              </ButtonLink>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-secondary" />
                Bank-grade encryption
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-secondary" />
                Licensed verification partners
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="size-3.5 text-secondary" />
                Pay-as-you-go wallet
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            Three steps from account setup to verified identity data
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title} className="border-border bg-card">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary/10">
                  <step.icon className="size-5 text-secondary" />
                </div>
                <CardTitle className="text-base">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold">Transparent pricing</h2>
            <p className="mt-2 text-muted-foreground">
              Pay only for what you use — NIN, BVN, and data bundles at clear
              rates
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {servicePricing.map((category) => {
              const Icon =
                pricingIcons[category.id as keyof typeof pricingIcons];
              const fromPrice = Math.min(...category.items.map((i) => i.price));

              return (
                <Card
                  key={category.id}
                  className={
                    category.highlighted
                      ? "border-secondary ring-1 ring-secondary"
                      : "border-border bg-background"
                  }
                >
                  <CardHeader>
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary/10">
                      <Icon className="size-5 text-secondary" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                    <p className="pt-2 text-sm text-muted-foreground">
                      From{" "}
                      <span className="text-2xl font-bold text-foreground">
                        {formatCurrency(fromPrice)}
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-border rounded-xl border border-border">
                      {category.items.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center justify-between px-4 py-3 text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/pricing" variant="outline">
              View full pricing
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-semibold">Start verifying today</h2>
        <p className="mt-2 text-muted-foreground">
          Create an account in minutes. No API keys required to explore the
          platform.
        </p>
        <ButtonLink href="/sign-up" className="mt-8" size="lg">
          Create account
        </ButtonLink>
      </section>
    </>
  );
}
