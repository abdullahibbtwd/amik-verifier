import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function assertServerSecret(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Unauthorized");
  }
}

export const getWalletOverview = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const virtualAccount = await ctx.db
      .query("virtualAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    const kyc = await ctx.db
      .query("userKyc")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    const transactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    const credits = transactions
      .filter((txn) => txn.type === "credit" && txn.status === "completed")
      .reduce((sum, txn) => sum + txn.amount, 0);
    const debits = transactions
      .filter((txn) => txn.type === "debit" && txn.status === "completed")
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      balance: wallet?.balance ?? 0,
      currency: wallet?.currency ?? "NGN",
      virtualAccount,
      kyc,
      transactions,
      stats: { credits, debits },
    };
  },
});

export const submitKyc = mutation({
  args: {
    userId: v.id("users"),
    bvnLast4: v.string(),
    ninLast4: v.optional(v.string()),
    bankAccountNumber: v.string(),
    bankCode: v.string(),
    paystackCustomerCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingKyc = await ctx.db
      .query("userKyc")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (existingKyc?.status === "verified") {
      throw new Error("KYC is already verified.");
    }

    if (existingKyc?.status === "pending") {
      await ctx.db.patch(existingKyc._id, {
        status: "failed",
        failureReason: "Replaced by a new submission",
      });
    }

    const kycId = await ctx.db.insert("userKyc", {
      userId: args.userId,
      bvnLast4: args.bvnLast4,
      ninLast4: args.ninLast4,
      bankAccountNumber: args.bankAccountNumber,
      bankCode: args.bankCode,
      status: "pending",
      submittedAt: Date.now(),
    });

    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existingWallet) {
      const now = Date.now();
      await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        currency: "NGN",
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingVa = await ctx.db
      .query("virtualAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (existingVa?.status === "pending") {
      await ctx.db.patch(existingVa._id, {
        status: "failed",
        failureReason: "Replaced by a new submission",
      });
    }

    if (existingVa?.status === "active") {
      return { kycId, virtualAccountId: existingVa._id, alreadyActive: true };
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const virtualAccountId = await ctx.db.insert("virtualAccounts", {
      userId: args.userId,
      accountNumber: "pending",
      accountName: `Amik Verifier / ${user.name}`,
      bankName: "Pending",
      bankSlug: "test-bank",
      paystackCustomerCode: args.paystackCustomerCode ?? "pending",
      status: "pending",
      createdAt: Date.now(),
    });

    if (args.paystackCustomerCode) {
      await ctx.db.patch(args.userId, {
        paystackCustomerCode: args.paystackCustomerCode,
      });
    }

    return { kycId, virtualAccountId, alreadyActive: false };
  },
});

export const activateVirtualAccount = mutation({
  args: {
    paystackCustomerCode: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    bankName: v.string(),
    bankSlug: v.string(),
    paystackDvaId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const virtualAccount = await ctx.db
      .query("virtualAccounts")
      .withIndex("by_customer_code", (q) =>
        q.eq("paystackCustomerCode", args.paystackCustomerCode)
      )
      .order("desc")
      .first();

    if (!virtualAccount) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_paystack_customer", (q) =>
          q.eq("paystackCustomerCode", args.paystackCustomerCode)
        )
        .unique();

      if (!user) return { ok: false as const };

      await ctx.db.insert("virtualAccounts", {
        userId: user._id,
        accountNumber: args.accountNumber,
        accountName: args.accountName,
        bankName: args.bankName,
        bankSlug: args.bankSlug,
        paystackCustomerCode: args.paystackCustomerCode,
        paystackDvaId: args.paystackDvaId,
        status: "active",
        createdAt: Date.now(),
        activatedAt: Date.now(),
      });

      const kyc = await ctx.db
        .query("userKyc")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      if (kyc && kyc.status === "pending") {
        await ctx.db.patch(kyc._id, {
          status: "verified",
          verifiedAt: Date.now(),
        });
      }

      return { ok: true as const };
    }

    await ctx.db.patch(virtualAccount._id, {
      accountNumber: args.accountNumber,
      accountName: args.accountName,
      bankName: args.bankName,
      bankSlug: args.bankSlug,
      paystackDvaId: args.paystackDvaId,
      status: "active",
      activatedAt: Date.now(),
    });

    const kyc = await ctx.db
      .query("userKyc")
      .withIndex("by_user", (q) => q.eq("userId", virtualAccount.userId))
      .order("desc")
      .first();

    if (kyc && kyc.status === "pending") {
      await ctx.db.patch(kyc._id, {
        status: "verified",
        verifiedAt: Date.now(),
      });
    }

    return { ok: true as const };
  },
});

export const markKycFailed = mutation({
  args: {
    serverSecret: v.string(),
    paystackCustomerCode: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await ctx.db
      .query("users")
      .withIndex("by_paystack_customer", (q) =>
        q.eq("paystackCustomerCode", args.paystackCustomerCode)
      )
      .unique();

    if (!user) return { ok: false as const };

    const kyc = await ctx.db
      .query("userKyc")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (kyc) {
      await ctx.db.patch(kyc._id, {
        status: "failed",
        failureReason: args.reason,
      });
    }

    const virtualAccount = await ctx.db
      .query("virtualAccounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (virtualAccount && virtualAccount.status === "pending") {
      await ctx.db.patch(virtualAccount._id, {
        status: "failed",
        failureReason: args.reason,
      });
    }

    return { ok: true as const };
  },
});

export const creditWallet = mutation({
  args: {
    serverSecret: v.string(),
    reference: v.string(),
    paystackReference: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    paystackCustomerCode: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const existing = await ctx.db
      .query("walletTransactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (existing) {
      return { ok: true as const, duplicate: true as const };
    }

    let userId = args.userId ?? null;

    if (!userId) {
      const pendingDeposit = await ctx.db
        .query("pendingDeposits")
        .withIndex("by_reference", (q) => q.eq("reference", args.reference))
        .unique();
      userId = pendingDeposit?.userId ?? null;
    }

    if (!userId && args.accountNumber) {
      const virtualAccount = await ctx.db
        .query("virtualAccounts")
        .withIndex("by_account_number", (q) =>
          q.eq("accountNumber", args.accountNumber!)
        )
        .unique();
      userId = virtualAccount?.userId ?? null;
    }

    if (!userId && args.paystackCustomerCode) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_paystack_customer", (q) =>
          q.eq("paystackCustomerCode", args.paystackCustomerCode!)
        )
        .unique();
      userId = user?._id ?? null;
    }

    if (!userId) {
      return { ok: false as const, reason: "user_not_found" as const };
    }

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .unique();

    const now = Date.now();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: userId!,
        balance: 0,
        currency: "NGN",
        createdAt: now,
        updatedAt: now,
      });
      wallet = await ctx.db.get(walletId);
    }

    if (!wallet) {
      return { ok: false as const, reason: "wallet_not_found" as const };
    }

    const newBalance = wallet.balance + args.amount;

    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: userId!,
      type: "credit",
      amount: args.amount,
      balanceAfter: newBalance,
      reference: args.reference,
      description: args.description,
      paystackReference: args.paystackReference,
      status: "completed",
      createdAt: now,
    });

    const pendingDeposit = await ctx.db
      .query("pendingDeposits")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (pendingDeposit && pendingDeposit.status === "pending") {
      await ctx.db.patch(pendingDeposit._id, {
        status: "completed",
        completedAt: now,
      });
    }

    return { ok: true as const, duplicate: false as const };
  },
});

export const createPendingDeposit = mutation({
  args: {
    userId: v.id("users"),
    reference: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existingWallet) {
      const now = Date.now();
      await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        currency: "NGN",
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingReference = await ctx.db
      .query("pendingDeposits")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (existingReference) {
      throw new Error("Deposit reference already exists.");
    }

    const depositId = await ctx.db.insert("pendingDeposits", {
      userId: args.userId,
      reference: args.reference,
      amount: args.amount,
      status: "pending",
      createdAt: Date.now(),
    });

    return { depositId };
  },
});

export const getPendingDepositByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pendingDeposits")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();
  },
});

export const recordWebhookEvent = mutation({
  args: {
    serverSecret: v.string(),
    eventId: v.string(),
    event: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const existing = await ctx.db
      .query("paystackWebhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) {
      return { processed: false as const };
    }

    await ctx.db.insert("paystackWebhookEvents", {
      eventId: args.eventId,
      event: args.event,
      processedAt: Date.now(),
    });

    return { processed: true as const };
  },
});

export const updatePaystackCustomerCode = mutation({
  args: {
    userId: v.id("users"),
    paystackCustomerCode: v.string(),
    virtualAccountId: v.id("virtualAccounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      paystackCustomerCode: args.paystackCustomerCode,
    });
    await ctx.db.patch(args.virtualAccountId, {
      paystackCustomerCode: args.paystackCustomerCode,
    });
  },
});
