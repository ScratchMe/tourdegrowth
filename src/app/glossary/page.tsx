import type { Metadata } from "next";
import Link from "next/link";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY } from "@/content/glossary";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Growth glossary — Tour de Growth",
  description:
    "Plain-English definitions of the growth/AARRR vocabulary — CAC, LTV, viral coefficient, growth loop, and more.",
};

/**
 * `/glossary` index — SPEC-ADDENDUM-02.md §3.1: the glossary content
 * already written for the in-app definition popovers (content/glossary.ts)
 * doubles as long-tail SEO content once each term has its own indexable
 * page. Server Component, same locale-resolution pattern as
 * `/how-it-works` — no interactivity needed here either.
 */
export default async function GlossaryIndexPage() {
  const locale = await resolveRequestLocale();
  const t = UI_STRINGS.glossaryPage;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <WordmarkLink />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{tc(t.indexTitle, locale)}</h1>
          <p className={styles.subtitle}>{tc(t.indexIntro, locale)}</p>
        </div>

        <div className={styles.list}>
          {Object.entries(GLOSSARY).map(([id, entry]) => (
            <Link key={id} href={`/glossary/${id}`} className={styles.itemLink}>
              <Card elevation="flat" tone="paper" className={styles.item}>
                <h2 className={styles.term}>{tc(entry.term, locale)}</h2>
                <p className={styles.definition}>{tc(entry.definition, locale)}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz">
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
        </div>
      </main>
    </>
  );
}
