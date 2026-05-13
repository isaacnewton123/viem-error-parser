import type { HexString } from '../types.js';

const HEX_PATTERN = /^0x[0-9a-fA-F]*$/;

/**
 * Type guard: returns true if `value` is a string of the form `0x` followed by
 * an even number of hex digits (or just `0x`). Empty string and non-string
 * inputs return false.
 *
 * @param value - The candidate value.
 * @returns Whether `value` is a valid {@link HexString}.
 */
export function isHex(value: unknown): value is HexString {
  if (typeof value !== 'string') return false;
  if (!HEX_PATTERN.test(value)) return false;
  // Hex strings must have even length after `0x` prefix (whole bytes).
  return value.length % 2 === 0;
}

/**
 * Asserts that `value` is a {@link HexString}, throwing a `TypeError` if not.
 *
 * @param value - The candidate value.
 * @returns The same value, narrowed to {@link HexString}.
 * @throws TypeError if `value` is not a hex string.
 */
export function assertHex(value: unknown): HexString {
  if (!isHex(value)) {
    throw new TypeError(
      `Expected a 0x-prefixed hex string, got ${typeof value === 'string' ? `"${value}"` : typeof value}`,
    );
  }
  return value;
}

/**
 * Returns the number of bytes in a hex string (excluding the `0x` prefix).
 *
 * @param hex - A hex string.
 * @returns The byte length.
 */
export function hexLength(hex: HexString): number {
  return (hex.length - 2) / 2;
}

/**
 * Returns a slice of a hex string by byte offset.
 *
 * @param hex - The source hex string.
 * @param startByte - Zero-based starting byte offset (inclusive).
 * @param endByte - Zero-based ending byte offset (exclusive). Defaults to end.
 * @returns A new {@link HexString} of the requested slice (always `0x`-prefixed).
 */
export function sliceHex(hex: HexString, startByte: number, endByte?: number): HexString {
  const start = 2 + Math.max(0, startByte) * 2;
  const end = endByte === undefined ? hex.length : 2 + Math.max(0, endByte) * 2;
  const body = hex.slice(start, Math.min(end, hex.length));
  // Constructing a hex string from a known-hex slice is provably safe.
  return `0x${body}` as HexString;
}

/**
 * Lowercases the hex body of a hex string. Idempotent and safe.
 *
 * @param hex - The hex string.
 * @returns Lowercased {@link HexString}.
 */
export function toLowerHex(hex: HexString): HexString {
  return hex.toLowerCase() as HexString;
}
