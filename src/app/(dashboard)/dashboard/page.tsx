"use client";

import { useState } from "react";
import {
  ArrowRight,
  Copy,
  CreditCard,
  IdCard,
  Landmark,
  Wallet,
} from "lucide-react";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  mockTransactions,
  mockVerifications,
  mockWallet,
} from "@/lib/mock-data";

const recentActivity = [
  ...mockVerifications.map((v) => ({
    id: v.id,
    title: `${v.type} verification`,
    subtitle: v.name ?? v.identifier,
    amount: -v.cost,
    status: v.status,
    date: v.date,
    type: "verification" as const,
  })),
  ...mockTransactions.map((t) => ({
    id: t.id,
    title: t.description,
    subtitle: t.type === "credit" ? "Wallet credit" : "Wallet debit",
    amount: t.type === "credit" ? t.amount : -t.amount,
    status: t.status,
    date: t.date,
    type: "transaction" as const,
  })),
]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 6);

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const { virtualAccount } = mockWallet;

  function copyAccount() {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your wallet, quick actions, and recent activity
        </p>
      </div>

      {/* Wallet + account card */}
      <Card className="overflow-hidden border-border bg-primary text-primary-foreground">
        <CardContent className="p-0">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Wallet className="size-4" />
                  Wallet balance
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {formatCurrency(mockWallet.balance)}
                </p>
              </div>
              <ButtonLink
                href="/wallet"
                size="sm"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Fund Wallet
              </ButtonLink>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/60">
                Virtual account
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/20">
                    <Landmark className="size-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{virtualAccount.bank}</p>
                    <p className="font-mono text-lg font-semibold tracking-wide">
                      {virtualAccount.accountNumber}
                    </p>
                    <p className="text-xs text-primary-foreground/60">
                      {virtualAccount.accountName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                  onClick={copyAccount}
                >
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy number"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick actions
        </h2>
        <QuickActionsGrid />
      </div>

      {/* Recent activity */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>
              Your latest transactions and verifications
            </CardDescription>
          </div>
          <ButtonLink variant="ghost" size="sm" href="/history">
            View all
            <ArrowRight className="size-4" />
          </ButtonLink>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    item.amount > 0
                      ? "bg-success/10 text-success"
                      : "bg-primary/5 text-primary"
                  )}
                >
                  {item.type === "verification" ? (
                    <IdCard className="size-4" />
                  ) : item.amount > 0 ? (
                    <Wallet className="size-4" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      item.amount > 0 ? "text-success" : "text-foreground"
                    )}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {formatCurrency(Math.abs(item.amount))}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <Badge
                      variant={
                        item.status === "completed" ||
                        item.status === "verified"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        item.status === "completed" ||
                        item.status === "verified"
                          ? "bg-success/10 text-success"
                          : undefined
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(item.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
