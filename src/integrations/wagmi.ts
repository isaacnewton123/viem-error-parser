import type { ParseResult } from '../types.js';
import type { ErrorDecoder } from '../core/decoder.js';
import { forViem, type ForViemOptions } from './viem.js';

/** Options for {@link forWagmi}. Same shape as {@link ForViemOptions}. */
export type ForWagmiOptions = ForViemOptions;

/**
 * Builds an {@link ErrorDecoder} configured for Wagmi.
 *
 * Wagmi's errors are deeply nested through `viem` BaseError chains; this is
 * already handled by the decoder's `cause` traversal, so this factory is
 * functionally equivalent to {@link forViem} but kept as a separate entry
 * point for discoverability.
 *
 * @param options - Configuration options.
 * @returns A configured {@link ErrorDecoder}.
 */
export function forWagmi(options: ForWagmiOptions = {}): ErrorDecoder {
  return forViem(options);
}

/**
 * Convenience helper: build a decoder, run it, return the message string.
 *
 * @param error - The thrown value from a Wagmi/Viem call.
 * @param options - Optional decoder configuration.
 * @returns The human-readable message.
 */
export function getWagmiErrorMessage(error: unknown, options: ForWagmiOptions = {}): string {
  const result: ParseResult = forWagmi(options).decode(error);
  return result.message;
}
