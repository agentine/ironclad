/** Supported hash algorithms */
export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

/** Supported HMAC algorithms */
export type HmacAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";

/** AES cipher modes */
export type AesMode = "GCM" | "CBC" | "CTR";

/** AES key sizes in bits */
export type AesKeySize = 128 | 192 | 256;

/** Options for AES encryption */
export interface AesOptions {
  mode?: AesMode;
  keySize?: AesKeySize;
}

/** Result of AES encryption */
export interface EncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag?: Uint8Array;
  mode: AesMode;
}

/** crypto-js compatible WordArray */
export interface WordArray {
  words: number[];
  sigBytes: number;
}