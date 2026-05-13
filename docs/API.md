# API Reference

Complete reference for every public export in `viem-error-parser`. For an
introduction and tutorials, see the [README](../README.md).

All exports are dual ESM/CJS and ship with `.d.ts` declarations.

## Entry points

| Specifier                         | Module               |
|-----------------------------------|----------------------|
| `viem-error-parser`               | Main API.            |
| `viem-error-parser/wagmi`         | Wagmi convenience.   |
| `viem-error-parser/react`         | React hook.          |
| `viem-error-parser/types`         | Type-only entry.     |

## Types

### `HexString`

```ts
type HexString = `0x${string}` & { readonly __brand: 'HexString' };
```

Branded `0x`-prefixed hex string. Construct via `isHex(value)` (type guard)
or `assertHex(value)` (throws on invalid input). Compatible with viem's `Hex`.

### `Selector`

```ts
type Selector = HexString & { readonly __selector: 'Selector' };
```

4-byte function/error selector — exactly 10 characters (`0x` + 8 hex). Use
`isSelectorShape(x)` or `extractSelector(data)` to build one.

### `ErrorSignature`

```ts
type ErrorSignature = string & { readonly __signature: 'ErrorSignature' };
```

A canonical error signature such as `"InsufficientBalance(uint256,uint256)"`.

### `AbiEntry`

```ts
interface AbiEntry {
  readonly name: string;
  readonly abi: Abi;                    // viem's Abi
  readonly selectors: Map<Selector, { errorName: string }>;
}
```

Build one with `createAbiEntry(name, abi)`.

### `RevertData`

```ts
interface RevertData {
  readonly selector: Selector;
  readonly args: HexString | undefined;  // bytes after the selector
  readonly rawData: HexString;           // full payload including selector
}
```

### `DecodedError`

```ts
interface DecodedError {
  readonly success: true;
  readonly name: string;
  readonly message: string;
  readonly args?: Readonly<Record<string, unknown>>;
  readonly selector: Selector;
  readonly source: string;               // "solidity" or your ABI name
}
```

### `UnknownError`

```ts
interface UnknownError {
  readonly success: false;
  readonly message: string;
  readonly selector: Selector | null;
  readonly rawData: HexString | null;
}
```

### `ParseResult`

```ts
type ParseResult = DecodedError | UnknownError;
```

Use `result.success` as the discriminant.

## `utils/hex`

### `isHex(value: unknown): value is HexString`

Type guard: `true` for `"0x"`-prefixed strings with an even number of hex chars.

### `assertHex(value: unknown): HexString`

Returns the value if `isHex(value)`, otherwise throws `TypeError`.

### `hexLength(hex: HexString): number`

Number of bytes encoded by `hex` (i.e. `(hex.length - 2) / 2`).

### `sliceHex(hex: HexString, startByte: number, endByte?: number): HexString`

Returns the bytes `[startByte, endByte)` of `hex`. Negative starts clamp to
zero; ends past the end clamp to the length.

### `toLowerHex(hex: HexString): HexString`

Returns the hex string with `a–f` letters lowercased; the `0x` prefix is kept.

## `utils/errorSignature`

### `SELECTOR_LENGTH: 10`

Length in characters of a `0x`-prefixed 4-byte selector.

### `isSelectorShape(value: unknown): value is Selector`

Type guard: `true` for `"0x"` + exactly 8 hex characters.

### `extractSelector(data: HexString): Selector | null`

Returns the first 4 bytes of `data`, lowercased, or `null` if the input is
shorter than 4 bytes.

### `extractArgs(data: HexString): HexString | null`

Returns the bytes after the 4-byte selector, or `null` if there are none.

## `core/traverseErrorCause`

### `traverseErrorCause(error, visit)`

```ts
type CauseVisitor = (node: unknown, depth: number) => boolean;

function traverseErrorCause(error: unknown, visit: CauseVisitor): void;
```

Performs a DFS over `error`, its `cause` chain, and any `errors[]` siblings.

- Calls `visit(node, depth)` at every step. Return `false` to stop traversal.
- Cycle-safe via a `WeakSet`.
- Hard-capped at `MAX_CAUSE_DEPTH` (16) to avoid pathological inputs.

### `MAX_CAUSE_DEPTH: 16`

Maximum traversal depth.

## `core/extractRevertData`

### `extractRevertData(error: unknown): RevertData | null`

Walks `error` (and its causes) looking for revert hex in any of these places,
returning the first match:

1. `error.data`, `error.rawData`, `error.returnData`, `error.output`
2. The same fields on a viem `ContractFunctionRevertedError` instance.
3. Hex embedded in `error.message` / `shortMessage` / `details` / `reason`
   (extracts a `0x[0-9a-f]{8,}` substring).

Returns `null` if no revert payload was found.

## `core/findMatchingAbi`

### `findMatchingAbi(selector, entries): AbiMatch | null`

```ts
interface AbiMatch {
  readonly entry: AbiEntry;
  readonly errorName: string;
}
```

Linear scan over `entries`. The first entry whose selector map contains
`selector` wins. Pure function — does not mutate anything.

## `core/abiRegistry`

### `class AbiRegistry`

Indexed collection of `AbiEntry` items.

| Method                                   | Description                                                  |
|------------------------------------------|--------------------------------------------------------------|
| `add(entry: AbiEntry): void`             | Register a single ABI entry.                                 |
| `addMany(entries: readonly AbiEntry[])`  | Register many at once.                                       |
| `findError(selector): AbiRegistryMatch \| null` | Lookup. First-write-wins on duplicate selectors.       |
| `has(selector): boolean`                 | Cheap existence check.                                       |
| `getAllSelectors(): Selector[]`          | Snapshot of every selector in the registry.                  |
| `getEntries(): readonly AbiEntry[]`      | Snapshot of registered entries in insertion order.           |

```ts
interface AbiRegistryMatch {
  readonly errorName: string;
  readonly abiName: string;
}
```

### `buildSelectorMap(abi: Abi): Map<Selector, { errorName: string }>`

Computes the selector map for an ABI. Used internally by `createAbiEntry`.
Handles nested tuples and tuple arrays (e.g. `tuple[]`).

### `createAbiEntry(name: string, abi: Abi): AbiEntry`

Builds an `AbiEntry` with `selectors` pre-computed. **Always prefer this over
constructing `AbiEntry` by hand** — it's stable, memoisable, and faster.

## `core/errorClassifier`

### `classifyError(error: unknown): Classification | null`

```ts
type ErrorKind =
  | 'user_rejected' | 'insufficient_funds' | 'nonce_too_low'
  | 'replacement_underpriced' | 'transaction_underpriced'
  | 'gas_too_low' | 'intrinsic_gas_too_low' | 'estimate_gas_failed'
  | 'rate_limited' | 'method_not_supported' | 'timeout' | 'network'
  | 'chain_mismatch' | 'connection_refused';

interface Classification {
  readonly kind: ErrorKind;
  readonly message: string;
}
```

Walks the error tree and returns the first rule that matches. See the table
in the [README](../README.md#non-revert-errors-classifier) for the full rule
set. Returns `null` if nothing matched.

## `core/decoder`

### `class ErrorDecoder`

The high-level facade that turns an `unknown` thrown value into a
`ParseResult`.

```ts
interface ErrorDecoderOptions {
  readonly registry?: AbiRegistry;       // defaults to an empty registry
  readonly fallbackMessage?: string;     // defaults to "Unknown error."
}

class ErrorDecoder {
  constructor(options?: AbiRegistry | ErrorDecoderOptions);
  decode(error: unknown): ParseResult;
  decodeSync(error: unknown): ParseResult; // alias of decode()
}
```

The pipeline is documented in the [README](../README.md#advanced-building-decoders-by-hand).

## `presets/commonAbis`

### `commonAbiEntries(): AbiEntry[]`

Returns a curated, named set of `AbiEntry` instances. Currently includes:

- `ERC20` — OpenZeppelin v5+ ERC-20 errors.
- `ERC721` — OpenZeppelin v5+ ERC-721 errors.
- `ERC1155` — OpenZeppelin v5+ ERC-1155 errors.
- `OpenZeppelinAccess` — `Ownable*` and `AccessControl*` errors.
- `ERC2612` — Permit / signature errors.

`forViem` / `forWagmi` include these by default. Pass `includeCommon: false`
to skip them.

## `integrations/viem`

### `forViem(options?): ErrorDecoder`

```ts
interface ForViemOptions {
  readonly abis?: readonly AbiEntry[];
  readonly includeCommon?: boolean;        // default: true
  readonly fallbackMessage?: string;
}
```

Builds an `ErrorDecoder` pre-loaded with the common presets (unless
`includeCommon: false`) and any additional `abis` you pass.

## `integrations/wagmi`

### `forWagmi(options?): ErrorDecoder`

Same shape as `forViem`. Provided as a separate entry point for discoverability;
the underlying pipeline is identical (Wagmi's deeply-nested errors are handled
by the cause traversal).

### `getWagmiErrorMessage(error: unknown, options?): string`

Convenience wrapper that builds a decoder, decodes once, and returns the
`.message` string. Useful in toast handlers.

## `integrations/react`

### `useErrorParser(options?): UseErrorParserResult`

```ts
interface UseErrorParserOptions {
  readonly abis?: readonly AbiEntry[];
  readonly fallbackMessage?: string;
}

interface UseErrorParserResult {
  readonly parseError: (error: unknown) => ParseResult;
  readonly getErrorMessage: (error: unknown) => string;
}
```

The hook memoises an `ErrorDecoder` against `abis` and `fallbackMessage` by
**reference identity**. For stable behavior, define your `abis` array outside
the component or wrap it in `useMemo`. The returned functions are stable across
renders as long as the decoder is unchanged.
