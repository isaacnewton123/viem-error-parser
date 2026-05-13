import { isHex, hexLength } from '../utils/hex.js';
import { extractArgs, extractSelector } from '../utils/errorSignature.js';
import type { HexString, RevertData } from '../types.js';
import { traverseErrorCause } from './traverseErrorCause.js';

/** Property names commonly used by Viem/Wagmi/RPC providers to carry revert data. */
const HEX_FIELDS = ['data', 'rawData', 'returnData', 'output', 'result', 'value'] as const;

/** Length of a properly-formed Solidity revert payload at minimum (selector). */
const MIN_REVERT_HEX_LENGTH = 10;

/**
 * Type-safe access to a property of an unknown record.
 *
 * @param obj - Unknown value.
 * @param key - Key to read.
 * @returns The property value or `undefined`.
 */
function readField(obj: unknown, key: string): unknown {
  if (obj === null || typeof obj !== 'object') return undefined;
  return (obj as Record<string, unknown>)[key];
}

/**
 * Heuristic: does this string contain a Solidity revert payload?
 *
 * @param value - Candidate value.
 * @returns Whether `value` is a valid hex string with at least one selector.
 */
function isRevertHex(value: unknown): value is HexString {
  return isHex(value) && value.length >= MIN_REVERT_HEX_LENGTH && hexLength(value) >= 4;
}

/**
 * Builds a {@link RevertData} from a known-good hex payload.
 *
 * @param hex - Raw hex revert payload.
 * @returns The parsed {@link RevertData}, or `null` if no selector could be extracted.
 */
function toRevertData(hex: HexString): RevertData | null {
  const selector = extractSelector(hex);
  if (selector === null) return null;
  const args = extractArgs(hex);
  return args === null
    ? { selector, rawData: hex }
    : { selector, rawData: hex, args };
}

/**
 * Inspects a single object for a hex revert payload in any of the known
 * carrier fields ({@link HEX_FIELDS}).
 *
 * @param node - Candidate object.
 * @returns A {@link RevertData} if found, otherwise `null`.
 */
function findHexInNode(node: unknown): RevertData | null {
  if (node === null || typeof node !== 'object') return null;
  for (const field of HEX_FIELDS) {
    const candidate = readField(node, field);
    if (isRevertHex(candidate)) {
      const data = toRevertData(candidate);
      if (data !== null) return data;
    }
  }
  return null;
}

/**
 * Walks an arbitrary error value (and its `cause` chain) looking for the
 * first valid revert hex payload it can find on any node.
 *
 * Recognises common Viem/Wagmi shapes:
 * - `error.data` (raw hex)
 * - `error.cause.data` (nested cause)
 * - `error.cause.cause.data` (deeply nested)
 * - `error.details` (string containing hex)
 * - `error.shortMessage` (string containing hex)
 *
 * @param error - The thrown value (typically `unknown` from a `catch`).
 * @returns Extracted {@link RevertData}, or `null` if none was found.
 */
export function extractRevertData(error: unknown): RevertData | null {
  let result: RevertData | null = null;

  traverseErrorCause(error, (node) => {
    const hit = findHexInNode(node);
    if (hit !== null) {
      result = hit;
      return false;
    }
    // Also check string fields like `details` / `shortMessage` for embedded hex.
    for (const field of ['details', 'shortMessage', 'message'] as const) {
      const value = readField(node, field);
      if (typeof value === 'string') {
        const match = /0x[0-9a-fA-F]{8,}/.exec(value);
        if (match && isRevertHex(match[0])) {
          const data = toRevertData(match[0]);
          if (data !== null) {
            result = data;
            return false;
          }
        }
      }
    }
    return true;
  });

  return result;
}
