import { toFunctionSelector } from 'viem';
import type { Abi } from 'viem';
import type { AbiEntry, Selector } from '../types.js';
import { isSelectorShape } from '../utils/errorSignature.js';
import { toLowerHex } from '../utils/hex.js';

/** Minimal shape used to format an ABI parameter into a canonical type string. */
interface AbiTypeNode {
  readonly type: string;
  readonly components?: readonly AbiTypeNode[];
}

/** Minimal shape we extract from an `error` ABI item to build its selector. */
interface AbiErrorItem {
  readonly type: 'error';
  readonly name: string;
  readonly inputs?: readonly AbiTypeNode[];
}

/**
 * Recursively formats an ABI type node into its canonical Solidity form,
 * handling tuples and tuple arrays (e.g. `tuple[]` -> `(uint256,address)[]`).
 *
 * @param node - The ABI type node.
 * @returns The canonical type string.
 */
function formatType(node: AbiTypeNode): string {
  const t = node.type;
  if (t === 'tuple' || t.startsWith('tuple[') || t.startsWith('tuple(')) {
    const suffix = t.slice('tuple'.length);
    const inner = (node.components ?? []).map(formatType).join(',');
    return `(${inner})${suffix}`;
  }
  return t;
}

/**
 * Builds the canonical signature string for an error ABI item.
 *
 * @param item - The error fragment.
 * @returns A string like `"InsufficientBalance(address,uint256)"`.
 */
function errorSignature(item: AbiErrorItem): string {
  return `${item.name}(${(item.inputs ?? []).map(formatType).join(',')})`;
}

/** Result of {@link AbiRegistry.findError}. */
export interface AbiRegistryMatch {
  /** Custom error name. */
  readonly errorName: string;
  /** Name of the registered ABI that owns this selector. */
  readonly abiName: string;
}

/**
 * Internal: type guard for error items inside an `Abi`.
 *
 * @param item - Candidate ABI item.
 * @returns Whether the item is an error fragment.
 */
function isAbiError(item: Abi[number]): item is Abi[number] & { type: 'error' } {
  return item.type === 'error';
}

/**
 * Builds a selector → error name map for an ABI.
 *
 * @param abi - The ABI to scan.
 * @returns A map of every error selector defined in `abi`.
 */
export function buildSelectorMap(abi: Abi): Map<Selector, { errorName: string }> {
  const map = new Map<Selector, { errorName: string }>();
  for (const item of abi) {
    if (!isAbiError(item)) continue;
    const sig = errorSignature(item as unknown as AbiErrorItem);
    const rawSelector = toFunctionSelector(sig);
    const selector = toLowerHex(rawSelector as unknown as Selector);
    if (isSelectorShape(selector)) {
      map.set(selector, { errorName: item.name });
    }
  }
  return map;
}

/**
 * Convenience constructor: build an {@link AbiEntry} from a name and ABI,
 * pre-computing the selector map.
 *
 * @param name - Display name for the ABI (e.g. `"ERC20"`).
 * @param abi - The viem-compatible ABI.
 * @returns A ready-to-register {@link AbiEntry}.
 */
export function createAbiEntry(name: string, abi: Abi): AbiEntry {
  return { name, abi, selectors: buildSelectorMap(abi) };
}

/**
 * Registry of ABIs used to look up custom errors by selector.
 *
 * Insertion order is preserved; {@link AbiRegistry.findError} returns the
 * first ABI that declared the matching selector.
 */
export class AbiRegistry {
  /** Internal: master selector index, last-write-wins for fast lookup. */
  private readonly index = new Map<Selector, AbiRegistryMatch>();

  /** Internal: registered ABI entries, in insertion order. */
  private readonly entries: AbiEntry[] = [];

  /**
   * Registers a single ABI entry.
   *
   * @param entry - Entry to register.
   */
  public add(entry: AbiEntry): void {
    this.entries.push(entry);
    for (const [selector, value] of entry.selectors) {
      if (!this.index.has(selector)) {
        this.index.set(selector, { errorName: value.errorName, abiName: entry.name });
      }
    }
  }

  /**
   * Registers many ABI entries.
   *
   * @param entries - Entries to register.
   */
  public addMany(entries: readonly AbiEntry[]): void {
    for (const entry of entries) this.add(entry);
  }

  /**
   * Looks up a selector across all registered ABIs.
   *
   * @param selector - The selector to search.
   * @returns The match, or `null` if none registered.
   */
  public findError(selector: Selector): AbiRegistryMatch | null {
    return this.index.get(selector) ?? null;
  }

  /**
   * Whether the registry has a definition for `selector`.
   *
   * @param selector - The selector to test.
   * @returns Whether the selector is known.
   */
  public has(selector: Selector): boolean {
    return this.index.has(selector);
  }

  /**
   * @returns Every selector currently known to the registry.
   */
  public getAllSelectors(): Selector[] {
    return Array.from(this.index.keys());
  }

  /**
   * @returns A snapshot of registered entries (insertion order).
   */
  public getEntries(): readonly AbiEntry[] {
    return this.entries;
  }
}
