import { describe, expect, it } from 'vitest';
import { classifyError } from '../../src/core/errorClassifier.js';

describe('classifyError', () => {
  it('detects user rejection by message', () => {
    expect(classifyError({ message: 'User rejected the request' })?.kind).toBe(
      'user_rejected',
    );
    expect(classifyError({ message: 'ACTION_REJECTED' })?.kind).toBe('user_rejected');
  });

  it('detects user rejection by EIP-1193 code 4001', () => {
    expect(classifyError({ code: 4001, message: 'rejected' })?.kind).toBe('user_rejected');
  });

  it('detects insufficient funds', () => {
    expect(classifyError({ message: 'insufficient funds for gas' })?.kind).toBe(
      'insufficient_funds',
    );
  });

  it('detects nonce issues', () => {
    expect(classifyError({ message: 'nonce too low' })?.kind).toBe('nonce_too_low');
  });

  it('detects replacement underpriced', () => {
    expect(
      classifyError({ message: 'replacement transaction underpriced' })?.kind,
    ).toBe('replacement_underpriced');
  });

  it('detects rate limiting', () => {
    expect(classifyError({ message: 'too many requests, rate limited' })?.kind).toBe(
      'rate_limited',
    );
    expect(classifyError({ code: -32005, message: '' })?.kind).toBe('rate_limited');
  });

  it('detects method not supported', () => {
    expect(
      classifyError({ message: 'the method eth_foo does not exist' })?.kind,
    ).toBe('method_not_supported');
  });

  it('detects timeouts and network errors', () => {
    expect(classifyError({ message: 'request timed out' })?.kind).toBe('timeout');
    expect(classifyError({ message: 'fetch failed' })?.kind).toBe('network');
  });

  it('walks the cause chain', () => {
    expect(
      classifyError({ message: 'outer', cause: { message: 'nonce too low' } })?.kind,
    ).toBe('nonce_too_low');
  });

  it('returns null when nothing matches', () => {
    expect(classifyError({ message: 'something obscure' })).toBeNull();
    expect(classifyError(null)).toBeNull();
    expect(classifyError(undefined)).toBeNull();
  });
});
