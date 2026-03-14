// Types
export type {
  HashAlgorithm,
  HmacAlgorithm,
  AesMode,
  AesKeySize,
  AesOptions,
  EncryptedData,
  WordArray,
} from "./types.js";

// Hashing
export { sha256, sha384, sha512, sha1, md5, digest } from "./hash.js";

// HMAC
export {
  hmac,
  hmacSha256,
  hmacSha384,
  hmacSha512,
  verify as hmacVerify,
} from "./hmac.js";

// AES — namespaced to avoid collisions
import * as _aes from "./aes.js";
export const aes = {
  encrypt: _aes.encrypt,
  decrypt: _aes.decrypt,
  serialize: _aes.serialize,
  deserialize: _aes.deserialize,
};

// Key derivation
export { deriveKey as pbkdf2, defaultDeriveKey as pbkdf2Default } from "./pbkdf2.js";
export { expand as hkdf } from "./hkdf.js";

// Encoding
export { toHex, fromHex, isHex } from "./encoding/hex.js";
export { toBase64, fromBase64, toBase64Url, fromBase64Url } from "./encoding/base64.js";
export { toUtf8Bytes, fromUtf8Bytes } from "./encoding/utf8.js";
export { wordsToBytes, bytesToWords, toString as wordArrayToString } from "./encoding/wordarray.js";

// Random
export { randomBytes, randomHex, randomBase64 } from "./random.js";

// Password
import * as _password from "./password.js";
export const password = {
  hash: _password.hash,
  verify: _password.verify,
};

// Platform detection
export { isNode, isBrowser, isDeno, isBun, isCloudflareWorker } from "./platform/detect.js";