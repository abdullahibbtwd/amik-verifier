const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type AssignDedicatedAccountPayload = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  preferred_bank: string;
  country: "NG";
  account_number: string;
  bvn: string;
  bank_code: string;
  middle_name?: string;
};

export type AssignDedicatedAccountResult = {
  customer: {
    id: number;
    customer_code: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  dedicated_account?: {
    id: number;
    account_number: string;
    account_name: string;
    bank: {
      name: string;
      slug: string;
    };
  };
};

function getSecretKey() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return secret;
}

async function paystackRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json()) as PaystackResponse<T> & {
    meta?: unknown;
  };

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Paystack request failed");
  }

  return payload;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "User";
  const lastName = parts.length > 1 ? parts[parts.length - 1]! : firstName;
  const middleName =
    parts.length > 2 ? parts.slice(1, -1).join(" ") : undefined;

  return { firstName, middleName, lastName };
}

export function formatPhoneForPaystack(phone: string) {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  if (cleaned.startsWith("234")) return `+${cleaned}`;
  return `+234${cleaned}`;
}

export async function assignDedicatedAccount(
  payload: AssignDedicatedAccountPayload
) {
  return paystackRequest<AssignDedicatedAccountResult>(
    "/dedicated_account/assign",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export const PAYSTACK_TEST_DETAILS = {
  preferredBank: "test-bank",
  bankCode: "007",
  accountNumber: "0111111111",
  bvn: "222222222221",
  firstName: "Uchenna",
  lastName: "Okoro",
} as const;

export type InitializeTransactionPayload = {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, string>;
};

export type InitializeTransactionResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type VerifyTransactionResult = {
  status: string;
  reference: string;
  amount: number;
  metadata?: Record<string, string>;
};

export function getPublicKey() {
  const key = process.env.PAYSTACK_PUBLIC_KEY;
  if (!key) {
    throw new Error("PAYSTACK_PUBLIC_KEY is not configured");
  }
  return key;
}

export function generateDepositReference(userId: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `amik_dep_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}_${Date.now()}_${random}`;
}

export async function initializeTransaction(
  payload: InitializeTransactionPayload
) {
  return paystackRequest<InitializeTransactionResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackRequest<VerifyTransactionResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}
