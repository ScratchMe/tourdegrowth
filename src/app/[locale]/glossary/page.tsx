import type { Metadata } from "next";
import Link from "next/link";
import { ProseActions, ProsePage } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
// `glossary-terms` and not `glossary`: the index shows only the term and its
// short definition. The long-form copy belongs to the term pages (R2-14).
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { breadcrumbSchema, definedTermSetSchema, JsonLd } from "@/lib/seo/jsonld";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { localePath } from "@/lib/i18n/routes";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    "/glossary",
    tc(UI_STRINGS.meta.glossaryTitle, resolved),
    tc(UI_STRINGS.meta.glossaryDescription, resolved),
  );
}

/**
 * `/glossary` index — SPEC-ADDENDUM-02.md §3.1: the glossary content
 * already written for the in-app definition popovers (content/glossary.ts)
 * doubles as long-tail SEO content once each term has its own indexable
 * page. Server Component, same locale-resolution pattern as
 * `/how-it-works` — no interactivity needed here either.
 */
export default async function GlossaryIndexPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const t = UI_STRINGS.glossaryPage;

  return (
    <>
      {/* REVIEW-02.md R2-15: the glossary as one vocabulary, and its place in the site. */}
      <JsonLd data={definedTermSetSchema(locale)} />
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(UI_STRINGS.glossaryPage.indexTitle, locale), path: "/glossary" }])} />
      <ProsePage locale={locale} path="/glossary" title={tc(t.indexTitle, locale)} lead={tc(t.indexIntro, locale)}>
        {/* ds-critique M-4: twenty-four bordered cards read as twenty-four
            things to press. A glossary is a list — ruled rows, the dashed
            route rule between them, and the whole row still one link. */}
        <ul className={styles.list}>
          {Object.entries(GLOSSARY_TERMS).map(([id, entry]) => (
            <li key={id} className={styles.row}>
              <Link href={localePath(locale, `/glossary/${id}`)} className={styles.itemLink}>
                <h2 className={styles.term}>{tc(entry.term, locale)}</h2>
                <p className={styles.definition}>{tc(entry.definition, locale)}</p>
              </Link>
            </li>
          ))}
        </ul>

        <ProseActions>
          <Button size="lg" href="/quiz" hard>
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
        </ProseActions>
      </ProsePage>
    </>
  );
}
