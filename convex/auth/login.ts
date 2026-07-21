import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

type AuthUser = {
  id: Id<"users">;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
};

type AuthenticateResult =
  | { ok: false; reason: "invalid_credentials" | "email_not_verified" }
  | { ok: true; user: AuthUser };

type RefreshSessionResult =
  | { ok: false }
  | { ok: true; user: AuthUser };

export const authenticate = action({
  args: {
    email: v.string(),
    password: v.string(),
    refreshToken: v.string(),
    device: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthenticateResult> => {
    const result = await ctx.runQuery(internal.auth.sessions.verifyCredentials, {
      email: args.email,
      password: args.password,
    });

    if (!result.ok) {
      return result;
    }

    await ctx.runMutation(internal.auth.sessions.createSession, {
      userId: result.user.id,
      refreshToken: args.refreshToken,
      device: args.device,
      ip: args.ip,
    });

    return {
      ok: true,
      user: result.user,
    };
  },
});

export const refreshSession = action({
  args: {
    refreshToken: v.string(),
    newRefreshToken: v.string(),
    device: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<RefreshSessionResult> => {
    return await ctx.runMutation(internal.auth.sessions.rotateSession, args);
  },
});

export const logout = action({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    return await ctx.runMutation(internal.auth.sessions.revokeSession, args);
  },
});

export const getCurrentUser = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    id: Id<"users">;
    name: string;
    email: string;
    phone: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
  } | null> => {
    return await ctx.runQuery(internal.auth.sessions.getUserById, {
      userId: args.userId,
    });
  },
});
