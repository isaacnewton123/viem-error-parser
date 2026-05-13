# TypeScript

Everything is typed with strict TypeScript. This page documents the patterns
that are specific to `viem-error-parser`.

## Branded types

Three branded types prevent accidental mixing of raw strings and on-chain
values:

```ts
type HexString      = `0x${string}` & { readonly __brand: 'HexString' };
type Selector       = HexString    & { readonly __selector: 'Selector' };
type ErrorSignature = string       & { readonly __signature: 'ErrorSignature' };
```

A plain string literal is **not** assignable to any of them. Use the
type guards / asserters from `viem-error-parser` to construct them safely:

```ts
import { isHex, assertHex, isSelectorShape, extractSelector } from 'viem-error-parser';

const raw: unknown = '0xdeadbeef';

if (isHex(raw)) {
  // raw is HexString here
}

const hex = assertHex(raw);     // throws TypeError on invalid input

if (isSelectorShape(hex)) {
  // hex is Selector here (10 chars, "0x" + 8 hex)
}

const selector = extractSelector(hex); // Selector | null
```

The branded types are compatible with viem's `Hex` for assignment in either
direction (they share the underlying `0x${string}` shape).

## The type-only entry

The `./types` subpath ships **only** type declarations. Importing it via
`import type` has zero runtime cost:

```ts
import type {
  ParseResult,
  DecodedError,
  UnknownError,
  AbiEntry,
  RevertData,
  HexString,
  Selector,
} from 'viem-error-parser/types';
```

Bundlers drop the import entirely. Use this when you want types without
pulling any runtime code into a module — for example, in a shared types
package consumed by both your client and server.

## `import type` everywhere

All public APIs are `readonly` where it makes sense; mutating a returned
object is a type error. Prefer `import type { ... }` over `import { ... }`
for things you only use as types — the linter will warn if a value import
is type-only.
