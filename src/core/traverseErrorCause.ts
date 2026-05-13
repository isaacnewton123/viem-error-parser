/** Maximum depth to walk down `error.cause` chains before giving up. */
export const MAX_CAUSE_DEPTH = 16;

/**
 * Visitor function. Return `false` to stop traversal, `true` to continue.
 */
export type CauseVisitor = (node: unknown, depth: number) => boolean;

/**
 * Read a property from an unknown record without unsafe casts.
 *
 * @param obj - Unknown value.
 * @param key - Key to read.
 * @returns The property value or `undefined`.
 */
function readProperty(obj: unknown, key: string): unknown {
  if (obj === null || typeof obj !== 'object') return undefined;
  return (obj as Record<string, unknown>)[key];
}

/**
 * Walks the `cause` chain of an error-like value, invoking `visit` on each
 * node (including the root). Stops when:
 * - The visitor returns `false`,
 * - The chain ends (no `cause`),
 * - Depth exceeds {@link MAX_CAUSE_DEPTH}, or
 * - A cycle is detected.
 *
 * Cycle detection uses a `WeakSet` over visited objects. Non-object roots are
 * still passed to the visitor once.
 *
 * @param error - The thrown value to walk.
 * @param visit - Callback invoked per node.
 */
export function traverseErrorCause(error: unknown, visit: CauseVisitor): void {
  const seen = new WeakSet<object>();
  let current: unknown = error;
  let depth = 0;

  while (current !== undefined && current !== null && depth <= MAX_CAUSE_DEPTH) {
    if (typeof current === 'object') {
      if (seen.has(current)) return;
      seen.add(current);
    }

    const shouldContinue = visit(current, depth);
    if (!shouldContinue) return;

    // Some Viem errors carry an array of `errors` (BaseError) — walk those too.
    const errorsArr = readProperty(current, 'errors');
    if (Array.isArray(errorsArr)) {
      for (const raw of errorsArr as readonly unknown[]) {
        const sibling: unknown = raw;
        if (sibling === current) continue;
        if (typeof sibling === 'object' && sibling !== null) {
          if (seen.has(sibling)) continue;
          seen.add(sibling);
        }
        const cont = visit(sibling, depth + 1);
        if (!cont) return;
      }
    }

    current = readProperty(current, 'cause');
    depth += 1;
  }
}
