import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("USER"), v.literal("ADMIN")),
    emailVerified: v.boolean(),
    mfaEnabled: v.boolean(),
    createdAt: v.number(),
    paystackCustomerCode: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_paystack_customer", ["paystackCustomerCode"]),

  verificationCodes: defineTable({
    userId: v.id("users"),
    codeHash: v.string(),
    codeEncrypted: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  sessions: defineTable({
    userId: v.id("users"),
    refreshTokenHash: v.string(),
    device: v.optional(v.string()),
    ip: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_refresh_hash", ["refreshTokenHash"]),

  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    currency: v.literal("NGN"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  userKyc: defineTable({
    userId: v.id("users"),
    bvnLast4: v.string(),
    ninLast4: v.optional(v.string()),
    bankAccountNumber: v.string(),
    bankCode: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("failed")
    ),
    failureReason: v.optional(v.string()),
    submittedAt: v.number(),
    verifiedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  virtualAccounts: defineTable({
    userId: v.id("users"),
    accountNumber: v.string(),
    accountName: v.string(),
    bankName: v.string(),
    bankSlug: v.string(),
    paystackCustomerCode: v.string(),
    paystackDvaId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("failed")
    ),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    activatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_account_number", ["accountNumber"])
    .index("by_customer_code", ["paystackCustomerCode"]),

  walletTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    balanceAfter: v.number(),
    reference: v.string(),
    description: v.string(),
    paystackReference: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_reference", ["reference"]),

  paystackWebhookEvents: defineTable({
    eventId: v.string(),
    event: v.string(),
    processedAt: v.number(),
  }).index("by_event_id", ["eventId"]),

  pendingDeposits: defineTable({
    userId: v.id("users"),
    reference: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_reference", ["reference"])
    .index("by_user", ["userId"]),

  verifications: defineTable({
    status: v.string(),
    createdAt: v.number(),
  }),
});
