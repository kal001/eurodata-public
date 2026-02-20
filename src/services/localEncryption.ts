/**
 * Passphrase-based encryption for local IndexedDB (same idea as cloud TRANSACTION_ENCRYPTION_KEY).
 * Uses Web Crypto: PBKDF2-SHA256 to derive a key, AES-GCM for encrypt/decrypt.
 * Never stores the passphrase; only a salt and a verification cipher are stored in DB.
 */

const PBKDF2_ITERATIONS = 210000;
const AES_KEY_LENGTH = 256;
const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 128;

/** Derive an AES-GCM key from passphrase and salt. extractable: true so we can persist it to localStorage for unlock across refresh. */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true, // extractable: must be true to export key for localStorage persistence
    ["encrypt", "decrypt"]
  );
}

/** Encrypt plaintext (UTF-8 string). Returns base64(iv || ciphertext || tag). */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: GCM_TAG_LENGTH },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt a value produced by encrypt(). */
export async function decrypt(cipherBase64: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, GCM_IV_LENGTH);
  const cipher = combined.slice(GCM_IV_LENGTH);
  const dec = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: GCM_TAG_LENGTH },
    key,
    cipher
  );
  return new TextDecoder().decode(dec);
}

/** Generate a random salt (for first-time setup). */
export function randomSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/** Encode bytes to base64. */
export function encodeBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/** Decode base64 to bytes. */
export function decodeBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

const MAGIC = "eurodata_local_v1";

/** Create verification cipher (encrypt a known string) to check passphrase on unlock. */
export async function createCheck(key: CryptoKey): Promise<string> {
  return encrypt(MAGIC, key);
}

/** Verify passphrase by decrypting the check value. */
export async function verifyCheck(cipherBase64: string, key: CryptoKey): Promise<boolean> {
  try {
    const plain = await decrypt(cipherBase64, key);
    return plain === MAGIC;
  } catch {
    return false;
  }
}

/** Export AES key to base64 for session persistence (same tab only). */
export async function exportKeyRaw(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/** Import AES key from base64 (from session). */
export async function importKeyRaw(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: AES_KEY_LENGTH }, false, ["encrypt", "decrypt"]);
}
