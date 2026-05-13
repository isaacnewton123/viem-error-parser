import type { Abi, Hex } from 'viem';

/**
 * A hex string starting with `0x`.
 *
 * Branded subtype of viem's `Hex` (a `0x`-prefixed template literal). Construct
 * via {@link import('./hex').isHex} or {@link import('./hex').assertHex}.
 */
export type HexString = Hex & { readonly __brand: 'HexString' };

/**
 * A 4-byte function/error selector encoded as a 10-character hex string
 * (`0x` + 8 hex chars).
 *
 * Branded subtype of {@link HexString}.
 */
export type Selector = HexString & { readonly __selector: 'Selector' };

/**
 * The canonical Solidity error signature, e.g. `Error(string)` or
 * `Permit2InvalidSigner(address)`.
 *
 * Branded type produced from an ABI error fragment.
 */
export type ErrorSignature = string & { readonly __brand: 'ErrorSignature' };

/**
 * Raw revert data extracted from an error.
 */
export interface RevertData {
  /** First 4 bytes of the revert payload (10-char hex). */
  readonly selector: Selector;
  /** The full revert payload, including selector. */
  readonly rawData: HexString;
  /** ABI-encoded argument bytes (everything after the selector), if any. */
  readonly args?: HexString;
}

/**
 * An ABI registered with the parser.
 */
export interface AbiEntry {
  /** Human-readable ABI name (e.g. `"ERC20"`). */
  readonly name: string;
  /** The viem-compatible ABI array. */
  readonly abi: Abi;
  /** Pre-computed selector → error name lookup. */
  readonly selectors: Map<Selector, { readonly errorName: string }>;
}

/**
 * Decoded args object returned by viem's `decodeErrorResult`. Keys are either
 * positional indices (as strings) or named ABI parameters.
 */
export type DecodedArgs = Readonly<Record<string, unknown>>;

/**
 * A successfully decoded error.
 */
export interface DecodedError {
  readonly success: true;
  /** The custom error name (e.g. `"InsufficientBalance"`). */
  readonly name: string;
  /** Human-readable message. */
  readonly message: string;
  /** Decoded ABI arguments, if any. */
  readonly args?: DecodedArgs;
  /** The 4-byte selector that matched. */
  readonly selector: Selector;
  /**
   * Where the decode result came from — typically the ABI name from the
   * registry, `"viem"`, `"classifier"`, etc.
   */
  readonly source: string;
}

/**
 * An error we couldn't decode.
 */
export interface UnknownError {
  readonly success: false;
  /** Selector if one could be extracted, otherwise `null`. */
  readonly selector: Selector | null;
  /** Raw revert payload if found, otherwise `null`. */
  readonly rawData: HexString | null;
  /** Best-effort human-readable description. */
  readonly message: string;
}

/**
 * Result of {@link import('../core/decoder').ErrorDecoder.decode}.
 */
export type ParseResult = DecodedError | UnknownError;
