import { describe, expect, it } from 'vitest';
import {
  AbiRegistry,
  buildSelectorMap,
  createAbiEntry,
} from '../../src/core/abiRegistry.js';
import type { Selector } from '../../src/types.js';

const ERC20_INSUFFICIENT = createAbiEntry('ERC20', [
  {
    type: 'error',
    name: 'ERC20InsufficientBalance',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'balance', type: 'uint256' },
      { name: 'needed', type: 'uint256' },
    ],
  },
]);

describe('buildSelectorMap', () => {
  it('extracts selectors for every error item', () => {
    const map = buildSelectorMap([
      { type: 'error', name: 'A', inputs: [] },
      { type: 'event', name: 'B', inputs: [] },
      { type: 'error', name: 'C', inputs: [{ type: 'uint256' }] },
    ]);
    expect(map.size).toBe(2);
  });

  it('produces a 4-byte selector', () => {
    const sel = Array.from(ERC20_INSUFFICIENT.selectors.keys())[0]!;
    expect(sel).toMatch(/^0x[0-9a-f]{8}$/);
  });
});

describe('AbiRegistry', () => {
  it('register, lookup, and snapshot', () => {
    const reg = new AbiRegistry();
    reg.add(ERC20_INSUFFICIENT);

    const sel = Array.from(ERC20_INSUFFICIENT.selectors.keys())[0]!;
    expect(reg.has(sel)).toBe(true);
    expect(reg.findError(sel)).toEqual({
      errorName: 'ERC20InsufficientBalance',
      abiName: 'ERC20',
    });
    expect(reg.getAllSelectors()).toContain(sel);
    expect(reg.getEntries()).toHaveLength(1);
  });

  it('addMany registers all entries', () => {
    const reg = new AbiRegistry();
    reg.addMany([ERC20_INSUFFICIENT]);
    expect(reg.getEntries()).toHaveLength(1);
  });

  it('first registration wins on duplicate selectors', () => {
    const reg = new AbiRegistry();
    reg.addMany([
      createAbiEntry('First', [
        { type: 'error', name: 'Same', inputs: [{ type: 'uint256' }] },
      ]),
      createAbiEntry('Second', [
        { type: 'error', name: 'Same', inputs: [{ type: 'uint256' }] },
      ]),
    ]);
    const sel = Array.from(reg.getEntries()[0]!.selectors.keys())[0]!;
    expect(reg.findError(sel)?.abiName).toBe('First');
  });

  it('returns null for unknown selectors', () => {
    const reg = new AbiRegistry();
    expect(reg.findError('0xdeadbeef' as Selector)).toBeNull();
    expect(reg.has('0xdeadbeef' as Selector)).toBe(false);
  });
});
