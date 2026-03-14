# ironclad — Modern Isomorphic JavaScript Crypto Library

**Replaces:** crypto-js (12M weekly downloads, officially discontinued, known vulnerabilities)
**Package name:** @agentine/ironclad (verified available on npm)
**Language:** TypeScript
**License:** MIT

## Problem

crypto-js is one of the most widely used cryptography libraries in the JavaScript ecosystem with 12M weekly npm downloads, 16.4K GitHub stars, and 35,807 dependents. The project has been officially discontinued — the README states: "Active development of CryptoJS has been discontinued. This library is no longer maintained." It has 257 open issues and 18 unresolved PRs.

crypto-js has known vulnerabilities (CVE-2023-46233: PBKDF2 defaults 1,300,000x weaker than industry standard). The codebase implements cryptographic algorithms in pure JavaScript rather than using platform-native implementations, which is both slower and less secure.

The only fork, `crypto-es`, is a direct ES module port of the same pure-JS code with the same architectural problems. It has only 104K weekly downloads — less than 1% of crypto-js's user base. Other alternatives (Web Crypto API, noble-*, libsodium.js) are lower-level and don't provide a simple high-level API.

## Scope

A modern, TypeScript-first cryptographic library that wraps Web Crypto API (browser) and Node.js native `crypto` module, providing a simple high-level API compatible with both environments. Unlike crypto-js's pure-JS implementations, ironclad delegates all cryptographic operations to platform-native implementations for security and performance.

### Core Deliverables

1. **Hashing** — SHA-1, SHA-256, SHA-384, SHA-512, MD5 (legacy, with deprecation warning). Sync-style API wrapping async Web Crypto where needed.

2. **HMAC** — HMAC-SHA256, HMAC-SHA384, HMAC-SHA512. Key-based message authentication.

3. **AES Encryption** — AES-CBC, AES-CTR, AES-GCM (recommended default). Encrypt/decrypt with string or buffer inputs. Sensible defaults (AES-256-GCM, random IV, authenticated encryption).

4. **Key Derivation** — PBKDF2 with secure defaults (SHA-256, 600,000 iterations per OWASP 2023 guidelines). HKDF for key expansion.

5. **Encoding** — Base64, Hex, UTF-8 encoding/decoding. WordArray-compatible interface for migration from crypto-js.

6. **Random** — Cryptographically secure random bytes generation.

7. **Password Hashing** — Simple password hash/verify API using PBKDF2 with secure defaults.

### Non-Goals (v1)

- RSA/EC asymmetric encryption (use Web Crypto directly or dedicated libraries)
- Certificate handling / TLS
- Streaming encryption (stretch goal)
- DES/3DES/RC4 (insecure, no modern use case)
- SHA-3 (low adoption, add in v2 if demand exists)
- Custom algorithm implementations (always delegate to platform)

## Architecture

```
ironclad/
  src/
    index.ts            # Public API exports
    hash.ts             # SHA-*, MD5 hashing
    hmac.ts             # HMAC operations
    aes.ts              # AES encrypt/decrypt (CBC, CTR, GCM)
    pbkdf2.ts           # PBKDF2 key derivation
    hkdf.ts             # HKDF key expansion
    random.ts           # Secure random generation
    password.ts         # High-level password hash/verify
    encoding/
      base64.ts         # Base64 encode/decode
      hex.ts            # Hex encode/decode
      utf8.ts           # UTF-8 encode/decode
      wordarray.ts      # WordArray compat type for migration
    platform/
      node.ts           # Node.js crypto bindings
      browser.ts        # Web Crypto API bindings
      detect.ts         # Runtime environment detection
    types.ts            # Shared types and interfaces
  test/
    hash.test.ts
    hmac.test.ts
    aes.test.ts
    pbkdf2.test.ts
    encoding.test.ts
    compat.test.ts      # crypto-js compatibility tests
    browser.test.ts     # Browser environment tests
```

### Key Design Decisions

- **Platform-native crypto** — All cryptographic operations delegate to Web Crypto API (browser) or Node.js `crypto` module. Zero custom crypto implementations. This is the fundamental architectural difference from crypto-js.
- **TypeScript-first** — Full type safety, exported types, strict mode.
- **Isomorphic** — Single API works in Node.js (18+), modern browsers, Deno, Bun, and Cloudflare Workers. Runtime detection selects the appropriate platform backend.
- **Secure defaults** — AES-256-GCM as default cipher, PBKDF2 with 600K iterations, automatic random IV generation. Make the safe choice the easy choice.
- **Async-native** — Core API is async (returns Promises) since Web Crypto API is async. Provide sync wrappers for Node.js-only usage.
- **Tree-shakeable** — ESM with named exports. Import only what you need.
- **Zero dependencies** — No runtime dependencies. Platform crypto only.
- **Small bundle** — Target <5KB minified+gzipped (thin wrapper, no crypto implementation code).

## Migration Path

Users migrating from crypto-js should find the API familiar but modernized:

```typescript
// crypto-js
import CryptoJS from 'crypto-js';
const hash = CryptoJS.SHA256('message').toString();
const encrypted = CryptoJS.AES.encrypt('data', 'secret').toString();

// ironclad (async, secure defaults)
import { sha256, aes } from '@agentine/ironclad';
const hash = await sha256('message');
const encrypted = await aes.encrypt('data', 'secret');
```

A migration guide will document the differences and provide a compatibility layer for the most common crypto-js patterns.

## Testing Strategy

- Unit tests for every algorithm with NIST test vectors
- Cross-platform tests: Node.js + browser (via Playwright or happy-dom)
- crypto-js compatibility tests: verify output matches for common operations
- NIST CAVP test vectors for AES, SHA, HMAC
- Security-focused tests: verify secure defaults, reject weak parameters
- Bundle size tracking in CI
