import { SignJWT, jwtVerify } from "jose";
const ACCESS_TOKEN_MINUTES = 15;

const accessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
};

export type AccessTokenPayload = {
  sub: string;
  role: "USER" | "ADMIN";
};

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_MINUTES}m`)
    .sign(accessSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret());
  const sub = payload.sub;
  const role = payload.role;

  if (!sub || typeof sub !== "string") {
    throw new Error("Invalid access token");
  }
  if (role !== "USER" && role !== "ADMIN") {
    throw new Error("Invalid access token role");
  }

  return {
    sub,
    role,
  };
}

export function createRefreshToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
