# Getting started

## Install

```bash
pnpm add viem-error-parser viem
# or
npm  install viem-error-parser viem
# or
yarn add viem-error-parser viem
```

`viem >= 2` is required as a peer dependency. For the React hook,
`react >= 18` is required as an optional peer.

## Quick start (Viem)

```ts
import { forViem } from 'viem-error-parser';

const decoder = forViem(); // ships with ERC20/721/1155, OZ Ownable/AccessControl, ERC-2612 errors

try {
  await walletClient.writeContract({ /* ... */ });
} catch (error) {
  const result = decoder.decode(error);
  console.error(result.message);
  //          "ERC20InsufficientBalance(sender=0x..., balance=5n, needed=100n)"
  //          or "Reverted: deadline expired"
  //          or "The transaction was rejected by the user."
}
```

## Quick start (Wagmi)

```ts
import { getWagmiErrorMessage } from 'viem-error-parser/wagmi';

const { writeContract, error } = useWriteContract();

if (error) {
  toast.error(getWagmiErrorMessage(error));
}
```

## Quick start (React)

```tsx
import { useErrorParser } from 'viem-error-parser/react';
import { createAbiEntry } from 'viem-error-parser/react';
import { myVaultAbi } from './abi';

const myAbis = [createAbiEntry('Vault', myVaultAbi)]; // define OUTSIDE the component

function VaultButton() {
  const { getErrorMessage } = useErrorParser({ abis: myAbis });
  const { writeContractAsync } = useWriteContract();

  return (
    <button
      onClick={async () => {
        try {
          await writeContractAsync({ /* ... */ });
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      Deposit
    </button>
  );
}
```

## Next steps

- [Register your own ABIs](./custom-abis.md)
- [Understand the result shape](./result-shape.md)
- [See what the classifier covers](./classifier.md)
