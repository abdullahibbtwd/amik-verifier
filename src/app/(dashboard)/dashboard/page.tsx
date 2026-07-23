"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Copy,
  Landmark,
  Loader2,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { useAuth } from "@/components/auth/auth-context";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletOverview } from "@/hooks/use-wallet-overview";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/mock-data";

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    overview,
    isLoading: isWalletLoading,
    hasActiveAccount,
    isKycPending,
    balanceNaira,
    refresh,
  } = useWalletOverview();

  const isLoading = isAuthLoading || isWalletLoading;
  const recentTransactions = overview?.transactions.slice(0, 6) ?? [];

  function copyAccount() {
    const accountNumber = overview?.virtualAccount?.accountNumber;
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {isAuthLoading
            ? "Dashboard"
            : user
              ? `Welcome back, ${user.name.split(" ")[0]}`
              : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.email
            ? `Signed in as ${user.email}`
            : "Your wallet, quick actions, and recent activity"}
        </p>
      </div>

      <Card className="overflow-hidden border-border bg-primary text-primary-foreground">
        <CardContent className="p-0">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Wallet className="size-4" />
                  Wallet balance
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-12 w-40 bg-white/10" />
                ) : (
                  <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                    {formatCurrency(balanceNaira)}
                  </p>
                )}
              </div>
              <ButtonLink
                href="/wallet"
                size="sm"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Zap className="size-4" />
                Fund Wallet
              </ButtonLink>
            </div>

            {isLoading ? (
              <Skeleton className="mt-6 h-24 w-full rounded-xl bg-white/10" />
            ) : hasActiveAccount && overview?.virtualAccount ? (
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
                      <p className="text-sm font-medium">
                        {overview.virtualAccount.bankName}
                      </p>
                      <p className="font-mono text-lg font-semibold tracking-wide">
                        {overview.virtualAccount.accountNumber}
                      </p>
                      <p className="text-xs text-primary-foreground/60">
                        {overview.virtualAccount.accountName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                    onClick={copyAccount}
                  >
                    <Copy className="size-4" />
                    {copied ? "Copied" : "Copy number"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary-foreground/60">
                  <Landmark className="size-3.5" />
                  Virtual account
                </p>
                {isKycPending ? (
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/20">
                        <Loader2 className="size-5 animate-spin text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Generating your virtual account
                        </p>
                        <p className="text-xs text-primary-foreground/70">
                          KYC submitted — this usually takes a few seconds.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                      onClick={() => void refresh()}
                    >
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
                        <ShieldCheck className="size-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          No virtual account yet
                        </p>
                        <p className="mt-1 text-xs text-primary-foreground/70">
                          Complete KYC with your BVN and bank details to generate
                          a dedicated account number for bank transfers.
                        </p>
                      </div>
                    </div>
                    <ButtonLink
                      href="/wallet?kyc=1"
                      size="sm"
                      variant="outline"
                      className="mt-4 cursor-pointer border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                    >
                      <ShieldCheck className="size-4" />
                      Generate virtual account
                      <ArrowRight className="size-4" />
                    </ButtonLink>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick actions
        </h2>
        <QuickActionsGrid />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Your latest wallet transactions</CardDescription>
          </div>
          <ButtonLink variant="ghost" size="sm" href="/wallet">
            View wallet
            <ArrowRight className="size-4" />
          </ButtonLink>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 px-6 py-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No transactions yet.{" "}
              <ButtonLink href="/wallet" className="text-secondary">
                Make your first deposit
              </ButtonLink>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTransactions.map((txn) => (
                <li
                  key={txn._id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      txn.type === "credit"
                        ? "bg-success/10 text-success"
                        : "bg-primary/5 text-primary"
                    )}
                  >
                    {txn.type === "credit" ? (
                      <ArrowDownToLine className="size-4" />
                    ) : (
                      <ArrowUpFromLine className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {txn.description}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {txn.type === "credit" ? "Wallet credit" : "Wallet debit"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        txn.type === "credit" ? "text-success" : "text-foreground"
                      )}
                    >
                      {txn.type === "credit" ? "+" : "-"}
                      {formatCurrency(txn.amount / 100)}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <Badge
                        className={
                          txn.status === "completed"
                            ? "bg-success/10 text-success"
                            : undefined
                        }
                      >
                        {txn.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDate(new Date(txn.createdAt).toISOString())}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
