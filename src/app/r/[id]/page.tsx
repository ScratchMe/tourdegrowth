import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { getSampleVerdicts, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { getSubmissionById } from "@/lib/submissions/repository";
import { buildQuickVerdicts, toDeepDiveView } from "@/lib/submissions/view-model";
import { ResultView } from "./ResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Tour de Growth — your growth score",
    description:
      id === "sample"
        ? "A sample Tour de Growth result — see what a shareable AARRR growth score looks like."
        : "Your AARRR growth score, scored and explained.",
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

  const submission = await getSubmissionById(id);
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
