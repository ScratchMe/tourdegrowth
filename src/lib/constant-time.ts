/**
 * Byte-by-byte comparison whose duration does not depend on WHERE two
 * strings differ — REVIEW-02.md R2-22. A plain `===` returns at the first
 * mismatching character, which is a timing side channel on a secret. Not
 * realistically exploitable through an edge's jitter, but the codebase
 * already does this right for the owner token (`owner-token.ts`,
 * `timingSafeEqual`), and an inconsistency is the kind that gets copied.
 * Runtime-agnostic (no `node:crypto`): the proxy must not depend on Node.
 * Only the LENGTH can leak, as with `timingSafeEqual`'s own precondition.
 *
 * Its own module since the owner preview (`owner-preview.ts`) compares
 * signatures with it too; `proxy.ts` re-exports it for its existing tests.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}
