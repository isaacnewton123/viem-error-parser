# Advanced usage

For most apps, `forViem` / `forWagmi` / `useErrorParser` are enough. If you
want full control, you can build the decoder by hand from its parts.

## Building a decoder from scratch

```ts
import {
  AbiRegistry,
  ErrorDecoder,
  createAbiEntry,
  commonAbiEntries,
} from 'viem-error-parser';

const registry = new AbiRegistry();
registry.addMany(commonAbiEntries());          // optional: include the bundled presets
registry.add(createAbiEntry('Vault', myVaultAbi));

const decoder = new ErrorDecoder({
  registry,
  fallbackMessage: 'Something went wrong.',
});
```

Pass an `AbiRegistry` instance (or a plain options object) to the
constructor. Both shapes are supported:

```ts
new ErrorDecoder(registry);                                   // shorthand
new ErrorDecoder({ registry });                               // explicit
new ErrorDecoder({ registry, fallbackMessage: '...' });       // with fallback
```

## Inspecting the registry

```ts
registry.has(selector);             // boolean
registry.findError(selector);       // { errorName, abiName } | null
registry.getAllSelectors();         // Selector[]
registry.getEntries();              // readonly AbiEntry[]
```

`findError` is what the decoder calls internally. `has` is the cheaper
existence check.

## Calling the lower-level helpers directly

The full decoder pipeline isn't always what you want. The lower-level pieces
are exported individually so you can compose your own logic:

```ts
import {
  extractRevertData,        // unknown -> RevertData | null
  classifyError,            // unknown -> Classification | null
  traverseErrorCause,       // (error, visit) => void
  extractSelector,          // HexString -> Selector | null
  extractArgs,              // HexString -> HexString | null
} from 'viem-error-parser';
```

For example, this is roughly what `decoder.decode` does:

```ts
const revert = extractRevertData(error);
if (revert) {
  const match = registry.findError(revert.selector);
  if (match) {
    // hand off to viem's decodeErrorResult and format
  }
}

const classified = classifyError(error);
if (classified) {
  return { success: false, message: classified.message, /* ... */ };
}
```

## Performance notes

- `createAbiEntry` walks the ABI once. Cache the result; don't call it on
  every render.
- `AbiRegistry` indexes selectors in a `Map`, so registry lookups are O(1)
  in the number of registered ABIs.
- The cause traversal is O(N) in the depth of the error tree, capped at 16
  by `MAX_CAUSE_DEPTH`. Cycles cost nothing extra after first visit.
- The classifier is a plain switch over a small rule table — no allocations
  per call beyond the returned object.
