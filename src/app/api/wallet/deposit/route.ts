import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import { requireAuthenticatedUserId } from "@/lib/auth/require-user";
import {
  generateDepositReference,
  getPublicKey,
  initializeTransaction,
} from "@/lib/paystack/client";
import { instantDepositSchema } from "@/lib/validations/wallet";

function getAppUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUserId(request);
    if (!auth.userId) {
      return auth.response!;
    }

    const body = await request.json();
    const data = instantDepositSchema.parse(body);
    const client = getConvexHttpClient();

    const user = await client.action(api.auth.login.getCurrentUser, {
      userId: auth.userId,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const amountKobo = Math.round(data.amount * 100);
    const reference = generateDepositReference(auth.userId);

    await client.mutation(api.wallet.createPendingDeposit, {
      userId: auth.userId,
      reference,
      amount: amountKobo,
    });

    const callbackUrl = `${getAppUrl(request)}/wallet?deposit=success&reference=${encodeURIComponent(reference)}`;

    const paystack = await initializeTransaction({
      email: user.email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId: auth.userId,
        depositType: "instant",
      },
    });

    return NextResponse.json({
      publicKey: getPublicKey(),
      email: user.email,
      amount: amountKobo,
      reference,
      authorizationUrl: paystack.data.authorization_url,
      accessCode: paystack.data.access_code,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid amount." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start deposit.",
      },
      { status: 500 }
    );
  }
}
