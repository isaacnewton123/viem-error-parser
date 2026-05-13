import type { Abi } from 'viem';
import type { AbiEntry } from '../types.js';
import { createAbiEntry } from '../core/abiRegistry.js';

/** ERC-20 (modern OpenZeppelin v5+) custom errors. */
const ERC20_ERRORS_ABI: Abi = [
  {
    type: 'error',
    name: 'ERC20InsufficientBalance',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'balance', type: 'uint256' },
      { name: 'needed', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientAllowance',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'allowance', type: 'uint256' },
      { name: 'needed', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidApprover',
    inputs: [{ name: 'approver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidReceiver',
    inputs: [{ name: 'receiver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSender',
    inputs: [{ name: 'sender', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSpender',
    inputs: [{ name: 'spender', type: 'address' }],
  },
];

/** ERC-721 (modern OpenZeppelin v5+) custom errors. */
const ERC721_ERRORS_ABI: Abi = [
  {
    type: 'error',
    name: 'ERC721NonexistentToken',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'ERC721IncorrectOwner',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'owner', type: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InsufficientApproval',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InvalidApprover',
    inputs: [{ name: 'approver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOperator',
    inputs: [{ name: 'operator', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOwner',
    inputs: [{ name: 'owner', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidReceiver',
    inputs: [{ name: 'receiver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidSender',
    inputs: [{ name: 'sender', type: 'address' }],
  },
];

/** ERC-1155 (modern OpenZeppelin v5+) custom errors. */
const ERC1155_ERRORS_ABI: Abi = [
  {
    type: 'error',
    name: 'ERC1155InsufficientBalance',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'balance', type: 'uint256' },
      { name: 'needed', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC1155InvalidApprover',
    inputs: [{ name: 'approver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC1155InvalidArrayLength',
    inputs: [
      { name: 'idsLength', type: 'uint256' },
      { name: 'valuesLength', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC1155InvalidOperator',
    inputs: [{ name: 'operator', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC1155InvalidReceiver',
    inputs: [{ name: 'receiver', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC1155InvalidSender',
    inputs: [{ name: 'sender', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC1155MissingApprovalForAll',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
  },
];

/** OpenZeppelin Ownable / AccessControl errors. */
const OZ_ACCESS_ABI: Abi = [
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [{ name: 'account', type: 'address' }],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [{ name: 'owner', type: 'address' }],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'neededRole', type: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
];

/** EIP-2612 / Permit2-style errors that show up frequently. */
const PERMIT_ABI: Abi = [
  {
    type: 'error',
    name: 'ERC2612ExpiredSignature',
    inputs: [{ name: 'deadline', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'ERC2612InvalidSigner',
    inputs: [
      { name: 'signer', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
  },
];

/**
 * @returns A curated list of common Solidity ABIs (ERC20/721/1155, Ownable,
 *   AccessControl, ERC-2612). Tree-shakable: import only when you call this.
 */
export function commonAbiEntries(): AbiEntry[] {
  return [
    createAbiEntry('ERC20', ERC20_ERRORS_ABI),
    createAbiEntry('ERC721', ERC721_ERRORS_ABI),
    createAbiEntry('ERC1155', ERC1155_ERRORS_ABI),
    createAbiEntry('OpenZeppelinAccess', OZ_ACCESS_ABI),
    createAbiEntry('ERC2612', PERMIT_ABI),
  ];
}
