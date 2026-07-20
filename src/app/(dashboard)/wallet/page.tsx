"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Copy,
  Landmark,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import {
  formatCurrency,
  formatDate,
  mockTransactions,
  mockWallet,
} from "@/lib/mock-data";

export default function WalletPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const toast = useToast();
  const { virtualAccount } = mockWallet;

  const stats = useMemo(() => {
    const credits = mockTransactions
      .filter((t) => t.type === "credit" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    const debits = mockTransactions
      .filter((t) => t.type === "debit" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    return { credits, debits };
  }, []);

  function copyText(text: string, field: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.message({
      title: "Copied",
      description: `${label} copied to clipboard.`,
      duration: 2500,
    });
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Manage your balance, fund via bank transfer, and track all wallet
          activity
        </p>
      </div>

      {/* Balance + virtual account */}
      <Card className="overflow-hidden border-border bg-primary text-primary-foreground shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Wallet className="size-4" />
                  Available balance
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {formatCurrency(mockWallet.balance)}
                </p>
              </div>

              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <ArrowDownToLine className="size-4" />
                      Fund Wallet
                    </Button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Fund Wallet</DialogTitle>
                    <DialogDescription>
                      Transfer to your dedicated virtual account. Funds are
                      credited securely — typically within minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <VirtualAccountDetails
                    virtualAccount={virtualAccount}
                    copiedField={copiedField}
                    onCopy={copyText}
                    variant="dialog"
                  />
                </DialogContent>
              </Dialog>
            </div>

            <VirtualAccountDetails
              virtualAccount={virtualAccount}
              copiedField={copiedField}
              onCopy={copyText}
              variant="inline"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="size-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total funded</p>
              <p className="text-xl font-semibold text-success">
                {formatCurrency(stats.credits)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/5">
              <TrendingDown className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total spent</p>
              <p className="text-xl font-semibold">
                {formatCurrency(stats.debits)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction history</CardTitle>
          <CardDescription>All credits and debits on your wallet</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {mockTransactions.map((txn) => (
              <li
                key={txn.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
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
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(txn.date)}
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
                    {formatCurrency(txn.amount)}
                  </p>
                  <Badge
                    className={cn(
                      "mt-1",
                      txn.status === "completed"
                        ? "bg-success/10 text-success"
                        : undefined
                    )}
                    variant={
                      txn.status === "completed" ? "default" : "destructive"
                    }
                  >
                    {txn.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0 text-secondary" />
        Payments are processed through licensed partners. Your bank transfer is
        encrypted and secure.
      </div>
    </div>
  );
}

function VirtualAccountDetails({
  virtualAccount,
  copiedField,
  onCopy,
  variant,
}: {
  virtualAccount: (typeof mockWallet)["virtualAccount"];
  copiedField: string | null;
  onCopy: (text: string, field: string, label: string) => void;
  variant: "inline" | "dialog";
}) {
  const isInline = variant === "inline";

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isInline
          ? "mt-6 border-white/10 bg-white/5"
          : "border-border bg-muted/30"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isInline ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
      >
        Virtual account
      </p>

      <div className="mt-4 flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isInline ? "bg-secondary/20" : "bg-secondary/10"
          )}
        >
          <Landmark
            className={cn(
              "size-5",
              isInline ? "text-secondary" : "text-secondary"
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              isInline ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {virtualAccount.bank}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-lg font-semibold tracking-wide",
              isInline ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {virtualAccount.accountNumber}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              isInline
                ? "text-primary-foreground/60"
                : "text-muted-foreground"
            )}
          >
            {virtualAccount.accountName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0",
            isInline &&
              "border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
          )}
          onClick={() =>
            onCopy(
              virtualAccount.accountNumber,
              `account-${variant}`,
              "Account number"
            )
          }
        >
          {copiedField === `account-${variant}` ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
          {copiedField === `account-${variant}` ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
