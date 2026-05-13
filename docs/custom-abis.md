# Registering custom ABIs

The decoder ships with a curated set of common ABIs (ERC-20/721/1155,
OpenZeppelin Ownable / AccessControl, ERC-2612). To decode your **own**
contract errors, register their ABIs.

## With `forViem` / `forWagmi`

```ts
import { forViem, createAbiEntry } from 'viem-error-parser';
import { myVaultAbi, myStakingAbi } from './abis';

const decoder = forViem({
  abis: [
    createAbiEntry('Vault', myVaultAbi),
    createAbiEntry('Staking', myStakingAbi),
  ],
});

// In your error handler:
const result = decoder.decode(error);
if (result.success) {
  // result.name   -> "InsufficientBalance"
  // result.args   -> { available: 10n, required: 100n }
  // result.source -> "Vault"
}
```

## What `createAbiEntry` does

`createAbiEntry(name, abi)` walks the ABI once and pre-computes a
`Map<Selector, { errorName }>`. The result is a stable `AbiEntry` that the
decoder can consult in O(1) per lookup.

Pass the **same array reference** to `forViem` / `forWagmi` /
`useErrorParser` on every render — that is what makes the React hook
stable. Define `myAbis` at module scope, or wrap the array in `useMemo`
with a stable dependency list:

```ts
// ✅ Module scope — built once per page load.
const myAbis = [createAbiEntry('Vault', myVaultAbi)];

// ✅ Stable inside a component.
const myAbis = useMemo(
  () => [createAbiEntry('Vault', myVaultAbi)],
  [],
);

// ❌ Re-built on every render — breaks memoisation.
function Bad() {
  const myAbis = [createAbiEntry('Vault', myVaultAbi)];
  // ...
}
```

## Skipping the bundled presets

If you don't want the bundled ERC-20 etc. entries (for example you ship
a non-standard token or just want the smallest bundle):

```ts
const decoder = forViem({
  includeCommon: false,
  abis: [createAbiEntry('Vault', myVaultAbi)],
});
```

## Conflict resolution

If two ABIs declare an error with the same selector, the **first** entry
wins (insertion order). Bundled common ABIs are added before any `abis:`
you pass, so your overrides — if any — should pass `includeCommon: false`
and re-add the presets after your entries.
