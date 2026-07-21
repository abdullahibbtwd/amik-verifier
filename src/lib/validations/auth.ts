import { z } from "zod";

const nigerianPhoneRegex = /^(\+234|0)[789]\d{9}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short"),
    phone: z
      .string()
      .trim()
      .regex(nigerianPhoneRegex, "Enter a valid Nigerian phone number"),
    email: z.email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.email("Enter a valid email address"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const resendCodeSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;

export const signupServerSchema = signupSchema;
export const loginServerSchema = loginSchema;
export const verifyEmailServerSchema = verifyEmailSchema;
export const resendCodeServerSchema = resendCodeSchema;
