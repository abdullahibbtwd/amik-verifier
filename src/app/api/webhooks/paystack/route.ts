import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";

type PaystackWebhookPayload = {
  event: string;
  data: Record<string, unknown>;
};

function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

function getServerSecret() {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret) {
    throw new Error("CONVEX_SERVER_SECRET is not configured");
  }
  return secret;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  const client = getConvexHttpClient();
  const serverSecret = getServerSecret();
  const eventId = `${payload.event}:${JSON.stringify(payload.data).slice(0, 120)}`;

  const recorded = await client.mutation(api.wallet.recordWebhookEvent, {
    serverSecret,
    eventId,
    event: payload.event,
  });

  if (!recorded.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (
      payload.event === "dedicatedaccount.assign.success" ||
      payload.event === "assigndedicatedaccount.success"
    ) {
      const data = payload.data;
      const customer = data.customer as Record<string, unknown> | undefined;
      const dedicatedAccount = data.dedicated_account as
        | Record<string, unknown>
        | undefined;
      const bank = dedicatedAccount?.bank as Record<string, unknown> | undefined;

      const customerCode =
        asString(customer?.customer_code) ?? asString(data.customer_code);

      if (customerCode && dedicatedAccount) {
        await client.mutation(api.wallet.activateVirtualAccount, {
          paystackCustomerCode: customerCode,
          accountNumber: asString(dedicatedAccount.account_number) ?? "",
          accountName: asString(dedicatedAccount.account_name) ?? "",
          bankName: asString(bank?.name) ?? "Test Bank",
          bankSlug: asString(bank?.slug) ?? "test-bank",
          paystackDvaId: dedicatedAccount.id
            ? String(dedicatedAccount.id)
            : undefined,
        });
      }
    }

    if (
      payload.event === "customeridentification.failed" ||
      payload.event === "dedicatedaccount.assign.failed"
    ) {
      const data = payload.data;
      const customerCode = asString(data.customer_code);
      const reason =
        asString(data.reason) ??
        "Paystack could not verify your identity details.";

      if (customerCode) {
        await client.mutation(api.wallet.markKycFailed, {
          serverSecret,
          paystackCustomerCode: customerCode,
          reason,
        });
      }
    }

    if (payload.event === "charge.success") {
      const data = payload.data;
      const reference = asString(data.reference);
      const amount = asNumber(data.amount);
      const metadata = data.metadata as Record<string, unknown> | undefined;
      const metadataUserId = asString(metadata?.userId);
      const depositType = asString(metadata?.depositType);
      const customer = data.customer as Record<string, unknown> | undefined;
      const authorization = data.authorization as
        | Record<string, unknown>
        | undefined;
      const receiverAccount = authorization?.receiver_bank_account_number;
      const accountNumber =
        typeof receiverAccount === "string" ? receiverAccount : undefined;
      const customerCode = asString(customer?.customer_code);

      if (reference && amount) {
        const description =
          depositType === "instant"
            ? "Instant wallet deposit"
            : "Wallet funding via bank transfer";

        await client.mutation(api.wallet.creditWallet, {
          serverSecret,
          reference,
          paystackReference: reference,
          accountNumber,
          paystackCustomerCode: customerCode,
          amount,
          description,
          ...(metadataUserId
            ? { userId: metadataUserId as Id<"users"> }
            : {}),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
