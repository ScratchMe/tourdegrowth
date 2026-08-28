import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Wordmark } from "@/components/brand/Wordmark";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { QUESTIONS } from "@/content/copy-library";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tour de Growth — How it works",
  description: "The AARRR framework explained, how the score is calculated, and the two tones — plus the one thing to know before taking the score too seriously.",
};

/**
 * "How it works" — SPEC-ADDENDUM-01.md §1.3. Server Component: nothing here
 * is interactive (no glossary popovers on this page — its whole point is to
 * spell things out in full prose instead), so it resolves locale the same
 * way not-found.tsx and the sample result page do, no client JS needed.
 */
export default async function HowItWorksPage() {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    queryLang: null,
    cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: headerList.get("accept-language"),
  });

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{tc(HOW_IT_WORKS.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(HOW_IT_WORKS.intro, locale)}</p>
        </div>

        <div className={styles.pillarStack}>
          {HOW_IT_WORKS.pillars.map((block) => {
            const example = QUESTIONS.find((q) => q.id === block.exampleQuestionId);
            return (
              <Card key={block.pillar} elevation="raised" className={styles.pillarCard}>
                <MetaLabel size="xs">{tc(UI_STRINGS.pillars[block.pillar], locale)}</MetaLabel>
                <h2 className={styles.pillarName}>{tc(UI_STRINGS.pillars[block.pillar], locale)}</h2>
                <p className={styles.pillarExplanation}>{tc(block.explanation, locale)}</p>
                {example && (
                  <div className={styles.exampleBox}>
                    <MetaLabel size="xs" className={styles.exampleLabel}>
                      {tc(UI_STRINGS.howItWorksPage.exampleQuestionLabel, locale)}
                    </MetaLabel>
                    <p className={styles.exampleQuestion}>{tc(example.question, locale)}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(HOW_IT_WORKS.scoringSection.title, locale)}</h2>
          <p className={styles.sectionBody}>{tc(HOW_IT_WORKS.scoringSection.body, locale)}</p>
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(HOW_IT_WORKS.tonesSection.title, locale)}</h2>
          <div className={styles.toneGrid}>
            <div className={styles.toneBlock}>
              <h3 className={styles.toneTitle}>{tc(HOW_IT_WORKS.tonesSection.straightUp.label, locale)}</h3>
              <p className={styles.toneBody}>{tc(HOW_IT_WORKS.tonesSection.straightUp.body, locale)}</p>
            </div>
            <div className={styles.toneBlock}>
              <h3 className={styles.toneTitle}>{tc(HOW_IT_WORKS.tonesSection.roast.label, locale)} 🔥</h3>
              <p className={styles.toneBody}>{tc(HOW_IT_WORKS.tonesSection.roast.body, locale)}</p>
            </div>
          </div>
        </section>

        <Card tone="paper" className={styles.limitationCard}>
          <p className={styles.limitationText}>{tc(HOW_IT_WORKS.limitationNotice.long, locale)}</p>
        </Card>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz">
            {tc(HOW_IT_WORKS.cta, locale)}
          </Button>
        </div>
      </main>
    </>
  );
}
