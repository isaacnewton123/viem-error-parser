import { describe, expect, it } from 'vitest';
import { encodeErrorResult } from 'viem';
import { forViem, forWagmi, getWagmiErrorMessage } from '../../src/index.js';
import type { Abi } from 'viem';

describe('integration: forViem', () => {
  it('decodes ERC20InsufficientBalance using the common ABIs', () => {
    const data = encodeErrorResult({
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
    const result = forViem().decode({ cause: { data } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.name).toBe('ERC20InsufficientBalance');
      expect(result.source).toBe('ERC20');
    }
  });

  it('extracts revert data from a deeply-nested viem-like error', () => {
    const data = encodeErrorResult({
      abi: [
        { type: 'error', name: 'Error', inputs: [{ type: 'string', name: 'reason' }] },
      ],
      errorName: 'Error',
      args: ['nested message'],
    });
    const wagmiLikeError = {
      name: 'ContractFunctionExecutionError',
      shortMessage: 'The contract function reverted.',
      cause: {
        name: 'ContractFunctionRevertedError',
        cause: {
          name: 'CallExecutionError',
          cause: { name: 'RpcError', data },
        },
      },
    };
    const result = forViem().decode(wagmiLikeError);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain('nested message');
    }
  });

  it('honours additional ABIs via forViem options', async () => {
    const { createAbiEntry } = await import('../../src/core/abiRegistry.js');
    const customAbi: Abi = [
      { type: 'error', name: 'MyError', inputs: [{ type: 'uint256', name: 'value' }] },
    ];
    const data = encodeErrorResult({
      abi: customAbi,
      errorName: 'MyError',
      args: [42n],
    });
    const decoder = forViem({
      abis: [createAbiEntry('MyContract', customAbi)],
    });
    const result = decoder.decode({ data });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.name).toBe('MyError');
      expect(result.source).toBe('MyContract');
      expect(result.args).toEqual({ value: 42n });
    }
  });
});

describe('integration: forWagmi / getWagmiErrorMessage', () => {
  it('returns the message string directly', () => {
    const data = encodeErrorResult({
      abi: [
        { type: 'error', name: 'Error', inputs: [{ type: 'string', name: 'reason' }] },
      ],
      errorName: 'Error',
      args: ['wagmi reverted'],
    });
    const message = getWagmiErrorMessage({ cause: { data } });
    expect(message).toContain('wagmi reverted');
  });

  it('forWagmi is wired to the same pipeline as forViem', () => {
    const decoder = forWagmi();
    const result = decoder.decode({ message: 'nonce too low' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/nonce/i);
    }
  });
});
