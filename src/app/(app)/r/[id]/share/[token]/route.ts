import { loadOgFonts } from "@/lib/og/fonts";
import { renderResultShareImage } from "@/lib/og/result-frame";
import {
  parseShareToken,
  sampleShareImageModel,
  shareImageModel,
  shareImageStrings,
  shareImageToken,
  type ShareImageModel,
} from "@/lib/og/share-image";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { isValidSubmissionId } from "@/lib/submissions/referral";

/**
 * `GET /r/<id>/share/<token>.png` — the result's share image, on a versioned
 * address (`lib/og/share-image.ts`).
 *
 * A route handler rather than the `opengraph-image.tsx` file convention,
 * because the convention serves its own URL with `max-age=0,
 * must-revalidate` and no way to change either. Here the picture is the same
 * as before; what changes is the caching:
 *
 * - The CURRENT token (the one the page declares) is immutable for a year,
 *   in the browser and on the CDN. It cannot go stale: anything that would
 *   change the picture changes the token, and the page then declares the
 *   new address. A repeat view of a result costs the origin nothing.
 * - Any OTHER token — the `legacy` one the two old addresses rewrite to, or
 *   a token minted before a Deep dive finished — still renders the current
 *   picture (a scraped share must keep previewing, SPEC.md §12), cached for
 *   an hour: brief, because that picture can still change under it.
 * - A segment that is not a token at all is a 404, like an id that cannot be
 *   ours (REVIEW-02.md R2-19: before any Firestore read) or a result that
 *   does not exist (REVIEW.md R-14: no image is better than a false one).
 */
const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";
const BRIEF = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

async function loadModel(id: string): Promise<ShareImageModel | null> {
  if (id === "sample") return sampleShareImageModel();
  if (!isValidSubmissionId(id)) return null;
  const submission = await getCachedSubmissionById(id);
  return submission ? shareImageModel(submission) : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token: segment } = await params;
  const token = parseShareToken(segment);
  if (!token) return new Response(null, { status: 404 });

  const [model, fonts] = await Promise.all([loadModel(id), loadOgFonts()]);
  if (!model) return new Response(null, { status: 404 });

  const current = token === shareImageToken(model);
  return renderResultShareImage(model, shareImageStrings(model), fonts, {
    "Cache-Control": current ? IMMUTABLE : BRIEF,
  });
}
