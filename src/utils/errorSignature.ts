import { hexLength, isHex, sliceHex, toLowerHex } from './hex.js';
import type { HexString, Selector } from '../types.js';

/** Length of a selector hex string: `0x` + 4 bytes (8 hex chars) = 10 chars. */
export const SELECTOR_LENGTH = 10;

/**
 * Returns true if `value` is shaped like a 4-byte selector
 * (i.e. a hex string of exactly 10 characters).
 *
 * @param value - The candidate value.
 * @returns Whether `value` is a valid {@link Selector}.
 */
export function isSelectorShape(value: unknown): value is Selector {
  return isHex(value) && value.length === SELECTOR_LENGTH;
}

/**
 * Extracts the 4-byte selector (first 4 bytes) from revert data.
 *
 * @param data - The full revert payload as a hex string.
 * @returns The {@link Selector}, or `null` if `data` is too short.
 */
export function extractSelector(data: HexString): Selector | null {
  if (hexLength(data) < 4) return null;
  return toLowerHex(sliceHex(data, 0, 4)) as Selector;
}

/**
 * Extracts the ABI-encoded arguments (everything after the 4-byte selector).
 *
 * @param data - The full revert payload as a hex string.
 * @returns The argument bytes as a {@link HexString}, or `null` if there are none.
 */
export function extractArgs(data: HexString): HexString | null {
  if (hexLength(data) <= 4) return null;
  return sliceHex(data, 4);
}
