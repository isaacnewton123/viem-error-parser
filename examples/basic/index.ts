import { encodeErrorResult } from 'viem';
import { createAbiEntry, forViem } from 'viem-error-parser';

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

const decoder = forViem({
  abis: [createAbiEntry('Vault', vaultAbi as never)],
});

// 1) Common preset: ERC20InsufficientBalance from OpenZeppelin v5.
const erc20Data = encodeErrorResult({
  abi: [
    {
      type: 'error',
      name: 'ERC20InsufficientBalance',
      inputs: [
        { name: 'sender', type: 'address' },
        { name: 'balance', type: 'uint256' },
        { name: 'needed', type: 'uint256' },
      ],
    },
  ],
  errorName: 'ERC20InsufficientBalance',
  args: ['0x0000000000000000000000000000000000000001', 5n, 100n],
});

// 2) Solidity require / revert with reason.
const errorStringData = encodeErrorResult({
  abi: [
    { type: 'error', name: 'Error', inputs: [{ type: 'string', name: 'reason' }] },
  ],
  errorName: 'Error',
  args: ['deadline expired'],
});

// 3) Solidity Panic for arithmetic overflow.
const panicData = encodeErrorResult({
  abi: [
    { type: 'error', name: 'Panic', inputs: [{ type: 'uint256', name: 'code' }] },
  ],
  errorName: 'Panic',
  args: [0x11n],
});

const fixtures: { label: string; error: unknown }[] = [
  { label: '1', error: { cause: { data: erc20Data } } },
  { label: '2', error: { shortMessage: 'reverted', cause: { data: errorStringData } } },
  { label: '3', error: { data: panicData } },
  { label: '4', error: { message: 'User rejected the request.' } },
  { label: '5', error: null },
];

for (const { label, error } of fixtures) {
  const result = decoder.decode(error);
  console.log(`[${label}] ${result.message}`);
}
