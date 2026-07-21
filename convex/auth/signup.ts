import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { MAX_VERIFY_ATTEMPTS, OTP_EXPIRY_MS, OTP_LENGTH } from "./constants";
import {
  decryptCode,
  encryptCode,
  generateOtp,
  hashCode,
  hashPassword,
} from "./crypto";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = normalizeEmail(args.email);
    const phone = normalizePhone(args.phone);
    const password = args.password;

    if (name.length < 2) {
      throw new Error("Name is too short.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address.");
    }
    if (!/^(\+234|0)[789]\d{9}$/.test(phone)) {
      throw new Error("Invalid Nigerian phone number.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();
    if (existingEmail) {
      throw new Error("An account with this email already exists.");
    }

    const existingPhone = await ctx.db
      .query("users")
      .withIndex("by_phone", (query) => query.eq("phone", phone))
      .unique();
    if (existingPhone) {
      throw new Error("An account with this phone number already exists.");
    }

    const passwordHash = await hashPassword(password);
    const userId = await ctx.db.insert("users", {
      name,
      email,
      phone,
      passwordHash,
      role: "USER",
      emailVerified: false,
      mfaEnabled: false,
      createdAt: Date.now(),
    });

    const code = generateOtp(OTP_LENGTH);
    const codeHash = await hashCode(code);
    const codeEncrypted = await encryptCode(code);
    const now = Date.now();

    await ctx.db.insert("verificationCodes", {
      userId,
      codeHash,
      codeEncrypted,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.auth.email.sendVerificationEmail, {
      email,
      name,
      code,
    });

    return { userId, email };
  },
});

export const resendCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();

    if (!user) {
      return { success: true };
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified.");
    }

    const now = Date.now();
    const latestCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_user_created", (query) => query.eq("userId", user._id))
      .order("desc")
      .first();

    if (latestCode && latestCode.expiresAt > now) {
      const code = await decryptCode(latestCode.codeEncrypted);
      await ctx.scheduler.runAfter(
        0,
        internal.auth.email.sendVerificationEmail,
        {
          email: user.email,
          name: user.name,
          code,
        },
      );
      return { success: true, resentExisting: true };
    }

    if (latestCode) {
      await ctx.db.delete(latestCode._id);
    }

    const code = generateOtp(OTP_LENGTH);
    const codeHash = await hashCode(code);
    const codeEncrypted = await encryptCode(code);

    await ctx.db.insert("verificationCodes", {
      userId: user._id,
      codeHash,
      codeEncrypted,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.auth.email.sendVerificationEmail, {
      email: user.email,
      name: user.name,
      code,
    });

    return { success: true, resentExisting: false };
  },
});
