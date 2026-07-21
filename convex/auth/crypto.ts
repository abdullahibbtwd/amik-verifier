const PBKDF2_ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateOtp(length = 6): string {
  const max = 10 ** length;
  const value = Math.floor(Math.random() * max)
    .toString()
    .padStart(length, "0");
  return value;
}

export function generateToken(bytes = 32): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: asBufferSource(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hash = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt, 0);
  combined.set(hash, salt.length);
  return bytesToBase64(combined);
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const combined = base64ToBytes(storedHash);
  const salt = combined.slice(0, 16);
  const expectedHash = combined.slice(16);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: asBufferSource(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const actualHash = new Uint8Array(derivedBits);
  if (actualHash.length !== expectedHash.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < actualHash.length; index += 1) {
    mismatch |= actualHash[index]! ^ expectedHash[index]!;
  }
  return mismatch === 0;
}

export async function hashCode(code: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(code)
  );
  return bytesToHex(new Uint8Array(digest));
}

export async function verifyCode(code: string, codeHash: string): Promise<boolean> {
  const actual = await hashCode(code);
  if (actual.length !== codeHash.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) {
    mismatch |= actual.charCodeAt(index) ^ codeHash.charCodeAt(index);
  }
  return mismatch === 0;
}

function asBufferSource(bytes: Uint8Array): BufferSource {
  return Uint8Array.from(bytes);
}

async function getOtpEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.OTP_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("OTP_ENCRYPTION_KEY is not configured");
  }
  const raw = base64ToBytes(secret);
  return crypto.subtle.importKey("raw", asBufferSource(raw), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptCode(code: string): Promise<string> {
  const key = await getOtpEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    new TextEncoder().encode(code)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64(combined);
}

export async function decryptCode(encrypted: string): Promise<string> {
  const key = await getOtpEncryptionKey();
  const combined = base64ToBytes(encrypted);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(ciphertext)
  );
  return new TextDecoder().decode(plaintext);
}

export async function hashToken(token: string): Promise<string> {
  return hashCode(token);
}
