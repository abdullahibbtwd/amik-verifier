import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { REFRESH_TOKEN_DAYS } from "./constants";
import { hashToken, verifyPassword } from "./crypto";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const verifyCredentials = internalQuery({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();

    if (!user) {
      return { ok: false as const, reason: "invalid_credentials" as const };
    }

    const passwordValid = await verifyPassword(args.password, user.passwordHash);
    if (!passwordValid) {
      return { ok: false as const, reason: "invalid_credentials" as const };
    }

    if (!user.emailVerified) {
      return { ok: false as const, reason: "email_not_verified" as const };
    }

    return {
      ok: true as const,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    refreshToken: v.string(),
    device: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const refreshTokenHash = await hashToken(args.refreshToken);
    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      refreshTokenHash,
      device: args.device,
      ip: args.ip,
      expiresAt: now + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
      createdAt: now,
    });

    return { sessionId };
  },
});

export const revokeSession = internalMutation({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    const refreshTokenHash = await hashToken(args.refreshToken);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_refresh_hash", (query) =>
        query.eq("refreshTokenHash", refreshTokenHash)
      )
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

export const rotateSession = internalMutation({
  args: {
    refreshToken: v.string(),
    newRefreshToken: v.string(),
    device: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const refreshTokenHash = await hashToken(args.refreshToken);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_refresh_hash", (query) =>
        query.eq("refreshTokenHash", refreshTokenHash)
      )
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      if (session) {
        await ctx.db.delete(session._id);
      }
      return { ok: false as const };
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      await ctx.db.delete(session._id);
      return { ok: false as const };
    }

    const newRefreshTokenHash = await hashToken(args.newRefreshToken);
    const now = Date.now();

    await ctx.db.patch(session._id, {
      refreshTokenHash: newRefreshTokenHash,
      device: args.device ?? session.device,
      ip: args.ip ?? session.ip,
      expiresAt: now + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    });

    return {
      ok: true as const,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  },
});

export const getUserById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  },
});
