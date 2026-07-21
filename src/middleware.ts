import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const protectedPrefixes = [
  "/dashboard",
  "/wallet",
  "/lookup",
  "/history",
  "/documents",
  "/settings",
];

const authRoutes = ["/sign-in", "/sign-up", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  let isAuthenticated = false;

  if (accessToken) {
    try {
      await verifyAccessToken(accessToken);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/lookup/:path*",
    "/history/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
    "/verify-email",
  ],
};
