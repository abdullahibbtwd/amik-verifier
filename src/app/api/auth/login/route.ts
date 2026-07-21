import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { loginServerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginServerSchema.parse(body);
    const client = getConvexHttpClient();
    const refreshToken = createRefreshToken();
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined;

    const result = await client.action(api.auth.login.authenticate, {
      email: data.email,
      password: data.password,
      refreshToken,
      device: userAgent,
      ip,
    });

    if (!result.ok) {
      if (result.reason === "email_not_verified") {
        return NextResponse.json(
          { error: "Please verify your email before signing in." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const accessToken = await signAccessToken({
      sub: result.user.id,
      role: result.user.role,
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
