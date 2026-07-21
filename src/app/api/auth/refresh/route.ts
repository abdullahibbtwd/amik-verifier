import { NextResponse } from "next/server";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import {
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { createRefreshToken, signAccessToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const newRefreshToken = createRefreshToken();
    const client = getConvexHttpClient();
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      sub: result.user.id,
      role: result.user.role,
    });

    await setAuthCookies(accessToken, newRefreshToken);

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json(
      { error: "Unable to refresh session." },
      { status: 500 }
    );
  }
}
