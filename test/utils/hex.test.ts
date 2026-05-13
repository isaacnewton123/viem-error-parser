import { describe, expect, it } from 'vitest';
import { assertHex, hexLength, isHex, sliceHex, toLowerHex } from '../../src/utils/hex.js';
import type { HexString } from '../../src/types.js';

describe('isHex', () => {
  it('accepts valid even-length hex strings', () => {
    expect(isHex('0x')).toBe(true);
    expect(isHex('0xab')).toBe(true);
    expect(isHex('0xABCDEF0123456789')).toBe(true);
  });

  it('rejects odd-length hex bodies', () => {
    expect(isHex('0xa')).toBe(false);
    expect(isHex('0xabc')).toBe(false);
  });

  it('rejects strings without 0x prefix', () => {
    expect(isHex('ab')).toBe(false);
    expect(isHex('1234')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(isHex('0xZZ')).toBe(false);
    expect(isHex('0xaq')).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isHex(null)).toBe(false);
    expect(isHex(undefined)).toBe(false);
    expect(isHex(123)).toBe(false);
    expect(isHex({})).toBe(false);
    expect(isHex([])).toBe(false);
  });
});

describe('assertHex', () => {
  it('returns the value when valid', () => {
    expect(assertHex('0xabcd')).toBe('0xabcd');
  });

  it('throws TypeError on invalid', () => {
    expect(() => assertHex('not hex')).toThrow(TypeError);
    expect(() => assertHex(42)).toThrow(TypeError);
    expect(() => assertHex(null)).toThrow(TypeError);
  });
});

describe('hexLength', () => {
  it('returns byte count', () => {
    expect(hexLength('0x' as HexString)).toBe(0);
    expect(hexLength('0xab' as HexString)).toBe(1);
    expect(hexLength('0xabcd' as HexString)).toBe(2);
    expect(hexLength('0x08c379a0' as HexString)).toBe(4);
  });
});

describe('sliceHex', () => {
  const data = '0xdeadbeefcafebabe' as HexString;

  it('slices from start byte', () => {
    expect(sliceHex(data, 0, 4)).toBe('0xdeadbeef');
  });

  it('slices to end when no end given', () => {
    expect(sliceHex(data, 4)).toBe('0xcafebabe');
  });

  it('clamps out-of-range end', () => {
    expect(sliceHex(data, 0, 100)).toBe('0xdeadbeefcafebabe');
  });

  it('handles negative startByte as 0', () => {
    expect(sliceHex(data, -1, 2)).toBe('0xdead');
  });
});

describe('toLowerHex', () => {
  it('lowercases body', () => {
    expect(toLowerHex('0xABCDEF' as HexString)).toBe('0xabcdef');
  });

  it('is idempotent', () => {
    const v = '0xabcd' as HexString;
    expect(toLowerHex(toLowerHex(v))).toBe('0xabcd');
  });
});
