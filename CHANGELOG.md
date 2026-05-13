# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-13

### Added

- Modular source layout: `utils/`, `core/`, `presets/`, `integrations/`, with `types.ts` and entry barrels at the package root.
- Branded types `HexString`, `Selector`, `ErrorSignature` for type-safe domain values.
- `extractSelector`, `extractArgs`, `isHex`, `assertHex`, `sliceHex`, `hexLength`, `toLowerHex` utilities.
- `extractRevertData(error)` walking common Viem/Wagmi error shapes (data, rawData, returnData, cause chains, embedded hex in messages).
- `traverseErrorCause` with cycle detection and depth cap (16).
- `findMatchingAbi` helper for pure ABI lookup.
- `AbiRegistry` with `add`, `addMany`, `findError`, `has`, `getAllSelectors`, `getEntries`.
- `createAbiEntry(name, abi)` helper that pre-computes selector maps (handles tuples + tuple arrays).
- `ErrorDecoder` with `decode` / `decodeSync`. Pipeline: cause traversal → revert extraction → standard `Error(string)` / `Panic(uint256)` decoding → registry-based ABI decoding → classifier fallback → `UnknownError`.
- `classifyError` covering user rejection, insufficient funds, nonce issues, replacement underpriced, gas issues, rate limiting, method not supported, timeouts, network errors, chain mismatch, EIP-1193 codes 4001 and -32005.
- `commonAbiEntries()` curated set: ERC20, ERC721, ERC1155, OpenZeppelin Ownable / AccessControl, ERC-2612.
- `forViem(options)` and `forWagmi(options)` factories.
- `useErrorParser(options)` React hook (exported via `viem-error-parser/react`).
- Subpath exports `.`, `/react`, `/wagmi`, `/types`.
- Tree-shakable build (ESM + CJS + `.d.ts`) via `tsup`.
- Vitest test suite (69 tests) with v8 coverage; ≥90% lines on `utils/` and `core/`.
- ESLint type-checked rules including `no-explicit-any`, `no-unsafe-*` as errors.
- GitHub Actions: CI matrix (Node 18/20/22 with pnpm), CodeQL, npm publish-on-tag with provenance.

[Unreleased]: https://github.com/isaacnewton123/viem-error-parser/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/isaacnewton123/viem-error-parser/releases/tag/v0.1.0
