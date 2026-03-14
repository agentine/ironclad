import type { AesMode, AesOptions, EncryptedData } from "./types.js";
import { getSubtle, getRandomValues } from "./platform/detect.js";
import { deriveKey } from "./pbkdf2.js";
import { toBase64, fromBase64 } from "./encoding/base64.js";

const encoder = new TextEncoder();

function toBytes(input: string | Uint8Array): Uint8Array {
  return typeof input === "string" ? encoder.encode(input) : input;
}

const IV_LENGTH_GCM = 12;
const IV_LENGTH_CBC = 16;
const IV_LENGTH_CTR = 16;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 600_000;

function ivLength(mode: AesMode): number {
  if (mode === "GCM") return IV_LENGTH_GCM;
  return mode === "CBC" ? IV_LENGTH_CBC : IV_LENGTH_CTR;
}

function algName(mode: AesMode): string {
  return `AES-${mode}`;
}

async function importKey(
  keyBytes: Uint8Array,
  mode: AesMode,
  usage: KeyUsage[],
): Promise<CryptoKey> {
  const subtle = getSubtle();
  return subtle.importKey(
    "raw",
    keyBytes as unknown as ArrayBuffer,
    { name: algName(mode) },
    false,
    usage,
  );
}

async function resolveKey(
  key: string | Uint8Array,
  keySize: number,
): Promise<{ keyBytes: Uint8Array; salt: Uint8Array | null }> {
  if (typeof key !== "string") {
    return { keyBytes: key, salt: null };
  }
  // String password → derive with PBKDF2
  const salt = new Uint8Array(SALT_LENGTH);
  getRandomValues(salt);
  const keyBytes = await deriveKey(key, salt, PBKDF2_ITERATIONS, keySize / 8);
  return { keyBytes, salt };
}

async function resolveKeyForDecrypt(
  key: string | Uint8Array,
  salt: Uint8Array | null,
  keySize: number,
): Promise<Uint8Array> {
  if (typeof key !== "string") return key;
  if (!salt) throw new Error("Cannot decrypt string-keyed ciphertext without salt");
  return deriveKey(key, salt, PBKDF2_ITERATIONS, keySize / 8);
}

/**
 * Encrypt data with AES.
 * Default: AES-256-GCM with random IV and authenticated encryption.
 * String keys are auto-derived with PBKDF2.
 */
export async function encrypt(
  data: string | Uint8Array,
  key: string | Uint8Array,
  options?: AesOptions,
): Promise<EncryptedData> {
  const mode: AesMode = options?.mode ?? "GCM";
  const keySize = options?.keySize ?? 256;
  const subtle = getSubtle();

  const plaintext = toBytes(data);
  const { keyBytes, salt } = await resolveKey(key, keySize);
  const iv = new Uint8Array(ivLength(mode));
  getRandomValues(iv);

  const cryptoKey = await importKey(keyBytes, mode, ["encrypt"]);

  let params: AesGcmParams | AesCbcParams | AesCtrParams;
  if (mode === "GCM") {
    params = { name: "AES-GCM", iv: iv as unknown as ArrayBuffer };
  } else if (mode === "CBC") {
    params = { name: "AES-CBC", iv: iv as unknown as ArrayBuffer };
  } else {
    params = {
      name: "AES-CTR",
      counter: iv as unknown as ArrayBuffer,
      length: 64,
    };
  }

  const encrypted = await subtle.encrypt(
    params,
    cryptoKey,
    plaintext as unknown as ArrayBuffer,
  );

  const encryptedBytes = new Uint8Array(encrypted);

  if (mode === "GCM") {
    // GCM appends 16-byte auth tag to ciphertext
    const ciphertext = encryptedBytes.slice(0, -16);
    const tag = encryptedBytes.slice(-16);
    return { ciphertext, iv: salt ? concat(salt, iv) : iv, tag, mode };
  }

  return {
    ciphertext: encryptedBytes,
    iv: salt ? concat(salt, iv) : iv,
    mode,
  };
}

/**
 * Decrypt AES-encrypted data.
 */
export async function decrypt(
  encrypted: EncryptedData,
  key: string | Uint8Array,
  options?: AesOptions,
): Promise<Uint8Array> {
  const mode = encrypted.mode;
  const keySize = options?.keySize ?? 256;
  const subtle = getSubtle();

  let iv: Uint8Array;
  let salt: Uint8Array | null = null;

  if (typeof key === "string") {
    // Extract salt from IV prefix
    const expectedIvLen = ivLength(mode);
    salt = encrypted.iv.slice(0, SALT_LENGTH);
    iv = encrypted.iv.slice(SALT_LENGTH, SALT_LENGTH + expectedIvLen);
  } else {
    iv = encrypted.iv;
  }

  const keyBytes = await resolveKeyForDecrypt(key, salt, keySize);
  const cryptoKey = await importKey(keyBytes, mode, ["decrypt"]);

  let params: AesGcmParams | AesCbcParams | AesCtrParams;
  if (mode === "GCM") {
    params = { name: "AES-GCM", iv: iv as unknown as ArrayBuffer };
  } else if (mode === "CBC") {
    params = { name: "AES-CBC", iv: iv as unknown as ArrayBuffer };
  } else {
    params = {
      name: "AES-CTR",
      counter: iv as unknown as ArrayBuffer,
      length: 64,
    };
  }

  // For GCM, append tag back to ciphertext (Web Crypto expects it appended)
  let ciphertext = encrypted.ciphertext;
  if (mode === "GCM" && encrypted.tag) {
    ciphertext = concat(encrypted.ciphertext, encrypted.tag);
  }

  const decrypted = await subtle.decrypt(
    params,
    cryptoKey,
    ciphertext as unknown as ArrayBuffer,
  );

  return new Uint8Array(decrypted);
}

/** Serialize EncryptedData to a portable string: mode:iv:ciphertext[:tag] (all base64) */
export function serialize(data: EncryptedData): string {
  const parts = [data.mode, toBase64(data.iv), toBase64(data.ciphertext)];
  if (data.tag) parts.push(toBase64(data.tag));
  return parts.join(":");
}

/** Deserialize a portable string back to EncryptedData */
export function deserialize(str: string): EncryptedData {
  const parts = str.split(":");
  if (parts.length < 3 || parts.length > 4) {
    throw new Error("Invalid encrypted data string");
  }
  const mode = parts[0] as AesMode;
  const iv = fromBase64(parts[1]!);
  const ciphertext = fromBase64(parts[2]!);
  const tag = parts[3] ? fromBase64(parts[3]) : undefined;
  return { ciphertext, iv, tag, mode };
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}