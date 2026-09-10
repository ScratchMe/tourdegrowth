import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { getSampleVerdicts, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { getBenchmarkFor } from "@/lib/submissions/benchmark";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { isValidSubmissionId } from "@/lib/submissions/referral";
import { buildQuickVerdicts, toDeepDiveView, toPillarViews } from "@/lib/submissions/view-model";
import { QUESTIONS } from "@/content/copy-library";
import type { BreakdownData } from "./ScoreBreakdown";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { ResultView } from "./ResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `generateMetadata` and the page component both need the submission and run
 * in the SAME request, so `cache()` dedupes them into one call; that call in
 * turn goes through the cross-request cache (REVIEW.md R-14), so a shared
 * result that many people open costs one Firestore read per hour rather than
 * one per view. Route handlers keep importing `getSubmissionById` directly.
 */
const loadSubmission = cache(getCachedSubmissionById);

/**
 * REVIEW-02.md R2-19. Every distinct id is a cache miss and therefore one
 * billed Firestore read, whether or not the document exists — so a route
 * parameter that cannot possibly be one of ours (ids are UUID v4, see
 * `referral.ts`) must 404 before anything is looked up. Same reasoning the
 * `?ref=` path has applied since R-03: a bad id costs zero reads. It also
 * keeps exotic path segments away from the Firestore client, whose own
 * validation only rejects empty strings and `//`.
 */
function rejectImplausibleId(id: string): void {
  if (id !== "sample" && !isValidSubmissionId(id)) notFound();
}

/**
 * The shared link's preview text — REVIEW.md R-10. Every result used to
 * carry the same generic title and description, so a link posted to
 * LinkedIn or X said nothing about the score: only the OG image did the
 * work, and the text beside it was wasted.
 *
 * Resolved in the SUBMISSION's locale, not the reader's — deliberately the
 * same rule as the OG image (see `opengraph-image.tsx`): a social crawler
 * sends no cookies, so there is no reader locale to honour here. The `title`
 * is kept language-neutral ("74/100 — Tour de Growth") so it reads correctly
 * as a browser tab title in either language.
 */
function resultMetadata(total: number, weakestPillar: Pillar, locale: Locale, isSample: boolean): Metadata {
  const pillar = tc(UI_STRINGS.pillars[weakestPillar], locale);
  const stall = tc(UI_STRINGS.og.stallSentenceTemplate, locale).replace("{pillar}", pillar);
  const description = isSample
    ? `${stall} ${tc(UI_STRINGS.og.whereDoesYours, locale)} — ${tc(UI_STRINGS.result.sampleBadge, locale)}`
    : `${stall} ${tc(UI_STRINGS.og.whereDoesYours, locale)}`;
  const title = `${total}/100 — Tour de Growth`;

  return {
    title,
    description,
    openGraph: { title, description, locale },
    twitter: { card: "summary_large_image", title, description },
    // SPEC-ADDENDUM-02.md §3.3, non-negotiable: individual result pages
    // (this whole route, sample included — see CLAUDE.md) never get
    // indexed. A `noindex` meta tag, not a robots.txt disallow: shared
    // results get real inbound links from the growth loop itself, and
    // blocking the crawl would stop Google from ever seeing this tag,
    // which can leave a linked-but-unindexable page showing up with no
    // snippet anyway — `noindex` alone is the correct way to keep a page
    // truly out of the index while it's still linked to.
    robots: { index: false, follow: true },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  rejectImplausibleId(id);

  if (id === "sample") {
    // The sample's OG image is fixed to English (see opengraph-image.tsx), so
    // its preview text matches rather than contradicting the picture.
    return resultMetadata(SAMPLE_RESULT.total, SAMPLE_RESULT.weakestPillar, "en", true);
  }

  // A read that FAILS (as opposed to one that finds nothing) must not throw
  // from here: an error thrown while resolving metadata bypasses the
  // segment's `error.tsx` and lands on Next's bare error document — the
  // very thing REVIEW-02.md R2-23 removes. Return the minimal metadata and
  // let the page component, whose `cache()`d call sees the same rejection,
  // throw inside the boundary that renders our fault screen.
  let submission;
  try {
    submission = await loadSubmission(id);
  } catch {
    return { title: "Tour de Growth", robots: { index: false, follow: true } };
  }
  if (!submission) return { title: "Tour de Growth", robots: { index: false, follow: true } };

  return resultMetadata(submission.total, submission.weakestPillar, submission.locale, false);
}

/**
 * The data behind "how this score is calculated" (REVIEW.md R-12), resolved
 * to display text HERE rather than shipped as the copy library.
 *
 * `content/copy-library.ts` is 483 lines across two languages; importing it
 * into the result page's client bundle to render 15 questions would be the
 * same mistake R-09 avoided. These are ~60 short strings instead, already in
 * the reader's language — and they're public content anyway (anyone can read
 * all 15 questions by opening /quiz). The ANSWERS, which are not public,
 * never come from here: they are read from the owner's own device.
 */
function buildBreakdownData(locale: Locale): BreakdownData {
  return {
    questions: QUESTIONS.map((q) => ({
      id: q.id,
      pillar: q.pillar,
      question: tc(q.question, locale),
      options: q.options.map((o) => ({ label: tc(o.label, locale), points: o.points })),
    })),
  };
}

// `/r/sample` is the fixed, hard-coded "See a sample result" screen
// (SPEC.md §12) — never a real Firestore lookup, never recalculated.
export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  rejectImplausibleId(id);

  if (id === "sample") {
    // Same locale-resolution priority as the root layout (cookie/header —
    // the proxy has already folded ?lang= into the cookie by this point) so
    // the fixed sample verdict's language matches everything else on first
    // paint, without needing a client fetch just for demo copy.
    const locale = await resolveRequestLocale();

    return (
      <ResultView
        total={SAMPLE_RESULT.total}
        pillars={SAMPLE_RESULT.pillars}
        weakestPillar={SAMPLE_RESULT.weakestPillar}
        verdicts={getSampleVerdicts(locale)}
        initialTone="neutral"
        isSample
      />
    );
  }

  const submission = await loadSubmission(id);
  if (!submission) notFound();

  // REVIEW.md R-09: the verdict follows whoever is READING, not whoever
  // created the result — the rest of this page already did. Same resolution
  // as the sample branch above, and the same helper, so the two can't drift.
  const locale = await resolveRequestLocale();

  // REVIEW.md R-20. Cached for an hour and null-safe by construction (see
  // `benchmark.ts`), so this adds no per-view Firestore read and can never
  // be the reason a result page fails to render. Not offered on `/r/sample`
  // above: its numbers aren't real, and a real average beside them would
  // blur exactly the line the "not your data" badge draws.
  const benchmark = await getBenchmarkFor(submission.segment ?? null);

  return (
    <ResultView
      id={submission.id}
      total={submission.total}
      // Not `submission.pillars` directly: that object also carries
      // `rawPoints`, which RSC would serialise into this public page's
      // payload however the prop is declared. See `toPillarViews`.
      pillars={toPillarViews(submission.pillars)}
      weakestPillar={submission.weakestPillar}
      verdicts={buildQuickVerdicts(locale, submission.pillars, submission.weakestPillar)}
      initialTone={submission.tone}
      breakdown={buildBreakdownData(locale)}
      // REVIEW.md R-02: only the generated verdicts cross to the client.
      // `deepDive` also holds the founder's free-text context and their 10
      // Deep dive answers, which would otherwise ride along in this public
      // page's RSC payload without ever being rendered.
      deepDive={toDeepDiveView(submission.deepDive, locale)}
      benchmark={benchmark}
      segment={submission.segment ?? null}
    />
  );
}
