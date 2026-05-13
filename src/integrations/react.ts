import { useMemo } from 'react';
import type { AbiEntry, ParseResult } from '../types.js';
import { AbiRegistry } from '../core/abiRegistry.js';
import { ErrorDecoder } from '../core/decoder.js';

/** Options accepted by {@link useErrorParser}. */
export interface UseErrorParserOptions {
  /**
   * Additional ABI entries to register. Pre-compute selector maps with
   * `createAbiEntry` to avoid recomputing on every render.
   */
  readonly abis?: readonly AbiEntry[];
  /** Message used when nothing else matches. */
  readonly fallbackMessage?: string;
}

/** Return shape of {@link useErrorParser}. */
export interface UseErrorParserResult {
  /** Decode an unknown error into a {@link ParseResult}. */
  readonly parseError: (error: unknown) => ParseResult;
  /** Convenience: decode and return the message string. */
  readonly getErrorMessage: (error: unknown) => string;
}

/**
 * React hook that returns memoised `parseError` / `getErrorMessage` functions
 * backed by a single {@link ErrorDecoder} instance.
 *
 * The decoder is rebuilt only when `abis` or `fallbackMessage` change by
 * reference. For best results, pass a stable reference (define `abis` outside
 * the component or wrap in `useMemo`).
 *
 * @param options - Optional configuration.
 * @returns The hook result.
 */
export function useErrorParser(options: UseErrorParserOptions = {}): UseErrorParserResult {
  const abis = options.abis;
  const fallbackMessage = options.fallbackMessage;

  const decoder = useMemo<ErrorDecoder>(() => {
    const registry = new AbiRegistry();
    if (abis !== undefined && abis.length > 0) registry.addMany(abis);
    return fallbackMessage !== undefined
      ? new ErrorDecoder({ registry, fallbackMessage })
      : new ErrorDecoder({ registry });
  }, [abis, fallbackMessage]);

  return useMemo<UseErrorParserResult>(
    () => ({
      parseError: (error: unknown): ParseResult => decoder.decode(error),
      getErrorMessage: (error: unknown): string => decoder.decode(error).message,
    }),
    [decoder],
  );
}
