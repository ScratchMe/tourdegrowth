import type { Metadata } from "next";
import type { ReactNode } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";

/**
 * Metadata for `/quiz` — REVIEW-02.md R2-08. The page itself is a Client
 * Component (one state machine for the whole questionnaire), so it cannot
 * export metadata; this pass-through layout does it for it.
 *
 * Until now `/quiz` inherited the root title, "Tour de Growth", and no
 * description — while receiving more internal links than any content page
 * (header and footer of every one of them). It stays indexable on purpose:
 * "growth quiz" / "quiz croissance" is a legitimate query for it to land, and
 * a real title and description are what let it rank for that instead of
 * competing with the landing under the same name. The language is the
 * reader's (no locale prefix here, see `lib/i18n/routes.ts`), from the
 * header the proxy resolved.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  return {
    title: tc(UI_STRINGS.meta.quizTitle, locale),
    description: tc(UI_STRINGS.meta.quizDescription, locale),
  };
}

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children;
}
