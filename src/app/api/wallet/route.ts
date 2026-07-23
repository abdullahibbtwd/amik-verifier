import { NextResponse } from "next/server";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import { requireAuthenticatedUserId } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  try {
    const auth = await requireAuthenticatedUserId(request);
    if (!auth.userId) {
      return auth.response!;
    }

    const client = getConvexHttpClient();
    const overview = await client.query(api.wallet.getWalletOverview, {
      userId: auth.userId,
    });

    return NextResponse.json(overview);
  } catch {
    return NextResponse.json(
      { error: "Unable to load wallet." },
      { status: 500 }
    );
  }
}
