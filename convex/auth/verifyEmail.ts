import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { MAX_VERIFY_ATTEMPTS } from "./constants";
import { verifyCode } from "./crypto";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const verifyEmail = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const code = args.code.trim();

    if (!/^\d{6}$/.test(code)) {
      throw new Error("Invalid verification code.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid verification code.");
    }

    if (user.emailVerified) {
      return { success: true, alreadyVerified: true };
    }

    const verification = await ctx.db
      .query("verificationCodes")
      .withIndex("by_user_created", (query) => query.eq("userId", user._id))
      .order("desc")
      .first();

    if (!verification) {
      throw new Error("Verification code expired. Request a new one.");
    }

    if (verification.expiresAt < Date.now()) {
      await ctx.db.delete(verification._id);
      throw new Error("Verification code expired. Request a new one.");
    }

    if (verification.attempts >= MAX_VERIFY_ATTEMPTS) {
      await ctx.db.delete(verification._id);
      throw new Error("Too many attempts. Request a new verification code.");
    }

    const isValid = await verifyCode(code, verification.codeHash);
    if (!isValid) {
      await ctx.db.patch(verification._id, {
        attempts: verification.attempts + 1,
      });
      throw new Error("Invalid verification code.");
    }

    await ctx.db.patch(user._id, { emailVerified: true });
    await ctx.db.delete(verification._id);

    return { success: true, alreadyVerified: false };
  },
});
