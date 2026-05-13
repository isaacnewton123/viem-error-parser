import { decodeErrorResult } from 'viem';
import type { Abi } from 'viem';
import type {
  DecodedArgs,
  DecodedError,
  HexString,
  ParseResult,
  Selector,
  UnknownError,
} from '../types.js';
import { extractRevertData } from '../core/extractRevertData.js';
import { AbiRegistry } from './abiRegistry.js';
import { classifyError } from './errorClassifier.js';

/** Standard `Error(string)` selector — `keccak256("Error(string)")[:4]`. */
const ERROR_STRING_SELECTOR = '0x08c379a0' as Selector;
/** Standard `Panic(uint256)` selector — `keccak256("Panic(uint256)")[:4]`. */
const PANIC_SELECTOR = '0x4e487b71' as Selector;

/** Map from Solidity panic codes to human-readable messages (per Solidity docs). */
const PANIC_REASONS: Readonly<Record<string, string>> = {
  '0x00': 'Generic compiler-inserted panic.',
  '0x01': 'An assert(false) was triggered.',
  '0x11': 'Arithmetic overflow or underflow.',
  '0x12': 'Division or modulo by zero.',
  '0x21': 'Tried to convert a value that is too big or negative into an enum type.',
  '0x22': 'Accessed a storage byte array that is incorrectly encoded.',
  '0x31': 'Called .pop() on an empty array.',
  '0x32': 'Array accessed out of bounds (or negative index).',
  '0x41': 'Allocated too much memory or created an array that is too large.',
  '0x51': 'Called a zero-initialized variable of internal function type.',
};

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
 * Best-effort message extractor used in the failure path.
 *
 * Returns `null` when the error provides no usable text — callers should then
 * use the configured `fallbackMessage`.
 *
 * @param error - Source error.
 * @returns A non-empty human-readable message, or `null`.
 */
function extractMessage(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  if (typeof error === 'string') return error.length > 0 ? error : null;
  for (const field of ['shortMessage', 'message', 'details', 'reason'] as const) {
    const value = readField(error, field);
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

/**
 * Stringifies decoded args into a short human-readable suffix.
 *
 * @param args - Decoded args.
 * @returns A formatted string like `(spender=0x..., amount=100n)`.
 */
function formatArgs(args: DecodedArgs | undefined): string {
  if (args === undefined) return '';
  const entries = Object.entries(args);
  if (entries.length === 0) return '';
  const parts = entries.map(([k, v]) => `${k}=${formatValue(v)}`);
  return `(${parts.join(', ')})`;
}

/**
 * Stringifies a single decoded value.
 *
 * @param value - Decoded value.
 * @returns String form.
 */
function formatValue(value: unknown): string {
  if (typeof value === 'bigint') return `${value.toString()}n`;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (value === null || value === undefined) return String(value);
  try {
    return JSON.stringify(value, (_, v: unknown) =>
      typeof v === 'bigint' ? `${v.toString()}n` : v,
    );
  } catch {
    return '[Object]';
  }
}

/** Options for {@link ErrorDecoder}. */
export interface ErrorDecoderOptions {
  /** Optional ABI registry. If omitted, an empty registry is used. */
  readonly registry?: AbiRegistry;
  /** Message used when nothing else matches. Defaults to a generic string. */
  readonly fallbackMessage?: string;
}

/**
 * High-level facade that turns an unknown thrown value into a {@link ParseResult}.
 *
 * Pipeline:
 * 1. Walk the `cause` chain to find revert hex (selector + args).
 * 2. If found, try standard selectors (`Error(string)`, `Panic(uint256)`).
 * 3. Otherwise, look up the selector in the registry and call viem's
 *    `decodeErrorResult` with the matching ABI.
 * 4. Otherwise, run the classifier (RPC / wallet / network errors).
 * 5. Otherwise, return an {@link UnknownError} with a best-effort message.
 */
export class ErrorDecoder {
  private readonly registry: AbiRegistry;

  private readonly fallback: string;

  /**
   * @param optionsOrRegistry - Either an {@link ErrorDecoderOptions} object,
   *   an existing {@link AbiRegistry}, or undefined.
   */
  public constructor(optionsOrRegistry?: AbiRegistry | ErrorDecoderOptions) {
    if (optionsOrRegistry instanceof AbiRegistry) {
      this.registry = optionsOrRegistry;
      this.fallback = 'Unknown error.';
    } else {
      this.registry = optionsOrRegistry?.registry ?? new AbiRegistry();
      this.fallback = optionsOrRegistry?.fallbackMessage ?? 'Unknown error.';
    }
  }

  /**
   * Decodes an unknown error into a {@link ParseResult}. Synchronous.
   *
   * @param error - The error value.
   * @returns The decoded result.
   */
  public decode(error: unknown): ParseResult {
    return this.decodeSync(error);
  }

  /**
   * Synchronous decode — currently identical to {@link decode}; kept for API
   * symmetry and future async strategies (e.g. signature lookups).
   *
   * @param error - The error value.
   * @returns The decoded result.
   */
  public decodeSync(error: unknown): ParseResult {
    const revert = extractRevertData(error);

    if (revert !== null) {
      const standard = this.tryDecodeStandard(revert.selector, revert.rawData);
      if (standard !== null) return standard;

      const match = this.registry.findError(revert.selector);
      if (match !== null) {
        const entry = this.registry
          .getEntries()
          .find((e) => e.name === match.abiName);
        if (entry !== undefined) {
          const decoded = this.tryDecodeWithAbi(entry.abi, revert.rawData, entry.name);
          if (decoded !== null) return decoded;
        }
      }
    }

    const classified = classifyError(error);
    if (classified !== null) {
      return {
        success: false,
        selector: revert?.selector ?? null,
        rawData: revert?.rawData ?? null,
        message: classified.message,
      };
    }

    const extracted = extractMessage(error);
    const unknown: UnknownError = {
      success: false,
      selector: revert?.selector ?? null,
      rawData: revert?.rawData ?? null,
      message: extracted ?? this.fallback,
    };
    return unknown;
  }

  /**
   * Handles `Error(string)` and `Panic(uint256)` without needing a registered ABI.
   *
   * @param selector - The 4-byte selector.
   * @param data - The full revert payload.
   * @returns A {@link DecodedError} if matched, otherwise `null`.
   */
  private tryDecodeStandard(selector: Selector, data: HexString): DecodedError | null {
    if (selector === ERROR_STRING_SELECTOR) {
      const standardAbi: Abi = [
        { type: 'error', name: 'Error', inputs: [{ name: 'reason', type: 'string' }] },
      ];
      return this.tryDecodeWithAbi(standardAbi, data, 'solidity');
    }
    if (selector === PANIC_SELECTOR) {
      const standardAbi: Abi = [
        { type: 'error', name: 'Panic', inputs: [{ name: 'code', type: 'uint256' }] },
      ];
      const decoded = this.tryDecodeWithAbi(standardAbi, data, 'solidity');
      if (decoded !== null) {
        const code = decoded.args?.code;
        const codeHex =
          typeof code === 'bigint' ? `0x${code.toString(16).padStart(2, '0')}` : null;
        const reason =
          codeHex !== null ? PANIC_REASONS[codeHex] : undefined;
        return {
          ...decoded,
          message:
            reason !== undefined
              ? `Panic: ${reason} (code ${codeHex ?? 'unknown'})`
              : decoded.message,
        };
      }
    }
    return null;
  }

  /**
   * Calls viem's `decodeErrorResult` and shapes the result.
   *
   * @param abi - The ABI to decode against.
   * @param data - Full revert payload.
   * @param source - Source label (registry ABI name, `"solidity"`, etc.).
   * @returns Decoded error, or `null` if viem could not decode.
   */
  private tryDecodeWithAbi(abi: Abi, data: HexString, source: string): DecodedError | null {
    try {
      const decoded = decodeErrorResult({ abi, data });
      const args = decoded.args;
      const inputs =
        abi.find(
          (item): item is Extract<Abi[number], { type: 'error' }> =>
            item.type === 'error' && item.name === decoded.errorName,
        )?.inputs ?? [];

      const named: Record<string, unknown> = {};
      if (args !== undefined) {
        args.forEach((value, idx) => {
          const input = inputs[idx];
          const key = input?.name && input.name.length > 0 ? input.name : String(idx);
          named[key] = value;
        });
      }

      const argRecord: DecodedArgs | undefined =
        Object.keys(named).length > 0 ? Object.freeze({ ...named }) : undefined;
      const selector = data.slice(0, 10).toLowerCase() as Selector;
      const messageBase =
        decoded.errorName === 'Error' && typeof named.reason === 'string'
          ? `Reverted: ${named.reason}`
          : `${decoded.errorName}${formatArgs(argRecord)}`;

      const result: DecodedError =
        argRecord !== undefined
          ? {
              success: true,
              name: decoded.errorName,
              message: messageBase,
              args: argRecord,
              selector,
              source,
            }
          : {
              success: true,
              name: decoded.errorName,
              message: messageBase,
              selector,
              source,
            };
      return result;
    } catch {
      return null;
    }
  }
}
