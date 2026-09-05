import { revalidateTag, unstable_cache } from "next/cache";
import { getSubmissionById } from "./repository";
import type { Submission } from "./types";

/**
 * The read path for PUBLIC result pages — REVIEW.md R-14.
 *
 * Every view of `/r/<id>` was a Firestore read, and a shared result is read
 * by definition: the page, its metadata and its OG image all wanted the same
 * document, and a link that gets any traction multiplies that by everyone who
 * opens it. Firestore's free tier is nowhere near exhausted today, but read
 * quota is exactly the resource that runs out if the growth loop works — the
 * one outcome this project is built for.
 *
 * A submission only ever changes once, when a Deep dive completes, so the
 * entry is invalidated explicitly at that moment (`invalidateSubmission`).
 * The TTL below is a backstop, not the mechanism: if an invalidation is ever
 * missed, a stale result heals itself within the hour rather than forever.
 *
 * NOT used by the Deep dive route, deliberately — see the note there: its
 * "already completed?" check has to read the current state.
 */
const ONE_HOUR_SECONDS = 3600;

function submissionTag(id: string): string {
  return `submission:${id}`;
}

export function getCachedSubmissionById(id: string): Promise<Submission | null> {
  return unstable_cache(() => getSubmissionById(id), ["submission", id], {
    tags: [submissionTag(id)],
    revalidate: ONE_HOUR_SECONDS,
  })();
}

/**
 * Called right after the one write that can change a submission (the Deep
 * dive).
 *
 * `{ expire: 0 }` because Next.js 16 made the second argument required:
 * `revalidateTag` now takes a cache-life profile rather than expiring
 * immediately by default. Zero is the "drop it now" case. The docs point to
 * `updateTag` for immediate expiry, but that one is Server-Action-only and
 * this runs in a Route Handler.
 */
export function invalidateSubmission(id: string): void {
  // Never allowed to fail the request. By the time this runs the Deep dive
  // has already been generated and written; throwing here would hand the
  // user a 502 for work that actually succeeded. The worst case if it fails
  // is a stale page for up to the TTL above, which is exactly what the TTL
  // is there for.
  try {
    revalidateTag(submissionTag(id), { expire: 0 });
  } catch (err) {
    console.error("invalidateSubmission failed (the cached copy will expire on its own):", err);
  }
}
