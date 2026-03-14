# ironclad

[![npm](https://img.shields.io/npm/v/@agentine/ironclad)](https://www.npmjs.com/package/@agentine/ironclad)
[![Node](https://img.shields.io/node/v/@agentine/ironclad)](https://www.npmjs.com/package/@agentine/ironclad)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Modern isomorphic TypeScript crypto library replacing crypto-js. Wraps Web Crypto API and Node.js crypto for security and performance — zero custom crypto implementations.

## Why ironclad?

[crypto-js](https://github.com/brix/crypto-js) was the de facto browser crypto library, but it implements cryptographic algorithms in pure JavaScript — a significant security risk compared to platform-native implementations. It is also effectively unmaintained, with no releases since 2023.

ironclad is a clean replacement:

| | crypto-js | ironclad |
|---|---|---|
| Implementation | Pure JavaScript | **Platform crypto (Web Crypto API)** |
| Async API | No (sync) | **Yes (Promise-based)** |
| TypeScript | No (types via `@types`) | **First-class TypeScript** |
| Isomorphic | Partial | **Node.js, Browser, Deno, Bun, Workers** |
| Security | Pure-JS (not constant-time) | **FIPS-validated, constant-time, hardware-accelerated** |
| Maintained | No (abandoned 2023) | **Yes** |

## Install

```bash
npm install @agentine/ironclad
```

## Quick Start

```typescript
import { sha256, aes, password } from '@agentine/ironclad';

// Hashing
const hash = await sha256('hello world');

// AES encryption (defaults to AES-256-GCM)
const encrypted = await aes.encrypt('secret data', 'my-password');
const decrypted = await aes.decrypt(encrypted, 'my-password');

// Password hashing (PBKDF2, 600K iterations)
const hashed = await password.hash('user-password');
const valid = await password.verify('user-password', hashed);
```

## API Reference

### Hashing

```typescript
sha256(input: string | Uint8Array): Promise<string>  // hex output
sha384(input: string | Uint8Array): Promise<string>
sha512(input: string | Uint8Array): Promise<string>
sha1(input: string | Uint8Array): Promise<string>    // legacy
md5(input: string | Uint8Array): Promise<string>      // legacy
digest(algorithm: HashAlgorithm, input): Promise<string>
```

### HMAC

```typescript
hmac(algorithm: HmacAlgorithm, key, data): Promise<string>
hmacSha256(key, data): Promise<string>
hmacSha384(key, data): Promise<string>
hmacSha512(key, data): Promise<string>
hmacVerify(algorithm, key, data, expectedHex): Promise<boolean>
```

### AES Encryption

```typescript
aes.encrypt(data, key, options?): Promise<EncryptedData>
aes.decrypt(encrypted, key, options?): Promise<Uint8Array>
aes.serialize(data: EncryptedData): string
aes.deserialize(str: string): EncryptedData
```

Default: AES-256-GCM with random IV. String keys auto-derive via PBKDF2.

Options: `{ mode?: 'GCM' | 'CBC' | 'CTR', keySize?: 128 | 192 | 256 }`

### Key Derivation

```typescript
pbkdf2(password, salt, iterations, keyLength, hash?): Promise<Uint8Array>
pbkdf2Default(password, salt): Promise<Uint8Array>  // SHA-256, 600K iter, 32 bytes
hkdf(ikm, length, info?, salt?, hash?): Promise<Uint8Array>
```

### Password Hashing

```typescript
password.hash(password: string): Promise<string>
password.verify(password: string, hash: string): Promise<boolean>
```

Format: `ironclad:v1:iterations:base64(salt):base64(hash)`

### Encoding

```typescript
toHex(bytes) / fromHex(hex) / isHex(str)
toBase64(bytes) / fromBase64(b64)
toBase64Url(bytes) / fromBase64Url(b64url)
toUtf8Bytes(str) / fromUtf8Bytes(bytes)
bytesToWords(bytes) / wordsToBytes(words, sigBytes)
```

### Random

```typescript
randomBytes(length: number): Uint8Array
randomHex(length: number): string
randomBase64(length: number): string
```

### Platform Detection

```typescript
isNode(): boolean             // true in Node.js
isBrowser(): boolean          // true in browser environments
isDeno(): boolean             // true in Deno
isBun(): boolean              // true in Bun
isCloudflareWorker(): boolean // true in Cloudflare Workers
```

### WordArray (crypto-js compatibility)

```typescript
bytesToWords(bytes: Uint8Array): WordArray
wordsToBytes(words: number[], sigBytes: number): Uint8Array
wordArrayToString(wa: WordArray): string  // hex string
```

These helpers allow interop with crypto-js `WordArray` objects during migration.

## Migrating from crypto-js

```typescript
// Before (crypto-js)
import CryptoJS from 'crypto-js';
const hash = CryptoJS.SHA256('message').toString();
const hmac = CryptoJS.HmacSHA256('message', 'key').toString();
const encrypted = CryptoJS.AES.encrypt('data', 'secret').toString();

// After (ironclad)
import { sha256, hmacSha256, aes } from '@agentine/ironclad';
const hash = await sha256('message');
const hmac = await hmacSha256('key', 'message');
const encrypted = await aes.encrypt('data', 'secret');
```

Key differences:
- **Async API** — All operations return Promises (Web Crypto is async)
- **Secure defaults** — AES-256-GCM, PBKDF2 with 600K iterations
- **Platform crypto** — Delegates to Web Crypto / Node.js crypto, not pure JS
- **HMAC argument order** — `hmacSha256(key, data)` not `HmacSHA256(data, key)`

## Security

ironclad delegates all cryptographic operations to platform-native implementations:
- **Node.js**: `crypto.subtle` (Web Crypto) and `crypto.createHash` (MD5 only)
- **Browser**: Web Crypto API (`crypto.subtle`)
- **Deno/Bun/Workers**: Web Crypto API

This is fundamentally more secure than crypto-js, which implements algorithms in pure JavaScript. Platform implementations are FIPS-validated, constant-time, and hardware-accelerated where available.

## License

MIT