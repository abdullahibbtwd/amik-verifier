import { CreditCard, IdCard, Smartphone } from "lucide-react";
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

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Clear rates for NIN, BVN, and data bundles. Fund your wallet and pay
          only for what you use — no hidden charges.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {servicePricing.map((category) => {
          const Icon = pricingIcons[category.id as keyof typeof pricingIcons];
          const fromPrice = Math.min(...category.items.map((i) => i.price));

          return (
            <Card
              key={category.id}
              className={
                category.highlighted
                  ? "border-secondary ring-1 ring-secondary"
                  : "border-border bg-card"
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
              <CardContent className="space-y-4">
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {category.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold">
                        {formatCurrency(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/sign-up"
                  className="w-full"
                  variant={category.highlighted ? "default" : "outline"}
                >
                  Get started
                </ButtonLink>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
