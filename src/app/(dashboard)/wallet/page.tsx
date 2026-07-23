"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Check,
  ChevronDown,
  Copy,
  IdCard,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/auth/auth-context";
import { AuthField } from "@/components/auth";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaystackPopup } from "@/hooks/use-paystack-popup";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { formatCurrency, formatDate } from "@/lib/mock-data";
import { PAYSTACK_TEST_DETAILS } from "@/lib/paystack/client";
import {
  instantDepositSchema,
  walletKycSchema,
  type InstantDepositInput,
  type WalletKycInput,
} from "@/lib/validations/wallet";

type WalletOverview = {
  balance: number;
  currency: string;
  virtualAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    status: "pending" | "active" | "failed";
    failureReason?: string;
  } | null;
  kyc: {
    status: "pending" | "verified" | "failed";
    failureReason?: string;
  } | null;
  transactions: Array<{
    _id: string;
    type: "credit" | "debit";
    amount: number;
    description: string;
    status: string;
    createdAt: number;
  }>;
  stats: { credits: number; debits: number };
};

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000];

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletPageSkeleton />}>
      <WalletPageContent />
    </Suspense>
  );
}

function WalletPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function WalletPageContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showKyc, setShowKyc] = useState(
    () => searchParams.get("kyc") === "1"
  );

  const loadWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wallet", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load wallet");
      const data = (await response.json()) as WalletOverview;
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyDeposit = useCallback(
    async (reference: string) => {
      try {
        const response = await fetch(
          `/api/wallet/deposit/verify?reference=${encodeURIComponent(reference)}`,
          { credentials: "include", cache: "no-store" }
        );
        const data = (await response.json()) as {
          status?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to verify payment");
        }

        if (data.status === "completed") {
          toast.message({
            title: "Wallet funded",
            description: "Your deposit was credited successfully.",
          });
          await loadWallet();
          router.replace("/wallet");
        }
      } catch (error) {
        toast.message({
          title: "Verification failed",
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      }
    },
    [loadWallet, router, toast]
  );

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (searchParams.get("kyc") === "1") {
      setShowKyc(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const deposit = searchParams.get("deposit");
    if (deposit === "success" && reference) {
      void verifyDeposit(reference);
    }
  }, [searchParams, verifyDeposit]);

  const hasActiveAccount = overview?.virtualAccount?.status === "active";
  const isKycPending =
    overview?.virtualAccount?.status === "pending" ||
    overview?.kyc?.status === "pending";
  const balanceNaira = (overview?.balance ?? 0) / 100;

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

  if (isLoading) {
    return <WalletPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Fund instantly with Paystack — no KYC required
        </p>
      </div>

      <Card className="overflow-hidden border-border bg-primary text-primary-foreground shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Wallet className="size-4" />
                Available balance
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrency(balanceNaira)}
              </p>
            </div>
            {hasActiveAccount ? (
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="cursor-pointer border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                    >
                      <Landmark className="size-4" />
                      Permanent account
                    </Button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Your virtual account</DialogTitle>
                    <DialogDescription>
                      Transfer anytime to this dedicated account number.
                    </DialogDescription>
                  </DialogHeader>
                  <VirtualAccountDetails
                    virtualAccount={overview!.virtualAccount!}
                    copiedField={copiedField}
                    onCopy={copyText}
                    variant="dialog"
                  />
                </DialogContent>
              </Dialog>
            ) : null}
          </div>

          {hasActiveAccount ? (
            <VirtualAccountDetails
              virtualAccount={overview!.virtualAccount!}
              copiedField={copiedField}
              onCopy={copyText}
              variant="inline"
            />
          ) : null}
        </CardContent>
      </Card>

      <InstantDepositCard onSuccess={loadWallet} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="size-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total funded</p>
              <p className="text-xl font-semibold text-success">
                {formatCurrency((overview?.stats.credits ?? 0) / 100)}
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
                {formatCurrency((overview?.stats.debits ?? 0) / 100)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionHistory transactions={overview?.transactions ?? []} />

      <Card className="border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setShowKyc((current) => !current)}
          className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/10">
              <ShieldCheck className="size-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium">Get a permanent virtual account</p>
              <p className="text-sm text-muted-foreground">
                Optional KYC — BVN + bank details for a dedicated account
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-muted-foreground transition-transform",
              showKyc && "rotate-180"
            )}
          />
        </button>

        {showKyc ? (
          <CardContent className="border-t border-border pt-6">
            {hasActiveAccount ? (
              <p className="text-sm text-muted-foreground">
                Your permanent virtual account is already active. See details
                above.
              </p>
            ) : isKycPending ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                <Loader2 className="size-4 animate-spin text-secondary" />
                <span>
                  Setting up your virtual account. Refresh in a few seconds.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto cursor-pointer"
                  onClick={() => void loadWallet()}
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <WalletKycForm onSuccess={loadWallet} userName={user?.name} />
            )}
          </CardContent>
        ) : null}
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0 text-secondary" />
        Paystack test mode — use test card{" "}
        <span className="font-mono">4084084084084081</span>, any future expiry,
        CVV <span className="font-mono">408</span>, PIN <span className="font-mono">0000</span>
      </div>
    </div>
  );
}

function InstantDepositCard({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const toast = useToast();
  const { isReady, isOpening, openCheckout } = usePaystackPopup();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5000);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InstantDepositInput>({
    resolver: zodResolver(instantDepositSchema),
    defaultValues: { amount: 5000 },
  });

  const amount = watch("amount");

  async function onSubmit(values: InstantDepositInput) {
    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        error?: string;
        publicKey: string;
        email: string;
        amount: number;
        reference: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start deposit");
      }

      await openCheckout({
        publicKey: data.publicKey,
        email: data.email,
        amount: data.amount,
        reference: data.reference,
        onSuccess: async (reference) => {
          const verifyResponse = await fetch(
            `/api/wallet/deposit/verify?reference=${encodeURIComponent(reference)}`,
            { credentials: "include", cache: "no-store" }
          );
          const verifyData = (await verifyResponse.json()) as {
            error?: string;
            status?: string;
          };

          if (!verifyResponse.ok) {
            throw new Error(verifyData.error ?? "Payment verification failed");
          }

          toast.message({
            title: "Wallet funded",
            description: "Your deposit was credited successfully.",
          });
          await onSuccess();
        },
        onClose: () => {
          toast.message({
            title: "Payment cancelled",
            description: "You closed the Paystack checkout.",
          });
        },
      });
    } catch (error) {
      toast.message({
        title: "Deposit failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="size-4 text-secondary" />
          Instant deposit
        </CardTitle>
        <CardDescription>
          Enter an amount and pay with Paystack checkout. No BVN or KYC needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <Button
                key={value}
                type="button"
                variant={selectedAmount === value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedAmount(value);
                  setValue("amount", value, { shouldValidate: true });
                }}
              >
                {formatCurrency(value)}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Custom amount (₦)</Label>
            <div className="relative">
              <Banknote className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min={100}
                step={100}
                className="h-11 pl-10"
                {...register("amount", { valueAsNumber: true })}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setSelectedAmount(value);
                  setValue("amount", value, { shouldValidate: true });
                }}
              />
            </div>
            {errors.amount ? (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isOpening || !isReady || !amount}
            className="h-11 w-full cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isSubmitting || isOpening ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Opening Paystack...
              </>
            ) : (
              <>
                <ArrowDownToLine className="size-4" />
                Pay {formatCurrency(amount || 0)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TransactionHistory({
  transactions,
}: {
  transactions: WalletOverview["transactions"];
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transaction history</CardTitle>
        <CardDescription>All credits and debits on your wallet</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No transactions yet. Make your first instant deposit above.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((txn) => (
              <li
                key={txn._id}
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
                  <p className="truncate text-sm font-medium">{txn.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(new Date(txn.createdAt).toISOString())}
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
                  <Badge
                    className={cn(
                      "mt-1",
                      txn.status === "completed"
                        ? "bg-success/10 text-success"
                        : undefined
                    )}
                  >
                    {txn.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function WalletKycForm({
  onSuccess,
  userName,
}: {
  onSuccess: () => Promise<void>;
  userName?: string;
}) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WalletKycInput>({
    resolver: zodResolver(walletKycSchema),
    defaultValues: {
      bvn: PAYSTACK_TEST_DETAILS.bvn,
      nin: "",
      bankAccountNumber: PAYSTACK_TEST_DETAILS.accountNumber,
      bankCode: PAYSTACK_TEST_DETAILS.bankCode,
      useTestCredentials: true,
    },
  });

  async function onSubmit(values: WalletKycInput) {
    try {
      const response = await fetch("/api/wallet/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to submit KYC.");
      toast.message({ title: "KYC submitted", description: data.message });
      await onSuccess();
    } catch (error) {
      toast.message({
        title: "KYC failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-lg border border-secondary/20 bg-secondary/5 px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Paystack test credentials</p>
        <p className="mt-1">
          BVN: {PAYSTACK_TEST_DETAILS.bvn} · Account:{" "}
          {PAYSTACK_TEST_DETAILS.accountNumber} · Bank code:{" "}
          {PAYSTACK_TEST_DETAILS.bankCode}
        </p>
        {userName ? <p className="mt-1">For {userName}</p> : null}
      </div>
      <AuthField id="bvn" label="BVN" icon={IdCard} inputMode="numeric" error={errors.bvn?.message} disabled={isSubmitting} {...register("bvn")} />
      <AuthField id="nin" label="NIN (optional)" icon={IdCard} inputMode="numeric" error={errors.nin?.message} disabled={isSubmitting} {...register("nin")} />
      <AuthField id="bankAccountNumber" label="Bank account number" icon={Landmark} inputMode="numeric" error={errors.bankAccountNumber?.message} disabled={isSubmitting} {...register("bankAccountNumber")} />
      <AuthField id="bankCode" label="Bank code" icon={Landmark} error={errors.bankCode?.message} disabled={isSubmitting} {...register("bankCode")} />
      <Button type="submit" disabled={isSubmitting} className="h-11 w-full cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90">
        {isSubmitting ? "Submitting..." : "Create permanent account"}
      </Button>
    </form>
  );
}

function VirtualAccountDetails({
  virtualAccount,
  copiedField,
  onCopy,
  variant,
}: {
  virtualAccount: { accountNumber: string; accountName: string; bankName: string };
  copiedField: string | null;
  onCopy: (text: string, field: string, label: string) => void;
  variant: "inline" | "dialog";
}) {
  const isInline = variant === "inline";
  return (
    <div className={cn("rounded-xl border p-4", isInline ? "mt-6 border-white/10 bg-white/5" : "border-border bg-muted/30")}>
      <p className={cn("text-xs font-medium uppercase tracking-wide", isInline ? "text-primary-foreground/60" : "text-muted-foreground")}>Virtual account</p>
      <div className="mt-4 flex items-start gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", isInline ? "bg-secondary/20" : "bg-secondary/10")}>
          <Landmark className="size-5 text-secondary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium", isInline ? "text-primary-foreground" : "text-foreground")}>{virtualAccount.bankName}</p>
          <p className={cn("mt-1 font-mono text-lg font-semibold tracking-wide", isInline ? "text-primary-foreground" : "text-foreground")}>{virtualAccount.accountNumber}</p>
          <p className={cn("mt-1 text-xs", isInline ? "text-primary-foreground/60" : "text-muted-foreground")}>{virtualAccount.accountName}</p>
        </div>
        <Button variant="outline" size="sm" className={cn("shrink-0 cursor-pointer", isInline && "border-white/20 bg-transparent text-primary-foreground hover:bg-white/10")} onClick={() => onCopy(virtualAccount.accountNumber, `account-${variant}`, "Account number")}>
          {copiedField === `account-${variant}` ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          {copiedField === `account-${variant}` ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
