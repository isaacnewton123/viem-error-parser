import { describe, expect, it } from 'vitest';
import {
  MAX_CAUSE_DEPTH,
  traverseErrorCause,
} from '../../src/core/traverseErrorCause.js';

describe('traverseErrorCause', () => {
  it('visits the root for a primitive', () => {
    const seen: unknown[] = [];
    traverseErrorCause('boom', (n) => {
      seen.push(n);
      return true;
    });
    expect(seen).toEqual(['boom']);
  });

  it('walks down the cause chain', () => {
    const root = { name: 'A', cause: { name: 'B', cause: { name: 'C' } } };
    const names: string[] = [];
    traverseErrorCause(root, (n) => {
      if (n !== null && typeof n === 'object' && 'name' in n) {
        names.push((n as { name: string }).name);
      }
      return true;
    });
    expect(names).toEqual(['A', 'B', 'C']);
  });

  it('stops when the visitor returns false', () => {
    const root = { name: 'A', cause: { name: 'B', cause: { name: 'C' } } };
    const names: string[] = [];
    traverseErrorCause(root, (n) => {
      if (n !== null && typeof n === 'object' && 'name' in n) {
        names.push((n as { name: string }).name);
      }
      return names.length < 2;
    });
    expect(names).toEqual(['A', 'B']);
  });

  it('detects cycles', () => {
    const a: { name: string; cause?: unknown } = { name: 'A' };
    const b: { name: string; cause: unknown } = { name: 'B', cause: a };
    a.cause = b;
    let calls = 0;
    traverseErrorCause(a, () => {
      calls += 1;
      return true;
    });
    expect(calls).toBe(2);
  });

  it('respects max depth', () => {
    let head: { cause?: unknown } = {};
    for (let i = 0; i < MAX_CAUSE_DEPTH + 5; i += 1) {
      head = { cause: head };
    }
    let count = 0;
    traverseErrorCause(head, () => {
      count += 1;
      return true;
    });
    expect(count).toBeLessThanOrEqual(MAX_CAUSE_DEPTH + 1);
  });

  it('walks `errors` siblings on a node', () => {
    const root = { errors: [{ name: 'sib1' }, { name: 'sib2' }] };
    const seenNames: string[] = [];
    traverseErrorCause(root, (n) => {
      if (n !== null && typeof n === 'object' && 'name' in n) {
        seenNames.push((n as { name: string }).name);
      }
      return true;
    });
    expect(seenNames).toContain('sib1');
    expect(seenNames).toContain('sib2');
  });

  it('handles null and undefined gracefully', () => {
    let calls = 0;
    traverseErrorCause(null, () => {
      calls += 1;
      return true;
    });
    traverseErrorCause(undefined, () => {
      calls += 1;
      return true;
    });
    expect(calls).toBe(0);
  });
});
