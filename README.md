# viem-error-parser

> Decode Viem and Wagmi errors into clean, human-readable messages — including custom `revert` reasons from your own ABIs.

[![CI](https://github.com/isaacnewton123/viem-error-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/isaacnewton123/viem-error-parser/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/viem-error-parser.svg)](https://www.npmjs.com/package/viem-error-parser)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/viem-error-parser?label=gzip)](https://bundlephobia.com/package/viem-error-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/types-included-blue)](./docs/typescript.md)

## Why

Viem and Wagmi throw deeply-nested error chains. Pulling a useful message out of one — and decoding custom `revert MyError(uint256)` payloads on top of `Error(string)` and `Panic(uint256)` — is verbose and easy to get wrong.

`viem-error-parser` does the boring part:

- Walks the `cause` chain (and `errors[]`) safely with cycle and depth guards.
- Extracts revert data from every common shape: `data`, `rawData`, `returnData`, `output`, or hex embedded in messages.
- Decodes the two standard Solidity revert types out of the box.
- Decodes **your** custom errors when you register your ABIs.
- Classifies non-revert problems too — user rejection, gas, network, RPC, EIP-1193 codes, and more.
- Ships ESM + CJS + types, **tree-shakable**, with a `react` subpath for a `useErrorParser` hook.

It is a thin (~22 KB ESM) layer on top of `viem`. The only runtime dependency is `viem` itself.

## Install

```bash
pnpm add viem-error-parser viem
```

## 30-second example

```ts
import { forViem } from 'viem-error-parser';

const decoder = forViem();

try {
  await walletClient.writeContract({ /* ... */ });
} catch (error) {
  console.error(decoder.decode(error).message);
  // "ERC20InsufficientBalance(sender=0x..., balance=5n, needed=100n)"
  // or "The transaction was rejected by the user."
}
```

## Documentation

The full docs live in [`./docs`](./docs):

- [**Getting started**](./docs/getting-started.md) — install, Viem / Wagmi / React quick-starts.
- [**Registering custom ABIs**](./docs/custom-abis.md) — decode your contract's revert errors.
- [**The result shape**](./docs/result-shape.md) — `ParseResult` discriminated union and type guards.
- [**The classifier**](./docs/classifier.md) — non-revert errors, full rule table, decoder pipeline.
- [**Advanced usage**](./docs/advanced.md) — `AbiRegistry` / `ErrorDecoder` by hand.
- [**TypeScript**](./docs/typescript.md) — branded types and the zero-runtime `./types` entry.
- [**Bundle size**](./docs/bundle-size.md) — what tree-shaking actually removes.
- [**API reference**](./docs/API.md) — every public export.

A copy of the docs is also published as the [GitHub Wiki](https://github.com/isaacnewton123/viem-error-parser/wiki).

## Examples

Three runnable examples live under [`./examples`](./examples):

- [`examples/basic`](./examples/basic) — Node script using `forViem`.
- [`examples/nextjs`](./examples/nextjs) — Next.js App Router page with `useErrorParser`.
- [`examples/vite-react`](./examples/vite-react) — Vite + React with `forWagmi`.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). All contributors follow the
[Code of Conduct](./CODE_OF_CONDUCT.md). Security issues should be reported per
[`SECURITY.md`](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Hanif Maulana (Isaac Newton)

## Creator

**Hanif Maulana (Isaac Newton)**

- Website: [hanifmaulana-portfolio.vercel.app](https://hanifmaulana-portfolio.vercel.app/)
- GitHub: [github.com/isaacnewton123](https://github.com/isaacnewton123)
- X: [x.com/isaac_newton252](https://x.com/isaac_newton252)
- Facebook: [facebook.com/hanif.maulana.108](https://www.facebook.com/hanif.maulana.108/)
- LinkedIn: [linkedin.com/in/hanif-maulana-210b4721b](https://www.linkedin.com/in/hanif-maulana-210b4721b/)
- Instagram: [instagram.com/hanifmaulana2](https://www.instagram.com/hanifmaulana2/)

## Support

If this library saves you from Viem/Wagmi error chaos, consider supporting development:

- Ko-fi: [ko-fi.com/isaacnewton1](https://ko-fi.com/isaacnewton1)
- Trakteer: [trakteer.id/isaacnewton1/link](https://trakteer.id/isaacnewton1/link)
- GitHub: [github.com/sponsors/isaacnewton123](https://github.com/sponsors/isaacnewton123)
