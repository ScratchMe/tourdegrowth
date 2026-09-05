import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * Ownership proof for a submission — REVIEW.md R-01.
 *
 * The product has no user accounts (SPEC.md §5, explicitly out of scope), but
 * a result id IS the shareable link: every recipient of a shared `/r/<id>`
 * knows it. Before this existed, that was enough to complete someone else's
 * Deep dive with your own context — irreversibly, since the Deep dive route
 * is idempotent. So a submission gets one secret at creation time, held only
 * by the browser that created it, and the Deep dive route demands it.
 *
 * Only the HASH is ever persisted (same reasoning as storing a password
 * hash): a Firestore export, a log line, or any future read path can't be
 * turned back into a usable token. The plaintext token is returned exactly
 * once, in the 201 response to POST /api/submissions.
 *
 * Server-only (`node:crypto`) — never import this from a "use client" file.
 * The browser side only ever stores and echoes back an opaque string, it
 * never hashes anything.
 */

/** The secret handed to the creating browser, once. */
export function generateOwnerToken(): string {
  return randomUUID();
}

/** SHA-256 hex. Not a password: this is a 122-bit random UUID, so a plain
 * digest is enough — there is nothing to brute-force and no salt to add. */
export function hashOwnerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison of a presented token against a stored hash.
 *
 * Returns false for a missing/empty hash rather than throwing: submissions
 * created before R-01 have no `ownerTokenHash` at all, and the correct
 * answer for them is "nobody can prove ownership" (fail closed), not a 500.
 */
export function verifyOwnerToken(token: unknown, storedHash: string | null | undefined): boolean {
  if (typeof token !== "string" || token.length === 0) return false;
  if (typeof storedHash !== "string" || storedHash.length === 0) return false;

  const presented = Buffer.from(hashOwnerToken(token), "hex");
  let stored: Buffer;
  try {
    stored = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }
  // A malformed stored hash would make timingSafeEqual throw on length
  // mismatch — check first, since both sides are always 32 bytes when valid.
  if (presented.length !== stored.length) return false;

  return timingSafeEqual(presented, stored);
}
