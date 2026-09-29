import { badgeToken, isBadgeTotal, parseBadgeToken, renderBadgeSvg } from "@/lib/og/badge";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { isValidSubmissionId } from "@/lib/submissions/referral";
import { SAMPLE_RESULT } from "@/lib/submissions/sample-result";

/**
 * `GET /r/<id>/badge/<token>.svg` — the README badge (`lib/og/badge.ts`,
 * CHANTIERS.md A3.1), cached like the share image beside it:
 *
 * - the CURRENT token is immutable for a year, in the browser and on the
 *   CDN — a result's total never changes, so neither does its badge;
 * - any OTHER well-formed token (one minted before the drawing last changed)
 *   still answers with the current badge, cached for an hour: a README is
 *   never edited to follow us;
 * - an id that cannot be ours is a 404 before any Firestore read (R2-19),
 *   and so is a result that does not exist.
 *
 * The body is built from the total alone: nothing a person typed, and no id,
 * ever reaches the SVG, which holds no script, link or external reference
 * (`lib/og/badge.test.ts`). `nosniff` keeps it an image. No CSP of its own:
 * `next.config.mjs` sets `frame-ancestors 'none'` on every response and wins
 * over a route's header of the same name (measured, 2026-09-29).
 */
const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";
const BRIEF = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

async function totalOf(id: string): Promise<number | null> {
  if (id === "sample") return SAMPLE_RESULT.total;
  if (!isValidSubmissionId(id)) return null;
  const submission = await getCachedSubmissionById(id);
  // A stored total that is not one the engine produces is no badge at all: never markup, never cached.
  return submission && isBadgeTotal(submission.total) ? submission.total : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token: segment } = await params;
  const token = parseBadgeToken(segment);
  if (!token) return new Response(null, { status: 404 });

  const total = await totalOf(id);
  if (total === null) return new Response(null, { status: 404 });

  return new Response(renderBadgeSvg(total), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": token === badgeToken(total) ? IMMUTABLE : BRIEF,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
