import { z } from "zod";

const nigerianPhoneRegex = /^(\+234|0)[789]\d{9}$/;

export const walletKycSchema = z.object({
  bvn: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "BVN must be 11 digits"),
  nin: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{11}$/.test(value), {
      message: "NIN must be 11 digits",
    }),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Bank account number must be 10 digits"),
  bankCode: z
    .string()
    .trim()
    .regex(/^\d{3,6}$/, "Enter a valid bank code"),
  useTestCredentials: z.boolean().optional(),
});

export type WalletKycInput = z.infer<typeof walletKycSchema>;

export const instantDepositSchema = z.object({
  amount: z
    .number({
      error: "Enter a valid amount",
    })
    .min(100, "Minimum deposit is ₦100")
    .max(1_000_000, "Maximum deposit is ₦1,000,000"),
});

export type InstantDepositInput = z.infer<typeof instantDepositSchema>;
