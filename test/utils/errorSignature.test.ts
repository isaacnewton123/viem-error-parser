import { describe, expect, it } from 'vitest';
import {
  SELECTOR_LENGTH,
  extractArgs,
  extractSelector,
  isSelectorShape,
} from '../../src/utils/errorSignature.js';
import type { HexString } from '../../src/types.js';

describe('isSelectorShape', () => {
  it('accepts a 10-char hex string', () => {
    expect(isSelectorShape('0x12345678')).toBe(true);
  });

  it('rejects shorter or longer hex', () => {
    expect(isSelectorShape('0x1234')).toBe(false);
    expect(isSelectorShape('0x123456789a')).toBe(false);
  });

  it('rejects non-hex', () => {
    expect(isSelectorShape('zzzzzzzz')).toBe(false);
    expect(isSelectorShape(null)).toBe(false);
  });

  it('exposes the selector length constant', () => {
    expect(SELECTOR_LENGTH).toBe(10);
  });
});

describe('extractSelector', () => {
  it('returns first 4 bytes lowercased', () => {
    expect(extractSelector('0xDEADBEEFcafebabe' as HexString)).toBe('0xdeadbeef');
  });

  it('returns null when too short', () => {
    expect(extractSelector('0x' as HexString)).toBe(null);
    expect(extractSelector('0xab' as HexString)).toBe(null);
    expect(extractSelector('0xabcdef' as HexString)).toBe(null);
  });

  it('returns selector even when no args', () => {
    expect(extractSelector('0x12345678' as HexString)).toBe('0x12345678');
  });
});

describe('extractArgs', () => {
  it('returns null when no args', () => {
    expect(extractArgs('0x12345678' as HexString)).toBe(null);
    expect(extractArgs('0x' as HexString)).toBe(null);
  });

  it('returns the bytes after the selector', () => {
    expect(extractArgs('0x12345678aabbccdd' as HexString)).toBe('0xaabbccdd');
  });
});
