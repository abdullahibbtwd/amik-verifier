"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { internalAction } from "../_generated/server";

export const sendVerificationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    code: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "Auth <onboarding@resend.dev>";

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: args.email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0F2B46;">Email Verification</h2>
          <p>Hi ${args.name},</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 0.3em; color: #0F2B46;">${args.code}</h1>
          <p style="color: #6C757D;">This code expires in 10 minutes.</p>
          <p style="color: #6C757D;">If you did not create an account, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
});
