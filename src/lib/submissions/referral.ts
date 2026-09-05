/**
 * `?ref=` attribution integrity — REVIEW.md R-03.
 *
 * The K-factor (referred submissions ÷ unique sharers) is the metric SPEC.md
 * §1 names as the project's own success criterion — the number to quote in an
 * interview. That makes anything that inflates it worse than useless: a
 * flattering K-factor nobody can defend is a liability, not an achievement.
 *
 * Two things used to inflate it. The result page's "Take the Tour again"
 * button carried `?ref=<this result>` even for the person who had just
 * created it, so every re-test by the same user counted as a referred
 * analysis crediting themselves (that half is fixed client-side, see
 * ResultView / quiz storage). And the server accepted any string at all as a
 * `refId`, so `?ref=hello` or a made-up id landed in Firestore and counted as
 * a "unique sharer" in `growth-stats.ts`.
 *
 * This module is the server-side half: a ref only counts if it looks like an
 * id we could have issued AND names a submission that really exists.
 */

/**
 * Submission ids are `crypto.randomUUID()` (see the create route), i.e.
 * RFC 4122 v4. Checking the shape first means a junk ref costs zero Firestore
 * reads — only a plausible id is worth looking up.
 */
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSubmissionId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}

/**
 * Resolves the `refId` to actually persist on a new submission.
 *
 * Never throws and never rejects the submission: a bad ref is dropped
 * (`null`) and the analysis proceeds. Losing one attribution is a rounding
 * error; refusing to score someone because a query parameter was mangled
 * would be a real failure.
 *
 * `submissionExists` is injected so this stays a pure decision that can be
 * tested without Firestore. An existence-check failure resolves to `null`
 * for the same reason: attribution is best-effort.
 */
export async function resolveRefId(
  rawRefId: unknown,
  submissionExists: (id: string) => Promise<boolean>,
): Promise<string | null> {
  if (!isValidSubmissionId(rawRefId)) return null;

  try {
    return (await submissionExists(rawRefId)) ? rawRefId : null;
  } catch {
    return null;
  }
}
