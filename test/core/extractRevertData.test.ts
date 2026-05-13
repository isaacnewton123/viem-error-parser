import { describe, expect, it } from 'vitest';
import { extractRevertData } from '../../src/core/extractRevertData.js';

const REVERT_HEX = '0x08c379a0' +
  '0000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000005' +
  '6f6f70733a000000000000000000000000000000000000000000000000000000';

describe('extractRevertData', () => {
  it('extracts data from `error.data`', () => {
    const result = extractRevertData({ data: REVERT_HEX });
    expect(result).not.toBeNull();
    expect(result?.selector).toBe('0x08c379a0');
    expect(result?.rawData).toBe(REVERT_HEX);
    expect(result?.args).toBeDefined();
  });

  it('walks down the cause chain', () => {
    const result = extractRevertData({
      message: 'outer',
      cause: { cause: { data: REVERT_HEX } },
    });
    expect(result?.selector).toBe('0x08c379a0');
  });

  it('extracts hex embedded in shortMessage', () => {
    const result = extractRevertData({
      shortMessage: `reverted with: ${REVERT_HEX}`,
    });
    expect(result?.selector).toBe('0x08c379a0');
  });

  it('returns null for non-revert payloads', () => {
    expect(extractRevertData({ data: '0xab' })).toBeNull();
    expect(extractRevertData({ data: 'not hex' })).toBeNull();
    expect(extractRevertData({})).toBeNull();
    expect(extractRevertData(null)).toBeNull();
    expect(extractRevertData(undefined)).toBeNull();
    expect(extractRevertData('plain string')).toBeNull();
  });

  it('handles malformed selector-only payloads', () => {
    const result = extractRevertData({ data: '0x12345678' });
    expect(result).not.toBeNull();
    expect(result?.selector).toBe('0x12345678');
    expect(result?.args).toBeUndefined();
  });

  it('checks all known carrier fields', () => {
    expect(extractRevertData({ rawData: REVERT_HEX })?.selector).toBe('0x08c379a0');
    expect(extractRevertData({ returnData: REVERT_HEX })?.selector).toBe('0x08c379a0');
    expect(extractRevertData({ output: REVERT_HEX })?.selector).toBe('0x08c379a0');
  });
});
