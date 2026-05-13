# The result shape

`decoder.decode(error)` always returns a `ParseResult`, a discriminated union:

```ts
type ParseResult = DecodedError | UnknownError;

interface DecodedError {
  readonly success: true;
  readonly name: string;          // "Error" | "Panic" | your custom error name
  readonly message: string;       // formatted, human-readable
  readonly args?: Readonly<Record<string, unknown>>;
  readonly selector: Selector;    // "0x..." (4 bytes)
  readonly source: string;        // "solidity" | the ABI name you registered
}

interface UnknownError {
  readonly success: false;
  readonly message: string;       // classifier result, original message, or fallback
  readonly selector: Selector | null;
  readonly rawData: HexString | null;
}
```

`message` is **always** a non-empty string — you can safely render it without
checking for `undefined`.

## Type-narrowing

Use the `success` flag as the discriminant:

```ts
const result = decoder.decode(err);

if (result.success) {
  // TypeScript narrows to DecodedError here:
  console.log(result.name);     // string
  console.log(result.args);     // Readonly<Record<string, unknown>> | undefined
  console.log(result.source);   // string
} else {
  // TypeScript narrows to UnknownError here:
  console.warn(result.message); // string (always non-empty)
  console.warn(result.rawData); // HexString | null
}
```

## What `args` contains

For decoded ABI errors, `args` is the named-arguments object viem returns from
`decodeErrorResult`. Examples:

```ts
// revert ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)
result.args === {
  sender:  '0x...',
  balance: 5n,
  needed:  100n,
};

// revert Error("deadline expired")
result.args === { reason: 'deadline expired' };

// revert Panic(0x11)
result.args === { code: 17n };
```

For an anonymous-args ABI (rare), `args` is keyed by `arg0`, `arg1`, ... in
declaration order.

## What `source` means

| Value          | Meaning                                                          |
|----------------|------------------------------------------------------------------|
| `"solidity"`   | Decoded by the standard `Error(string)` or `Panic(uint256)` path.|
| `"<your name>"`| The `name` you passed to `createAbiEntry(name, abi)`.            |

It is purely informational — useful for logs and analytics.
