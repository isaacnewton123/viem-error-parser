import type { AbiEntry } from '../types.js';
import { AbiRegistry } from '../core/abiRegistry.js';
import { ErrorDecoder } from '../core/decoder.js';
import { commonAbiEntries } from '../presets/commonAbis.js';

/** Options accepted by {@link forViem}. */
export interface ForViemOptions {
  /** Additional ABI entries to register on top of the common set. */
  readonly abis?: readonly AbiEntry[];
  /** If `true` (default), preload the curated common ABIs (ERC20/721/1155 etc.). */
  readonly includeCommon?: boolean;
  /** Message returned when nothing matches. Defaults to a generic string. */
  readonly fallbackMessage?: string;
}

/**
 * Builds a ready-to-use {@link ErrorDecoder} for plain Viem usage.
 *
 * @param options - Configuration options.
 * @returns A configured {@link ErrorDecoder}.
 */
export function forViem(options: ForViemOptions = {}): ErrorDecoder {
  const registry = new AbiRegistry();
  if (options.includeCommon !== false) {
    registry.addMany(commonAbiEntries());
  }
  if (options.abis !== undefined && options.abis.length > 0) {
    registry.addMany(options.abis);
  }
  return options.fallbackMessage !== undefined
    ? new ErrorDecoder({ registry, fallbackMessage: options.fallbackMessage })
    : new ErrorDecoder({ registry });
}
