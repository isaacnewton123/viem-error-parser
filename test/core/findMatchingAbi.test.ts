import { describe, expect, it } from 'vitest';
import { findMatchingAbi } from '../../src/core/findMatchingAbi.js';
import { createAbiEntry } from '../../src/core/abiRegistry.js';
import type { Selector } from '../../src/types.js';

const ABI_A = createAbiEntry('A', [
  { type: 'error', name: 'AlphaError', inputs: [{ name: 'x', type: 'uint256' }] },
]);
const ABI_B = createAbiEntry('B', [
  { type: 'error', name: 'BetaError', inputs: [{ name: 'y', type: 'address' }] },
]);

describe('findMatchingAbi', () => {
  it('returns null for unknown selectors', () => {
    expect(findMatchingAbi('0xdeadbeef' as Selector, [ABI_A, ABI_B])).toBeNull();
  });

  it('returns the first matching entry', () => {
    const sel = Array.from(ABI_A.selectors.keys())[0]!;
    const match = findMatchingAbi(sel, [ABI_A, ABI_B]);
    expect(match?.entry.name).toBe('A');
    expect(match?.errorName).toBe('AlphaError');
  });

  it('honours insertion order on collisions', () => {
    const sel = Array.from(ABI_B.selectors.keys())[0]!;
    expect(findMatchingAbi(sel, [ABI_A, ABI_B])?.entry.name).toBe('B');
    expect(findMatchingAbi(sel, [ABI_B, ABI_A])?.entry.name).toBe('B');
  });

  it('handles an empty entry list', () => {
    expect(findMatchingAbi('0x12345678' as Selector, [])).toBeNull();
  });
});
