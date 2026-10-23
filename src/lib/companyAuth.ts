import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "legacybridge-company-portal-secret-key-salt";

export interface CompanySessionPayload {
  couponId: string;
  username: string;
  exp: number;
}

/**
 * Creates an HMAC-signed token for company portal sessions (valid for 7 days)
 */
export function createCompanyToken(couponId: string, username: string): string {
  const payload: CompanySessionPayload = {
    couponId,
    username: username.toLowerCase().trim(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies an HMAC-signed token and returns the payload if valid and not expired
 */
export function verifyCompanyToken(token: string | undefined | null): CompanySessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as CompanySessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
