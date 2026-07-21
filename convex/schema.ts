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
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

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

  verifications: defineTable({
    status: v.string(),
    createdAt: v.number(),
  }),
});
