import type { WordArray } from "../types.js";
import { toHex } from "./hex.js";
import { toBase64 } from "./base64.js";

/** Convert a word array to bytes */
export function wordsToBytes(words: number[], sigBytes: number): Uint8Array {
  const bytes = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    bytes[i] = (words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return bytes;
}

/** Convert bytes to a WordArray (crypto-js compatible) */
export function bytesToWords(bytes: Uint8Array): WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    let word = 0;
    for (let j = 0; j < 4 && i + j < bytes.length; j++) {
      word |= bytes[i + j]! << (24 - j * 8);
    }
    words.push(word);
  }
  return { words, sigBytes: bytes.length };
}

/** Convert a WordArray to string using the specified encoding */
export function toString(wa: WordArray, encoding?: "hex" | "base64"): string {
  const bytes = wordsToBytes(wa.words, wa.sigBytes);
  if (encoding === "base64") return toBase64(bytes);
  return toHex(bytes);
}