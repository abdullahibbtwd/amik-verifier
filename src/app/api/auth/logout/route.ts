import { NextResponse } from "next/server";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (refreshToken) {
      const client = getConvexHttpClient();
      await client.action(api.auth.login.logout, { refreshToken });
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
