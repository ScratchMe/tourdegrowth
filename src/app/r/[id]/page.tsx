import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import { getSampleVerdict, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { getSubmissionById } from "@/lib/submissions/repository";
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
    const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
    const locale = resolveLocale({
      queryLang: null,
      cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
      acceptLanguage: headerList.get("accept-language"),
    });

    return (
      <ResultView
        total={SAMPLE_RESULT.total}
        pillars={SAMPLE_RESULT.pillars}
        weakestPillar={SAMPLE_RESULT.weakestPillar}
        verdicts={{
          neutral: getSampleVerdict("neutral", locale),
          roast: getSampleVerdict("roast", locale),
        }}
        initialTone="neutral"
        isSample
      />
    );
  }

  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  return (
    <ResultView
      id={submission.id}
      total={submission.total}
      pillars={submission.pillars}
      weakestPillar={submission.weakestPillar}
      verdicts={submission.verdicts}
      initialTone={submission.tone}
      deepDive={submission.deepDive}
    />
  );
}
