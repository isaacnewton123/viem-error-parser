import { createAbiEntry } from 'viem-error-parser';
import type { AbiEntry } from 'viem-error-parser/types';

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

// Keep this array reference stable — it is what makes the React hook stable.
export const myAbis: AbiEntry[] = [createAbiEntry('Vault', vaultAbi as never)];
