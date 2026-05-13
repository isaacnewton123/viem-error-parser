import type { AbiEntry, Selector } from '../types.js';

/** Result of a successful match lookup. */
export interface AbiMatch {
  /** The matching ABI entry. */
  readonly entry: AbiEntry;
  /** The error name within that ABI. */
  readonly errorName: string;
}

/**
 * Searches a list of {@link AbiEntry} for one whose selector map contains
 * `selector`. Returns the first match (preserving registration order).
 *
 * Pure function — no Viem dependency.
 *
 * @param selector - The 4-byte selector to search for.
 * @param entries - ABI entries to search.
 * @returns A {@link AbiMatch} or `null`.
 */
export function findMatchingAbi(
  selector: Selector,
  entries: readonly AbiEntry[],
): AbiMatch | null {
  for (const entry of entries) {
    const hit = entry.selectors.get(selector);
    if (hit !== undefined) {
      return { entry, errorName: hit.errorName };
    }
  }
  return null;
}
