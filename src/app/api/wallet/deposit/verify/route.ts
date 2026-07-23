import { NextResponse } from "next/server";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import { requireAuthenticatedUserId } from "@/lib/auth/require-user";
import { verifyTransaction } from "@/lib/paystack/client";

function getServerSecret() {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret) {
    throw new Error("CONVEX_SERVER_SECRET is not configured");
  }
  return secret;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuthenticatedUserId(request);
    if (!auth.userId) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required." },
        { status: 400 }
      );
    }

    const client = getConvexHttpClient();
    const pendingDeposit = await client.query(
      api.wallet.getPendingDepositByReference,
      { reference }
    );

    if (!pendingDeposit || pendingDeposit.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Deposit not found." },
        { status: 404 }
      );
    }

    if (pendingDeposit.status === "completed") {
      const overview = await client.query(api.wallet.getWalletOverview, {
        userId: auth.userId,
      });
      return NextResponse.json({ status: "completed", overview });
    }

    const paystack = await verifyTransaction(reference);

    if (paystack.data.status !== "success") {
      return NextResponse.json({
        status: paystack.data.status,
        message: "Payment not completed yet.",
      });
    }

    const serverSecret = getServerSecret();
    await client.mutation(api.wallet.creditWallet, {
      serverSecret,
      reference,
      paystackReference: reference,
      userId: auth.userId,
      amount: paystack.data.amount,
      description: "Instant wallet deposit",
    });

    const overview = await client.query(api.wallet.getWalletOverview, {
      userId: auth.userId,
    });

    return NextResponse.json({
      status: "completed",
      overview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify deposit.",
      },
      { status: 500 }
    );
  }
}
