import { NextResponse } from "next/server";
import type { Id } from "../../../convex/_generated/dataModel";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";
import {
  createRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "@/lib/auth/jwt";

export async function getAuthenticatedUserId(request: Request) {
  const client = getConvexHttpClient();
  let userId: string | null = null;

  const accessToken = await getAccessTokenFromCookies();
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      userId = null;
    }
  }

  if (!userId) {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return null;
    }

    const newRefreshToken = createRefreshToken();
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined;

    const result = await client.action(api.auth.login.refreshSession, {
      refreshToken,
      newRefreshToken,
      device: userAgent,
      ip,
    });

    if (!result.ok) {
      return null;
    }

    const nextAccessToken = await signAccessToken({
      sub: result.user.id,
      role: result.user.role,
    });
    await setAuthCookies(nextAccessToken, newRefreshToken);
    userId = result.user.id;
  }

  return userId as Id<"users">;
}

export async function requireAuthenticatedUserId(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId, response: null };
}
