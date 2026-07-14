import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Derive a 32-byte key from NEXTAUTH_SECRET
const getSecretKey = (): Buffer => {
  const secret = process.env.NEXTAUTH_SECRET || "default_secret_key_at_least_32_bytes_long";
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypts plain text using AES-256-CBC.
 * Returns the IV and Ciphertext joined by a colon.
 */
export function encryptServerSide(text: string): string {
  const key = getSecretKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts the encrypted payload.
 */
export function decryptServerSide(encryptedText: string): string {
  try {
    const key = getSecretKey();
    const [ivHex, ciphertextHex] = encryptedText.split(":");
    if (!ivHex || !ciphertextHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("[serverCrypto] Decryption failed:", error);
    return "";
  }
}
