import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ term: string }>;
}

function isGlossaryTermId(value: string): value is GlossaryTermId {
  return Object.hasOwn(GLOSSARY, value);
}

/** Pre-renders all 15 terms at build time — a fixed, known set (content/glossary.ts), not user input. */
export function generateStaticParams(): { term: string }[] {
  return Object.keys(GLOSSARY).map((term) => ({ term }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term } = await params;
  if (!isGlossaryTermId(term)) return {};

  const entry = GLOSSARY[term];
  const locale = await resolveRequestLocale();
  return {
    title: `${tc(entry.term, locale)} — Tour de Growth Glossary`,
    description: tc(entry.definition, locale),
  };
}

/**
 * `/glossary/[term]` — SPEC-ADDENDUM-02.md §3.1: one fine, indexable page
 * per glossary term, targeting long-tail searches ("what is CAC", "c'est
 * quoi un growth loop") the landing page and How it works page don't.
 */
export default async function GlossaryTermPage({ params }: PageProps) {
  const { term } = await params;
  if (!isGlossaryTermId(term)) notFound();

  const entry = GLOSSARY[term];
  const locale = await resolveRequestLocale();
  const t = UI_STRINGS.glossaryPage;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
        </div>
      </header>

      <main className={styles.main}>
        <Link href="/glossary" className={styles.backLink}>
          {tc(t.backToIndex, locale)}
        </Link>

        <h1 className={styles.title}>{tc(entry.term, locale)}</h1>

        <Card elevation="raised">
          <p className={styles.definition}>{tc(entry.definition, locale)}</p>
        </Card>

        <div className={styles.ctaRow}>
          <Button size="lg" href="/quiz">
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
          <Button size="lg" variant="secondary" href="/how-it-works">
            {tc(UI_STRINGS.nav.howItWorks, locale)}
          </Button>
        </div>
      </main>
    </>
  );
}
