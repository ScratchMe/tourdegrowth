import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { getSampleVerdicts, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { getSubmissionById } from "@/lib/submissions/repository";
import { buildQuickVerdicts, toDeepDiveView } from "@/lib/submissions/view-model";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { ResultView } from "./ResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `generateMetadata` and the page component both need the submission, and
 * they run in the SAME request — `cache()` makes that one Firestore read
 * instead of two. (Route handlers keep importing `getSubmissionById`
 * directly; this wrapper only exists for the React render pass.)
 */
const loadSubmission = cache(getSubmissionById);

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

  if (id === "sample") {
    // The sample's OG image is fixed to English (see opengraph-image.tsx), so
    // its preview text matches rather than contradicting the picture.
    return resultMetadata(SAMPLE_RESULT.total, SAMPLE_RESULT.weakestPillar, "en", true);
  }

  const submission = await loadSubmission(id);
  if (!submission) return { title: "Tour de Growth", robots: { index: false, follow: true } };

  return resultMetadata(submission.total, submission.weakestPillar, submission.locale, false);
}

// `/r/sample` is the fixed, hard-coded "See a sample result" screen
// (SPEC.md §12) — never a real Firestore lookup, never recalculated.
export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

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

  return (
    <ResultView
      id={submission.id}
      total={submission.total}
      pillars={submission.pillars}
      weakestPillar={submission.weakestPillar}
      verdicts={buildQuickVerdicts(locale, submission.pillars, submission.weakestPillar)}
      initialTone={submission.tone}
      // REVIEW.md R-02: only the generated verdicts cross to the client.
      // `deepDive` also holds the founder's free-text context and their 10
      // Deep dive answers, which would otherwise ride along in this public
      // page's RSC payload without ever being rendered.
      deepDive={toDeepDiveView(submission.deepDive)}
    />
  );
}
