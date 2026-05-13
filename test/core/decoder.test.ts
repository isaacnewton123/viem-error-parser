import { describe, expect, it } from 'vitest';
import { encodeErrorResult } from 'viem';
import type { Abi } from 'viem';
import { ErrorDecoder } from '../../src/core/decoder.js';
import { AbiRegistry, createAbiEntry } from '../../src/core/abiRegistry.js';

const CUSTOM_ABI: Abi = [
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      { name: 'available', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
];

describe('ErrorDecoder', () => {
  it('decodes Error(string) without registered ABI', () => {
    const data = encodeErrorResult({
      abi: [
        { type: 'error', name: 'Error', inputs: [{ type: 'string', name: 'reason' }] },
      ],
      errorName: 'Error',
      args: ['oops'],
    });
    const decoder = new ErrorDecoder();
    const result = decoder.decode({ data });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.name).toBe('Error');
      expect(result.message).toContain('oops');
      expect(result.source).toBe('solidity');
    }
  });

  it('decodes Panic(uint256) and produces a friendly message', () => {
    const data = encodeErrorResult({
      abi: [
        { type: 'error', name: 'Panic', inputs: [{ type: 'uint256', name: 'code' }] },
      ],
      errorName: 'Panic',
      args: [0x11n],
    });
    const decoder = new ErrorDecoder();
    const result = decoder.decode({ data });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toMatch(/overflow|underflow/i);
    }
  });

  it('decodes a custom error using the registered ABI', () => {
    const data = encodeErrorResult({
      abi: CUSTOM_ABI,
      errorName: 'InsufficientBalance',
      args: [10n, 100n],
    });
    const reg = new AbiRegistry();
    reg.add(createAbiEntry('Vault', CUSTOM_ABI));

    const decoder = new ErrorDecoder({ registry: reg });
    const result = decoder.decode({ cause: { data } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.name).toBe('InsufficientBalance');
      expect(result.args).toEqual({ available: 10n, required: 100n });
      expect(result.source).toBe('Vault');
      expect(result.message).toMatch(/InsufficientBalance/);
    }
  });

  it('falls back to classifier for non-revert errors', () => {
    const decoder = new ErrorDecoder();
    const result = decoder.decode({ message: 'user rejected the request' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/rejected/i);
      expect(result.selector).toBeNull();
    }
  });

  it('returns UnknownError when nothing matches', () => {
    const decoder = new ErrorDecoder();
    const result = decoder.decode({ message: 'something completely obscure' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBeTruthy();
    }
  });

  it('decodeSync mirrors decode', () => {
    const decoder = new ErrorDecoder();
    expect(decoder.decode({}).success).toBe(decoder.decodeSync({}).success);
  });

  it('accepts a bare AbiRegistry as constructor arg', () => {
    const decoder = new ErrorDecoder(new AbiRegistry());
    expect(decoder.decode(null).success).toBe(false);
  });

  it('uses a custom fallbackMessage when nothing matches', () => {
    const decoder = new ErrorDecoder({ fallbackMessage: 'custom fallback' });
    const result = decoder.decode(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe('custom fallback');
    }
  });
});
