import * as jose from "jose";

export const ADMIN_COOKIE = "autosell_admin";

function secretKey(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(): Promise<string> {
  return new jose.SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!process.env.ADMIN_JWT_SECRET) return false;
    await jose.jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}
