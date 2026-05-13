import { createAbiEntry } from 'viem-error-parser';
import { forWagmi } from 'viem-error-parser/wagmi';

const vaultAbi = [
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      { name: 'available', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
] as const;

// One decoder, shared by the whole app. Module-scope means it is created
// exactly once per page load.
export const decoder = forWagmi({
  abis: [createAbiEntry('Vault', vaultAbi as never)],
  fallbackMessage: 'Something went wrong. Please try again.',
});
