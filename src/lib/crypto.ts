// crypto.ts - Browser-side only encryption utilities using Web Crypto API

// Helper to convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive a 256-bit AES-GCM CryptoKey from a passphrase using PBKDF2.
 * @param passphrase The user's master passphrase
 * @param salt A random salt (should be stored alongside the encrypted data or index)
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // Do not allow key extraction
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  iv: string; // Base64
  ciphertext: string; // Base64
}

/**
 * Encrypt a string (e.g. JSON data) using AES-GCM.
 * @param key The derived AES-GCM CryptoKey
 * @param data The plaintext string to encrypt
 */
export async function encryptData(key: CryptoKey, data: string): Promise<EncryptedPayload> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(data);

  const ciphertextBuf = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuf),
  };
}

/**
 * Decrypt an EncryptedPayload back to a string.
 * @param key The derived AES-GCM CryptoKey
 * @param payload The encrypted payload containing IV and ciphertext in Base64
 */
export async function decryptData(key: CryptoKey, payload: EncryptedPayload): Promise<string> {
  const ivBuf = base64ToArrayBuffer(payload.iv);
  const ciphertextBuf = base64ToArrayBuffer(payload.ciphertext);

  const decryptedBuf = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuf,
    },
    key,
    ciphertextBuf
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuf);
}

/**
 * Encrypt an ArrayBuffer (e.g. file content) using AES-GCM.
 */
export async function encryptBuffer(key: CryptoKey, data: ArrayBuffer): Promise<EncryptedPayload> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuf = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuf),
  };
}

/**
 * Decrypt an EncryptedPayload back to an ArrayBuffer.
 */
export async function decryptBuffer(key: CryptoKey, payload: EncryptedPayload): Promise<ArrayBuffer> {
  const ivBuf = base64ToArrayBuffer(payload.iv);
  const ciphertextBuf = base64ToArrayBuffer(payload.ciphertext);

  return window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuf,
    },
    key,
    ciphertextBuf
  );
}

