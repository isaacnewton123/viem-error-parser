# The classifier and the decoder pipeline

When the error isn't a decodable EVM revert, the decoder still gives you a
useful message via `classifyError`.

## Rule table

| Kind                       | Triggered by                                                        |
|----------------------------|---------------------------------------------------------------------|
| `user_rejected`            | "User rejected", `code: 4001`, MetaMask `ACTION_REJECTED`, ...      |
| `insufficient_funds`       | "insufficient funds for gas", "insufficient balance for transfer"   |
| `nonce_too_low`            | "nonce too low", "invalid nonce", "nonce has already been used"     |
| `replacement_underpriced`  | "replacement transaction underpriced", "replacement fee too low"    |
| `transaction_underpriced`  | "transaction underpriced"                                           |
| `intrinsic_gas_too_low`    | "intrinsic gas too low"                                             |
| `gas_too_low`              | "out of gas", "gas limit too low"                                   |
| `estimate_gas_failed`      | "unable to estimate gas", "gas required exceeds allowance"          |
| `rate_limited`             | "too many requests", `code: -32005`, HTTP 429                       |
| `method_not_supported`     | "the method X does not exist", "method not supported"               |
| `timeout`                  | "timed out", "deadline exceeded"                                    |
| `chain_mismatch`           | "chain id mismatch", "wrong network", "unsupported chain"           |
| `connection_refused`       | "ECONNREFUSED", "connection refused"                                |
| `network`                  | "fetch failed", "network request failed"                            |

Each kind maps to a fixed, friendly English message. See
[`src/core/errorClassifier.ts`](../src/core/errorClassifier.ts) for the
exact regex / code rules and messages.

## Decoder pipeline

`decoder.decode(error)` runs these steps in order, returning the first one
that produces a result:

1. **Cause traversal** — walks `error.cause`, `error.cause.cause`, ... and
   any `errors[]` siblings. Cycle-safe via a `WeakSet`. Hard-capped at
   `MAX_CAUSE_DEPTH` (16) to bound work on pathological inputs.
2. **Revert extraction** — reads `data` / `rawData` / `returnData` /
   `output` fields, or hex embedded in `message` / `shortMessage` /
   `details` / `reason`.
3. **Standard decoders** — if the selector is `0x08c379a0` (`Error(string)`)
   or `0x4e487b71` (`Panic(uint256)`), decode without needing an ABI. Panic
   codes are translated into human messages (overflow, division-by-zero,
   out-of-bounds, etc.).
4. **Custom ABI decoding** — if the selector is registered, run viem's
   `decodeErrorResult` against the matching ABI and return named args.
5. **Classifier fallback** — match the error tree against the rule table
   above (regex over `shortMessage` / `message` / `reason` / `details` and
   EIP-1193 codes).
6. **Unknown** — return a best-effort message extracted from the error (or
   the configured `fallbackMessage`).

## Customising the fallback

```ts
const decoder = forViem({
  fallbackMessage: 'Something went wrong. Please try again.',
});
```

The fallback only applies when **every** earlier step has nothing useful to
say — usually that means a thrown value with no `message`, no `shortMessage`,
no `data`, and no recognisable selector or text.
