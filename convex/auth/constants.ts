export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 10 * 60 * 1000;
export const MAX_VERIFY_ATTEMPTS = 5;
export const REFRESH_TOKEN_DAYS = 30;
export const ACCESS_TOKEN_MINUTES = 15;

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
