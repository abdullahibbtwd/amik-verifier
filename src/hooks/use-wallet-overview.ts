"use client";

import { useCallback, useEffect, useState } from "react";

export type WalletOverview = {
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
  stats: {
    credits: number;
    debits: number;
  };
};

export function useWalletOverview() {
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/wallet", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load wallet");
      }
      const data = (await response.json()) as WalletOverview;
      setOverview(data);
    } catch (err) {
      setOverview(null);
      setError(err instanceof Error ? err.message : "Unable to load wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasActiveAccount = overview?.virtualAccount?.status === "active";
  const isKycPending =
    overview?.virtualAccount?.status === "pending" ||
    overview?.kyc?.status === "pending";

  return {
    overview,
    isLoading,
    error,
    refresh,
    hasActiveAccount,
    isKycPending,
    balanceNaira: (overview?.balance ?? 0) / 100,
  };
}
