import { traverseErrorCause } from '../core/traverseErrorCause.js';

/** Categories of non-revert errors we recognise without an ABI. */
export type ErrorKind =
  | 'user_rejected'
  | 'insufficient_funds'
  | 'nonce_too_low'
  | 'replacement_underpriced'
  | 'transaction_underpriced'
  | 'gas_too_low'
  | 'intrinsic_gas_too_low'
  | 'estimate_gas_failed'
  | 'rate_limited'
  | 'method_not_supported'
  | 'timeout'
  | 'network'
  | 'chain_mismatch'
  | 'connection_refused';

/** Output of the classifier. */
export interface Classification {
  readonly kind: ErrorKind;
  readonly message: string;
}

/** A single classification rule: regex + (kind, message). */
interface Rule {
  readonly pattern: RegExp;
  readonly kind: ErrorKind;
  readonly message: string;
}

/** Ordered list of rules — first match wins. */
const RULES: readonly Rule[] = [
  {
    pattern: /user (rejected|denied)|rejected by user|user closed|action_rejected|denied transaction signature/i,
    kind: 'user_rejected',
    message: 'The transaction was rejected by the user.',
  },
  {
    pattern: /insufficient funds|sender doesn'?t have enough funds|insufficient balance for transfer/i,
    kind: 'insufficient_funds',
    message: 'The sender does not have enough funds to cover gas + value.',
  },
  {
    pattern: /nonce too low|nonce has already been used|invalid nonce/i,
    kind: 'nonce_too_low',
    message: 'The transaction nonce is lower than the next expected nonce.',
  },
  {
    pattern: /replacement transaction underpriced|replacement fee too low/i,
    kind: 'replacement_underpriced',
    message: 'The replacement transaction must pay a higher fee than the one it replaces.',
  },
  {
    pattern: /transaction underpriced/i,
    kind: 'transaction_underpriced',
    message: 'The gas price is too low for the network to accept the transaction.',
  },
  {
    pattern: /intrinsic gas too low/i,
    kind: 'intrinsic_gas_too_low',
    message: 'The supplied gas limit is below the intrinsic gas required for the transaction.',
  },
  {
    pattern: /gas (limit )?too low|out of gas/i,
    kind: 'gas_too_low',
    message: 'The transaction ran out of gas.',
  },
  {
    pattern: /unable to estimate gas|gas required exceeds allowance|cannot estimate gas/i,
    kind: 'estimate_gas_failed',
    message:
      'Gas estimation failed — the transaction would revert. Check inputs, allowances, and contract state.',
  },
  {
    pattern: /rate ?limit|too many requests|429/i,
    kind: 'rate_limited',
    message: 'The RPC provider rate-limited this request. Retry with backoff.',
  },
  {
    pattern: /method (.*) not (supported|found|available)|the method .* does not exist/i,
    kind: 'method_not_supported',
    message: 'The RPC method is not supported by this provider.',
  },
  {
    pattern: /timeout|timed out|deadline exceeded/i,
    kind: 'timeout',
    message: 'The request timed out before the RPC responded.',
  },
  {
    pattern: /chain (id )?mismatch|wrong network|unsupported chain/i,
    kind: 'chain_mismatch',
    message: 'The wallet is connected to a different chain than expected.',
  },
  {
    pattern: /econnrefused|connection refused/i,
    kind: 'connection_refused',
    message: 'The RPC endpoint refused the connection.',
  },
  {
    pattern: /network (error|request failed)|fetch failed|failed to fetch/i,
    kind: 'network',
    message: 'A network error occurred while contacting the RPC endpoint.',
  },
];

/** Property names that commonly carry human-readable error text. */
const TEXT_FIELDS = ['shortMessage', 'details', 'message', 'reason', 'cause'] as const;

/**
 * Type-safe access to a property of an unknown record.
 *
 * @param obj - Unknown value.
 * @param key - Key to read.
 * @returns The value or `undefined`.
 */
function readField(obj: unknown, key: string): unknown {
  if (obj === null || typeof obj !== 'object') return undefined;
  return (obj as Record<string, unknown>)[key];
}

/**
 * Walks an arbitrary error and returns a category + canonical message for
 * common non-revert failures (RPC, wallet, gas, network).
 *
 * @param error - The error to classify.
 * @returns A {@link Classification} or `null` if no rule matched.
 */
export function classifyError(error: unknown): Classification | null {
  let result: Classification | null = null;

  traverseErrorCause(error, (node) => {
    if (node === null || typeof node !== 'object') {
      if (typeof node === 'string') {
        const m = matchString(node);
        if (m !== null) {
          result = m;
          return false;
        }
      }
      return true;
    }
    for (const field of TEXT_FIELDS) {
      const value = readField(node, field);
      if (typeof value === 'string') {
        const m = matchString(value);
        if (m !== null) {
          result = m;
          return false;
        }
      }
    }
    // also check error.code numeric (-32xxx etc)
    const code = readField(node, 'code');
    if (typeof code === 'number') {
      if (code === -32603) {
        // generic "internal error" — no special action, but keep walking.
      }
      if (code === 4001) {
        result = { kind: 'user_rejected', message: 'The transaction was rejected by the user.' };
        return false;
      }
      if (code === -32005) {
        result = {
          kind: 'rate_limited',
          message: 'The RPC provider rate-limited this request. Retry with backoff.',
        };
        return false;
      }
    }
    return true;
  });

  return result;
}

/**
 * Internal: match a string against the rule list.
 *
 * @param text - The text to test.
 * @returns The first matching {@link Classification}, or `null`.
 */
function matchString(text: string): Classification | null {
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { kind: rule.kind, message: rule.message };
    }
  }
  return null;
}
