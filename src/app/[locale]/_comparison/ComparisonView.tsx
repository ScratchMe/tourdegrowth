import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { COMPARISON_ORDER, COMPARISONS, type ComparisonSlug } from "@/content/comparisons";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import styles from "../how-it-works/page.module.css";
import own from "./comparison.module.css";

/**
 * Le rendu partagé des quatre pages « AARRR vs X » (`GROWTH-PLAN.md` vague
 * 2.3). Les quatre routes sont des fichiers de dix lignes qui appellent
 * ceci ; le contenu vit dans `content/comparisons.ts`.
 *
 * **Quatre dossiers de route plutôt qu'un segment dynamique.** Un
 * `[comparison]` à la racine de `[locale]` entrerait en collision avec
 * `glossary`, `about` et tous les autres segments statiques. Et le slug plat
 * est le point : la requête se tape « aarrr vs rarra », donc l'URL doit être
 * `/en/aarrr-vs-rarra` et pas `/en/compare/aarrr-vs-rarra` — c'est la
 * convention que les deux pages « porte ouverte » ont déjà posée
 * (`/growth-audit-checklist`). Aucun `/compare` orphelin non plus.
 *
 * **Le tableau côte à côte n'est pas un `<table>`.** Trois colonnes de prose
 * à 390 px donnent environ 114 px par colonne, ce qui n'est pas lisible ;
 * et les parades habituelles (en-têtes masqués, libellés injectés en
 * `::before`) mettent du texte dans la CSS, où il ne se traduit pas. Chaque
 * ligne est donc un `<h3>` suivi de deux blocs qui portent le nom du cadre
 * en clair — côte à côte en desktop, empilés en mobile, et le nom reste lu
 * même quand l'en-tête a défilé.
 *
 * Server Component, prérendu comme le reste des pages de contenu (R-24).
 */
export function ComparisonView({ slug, locale }: { slug: ComparisonSlug; locale: Locale }) {
  const entry = COMPARISONS[slug];
  const t = UI_STRINGS.comparisonPage;
  const others = COMPARISON_ORDER.filter((id) => id !== slug);

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(COMPARISONS[slug].title, locale), path: `/${slug}` }])} />
      <JsonLd data={articleSchema(locale, `/${slug}`, tc(entry.title, locale), tc(entry.metaDescription, locale))} />
      <ContentHeader locale={locale} path={`/${slug}`} />

      <main id="main" className={styles.main}>
        <div className={styles.intro}>
          <h1 className={`${styles.title} ${own.title}`}>{tc(entry.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(entry.intro, locale)}</p>
        </div>

        <section className={styles.proseSection} data-testid="comparison-table">
          <h2 className={styles.sectionTitle}>{tc(t.atAGlance, locale)}</h2>
          <div className={own.rows}>
            {entry.rows.map((row) => (
              <div key={row.aspect.en} className={own.row}>
                <h3 className={own.aspect}>{tc(row.aspect, locale)}</h3>
                <div className={own.sides}>
                  <div className={own.side}>
                    <MetaLabel size="xs">AARRR</MetaLabel>
                    <p className={own.sideBody}>{tc(row.aarrr, locale)}</p>
                  </div>
                  <div className={own.side}>
                    <MetaLabel size="xs">{tc(entry.other, locale)}</MetaLabel>
                    <p className={own.sideBody}>{tc(row.other, locale)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {entry.sections.map((section) => (
          <section key={section.heading.en} className={styles.proseSection}>
            <h2 className={styles.sectionTitle}>{tc(section.heading, locale)}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.en} className={styles.sectionBody}>
                {tc(paragraph, locale)}
              </p>
            ))}
          </section>
        ))}

        {/* La page doit trancher plutôt que renvoyer les deux cadres dos à
            dos — c'est la seule chose qu'un lecteur venu d'une requête
            comparative cherche vraiment. */}
        <section className={styles.proseSection} data-testid="comparison-verdict">
          <h2 className={styles.sectionTitle}>{tc(t.verdictHeading, locale)}</h2>
          <Card elevation="raised">
            <p className={own.verdict}>{tc(entry.verdict, locale)}</p>
          </Card>
        </section>

        {/* GROWTH-PLAN.md 2.4 : chaque page sort vers le glossaire et vers
            les trois autres comparaisons, donc le cluster est parcourable
            depuis n'importe laquelle de ses quatre entrées. */}
        <section className={styles.proseSection} data-testid="comparison-glossary">
          <h2 className={styles.sectionTitle}>{tc(t.glossaryHeading, locale)}</h2>
          <div className={own.linkRow}>
            {entry.glossary.map((id) => (
              <Link key={id} href={localePath(locale, `/glossary/${id}`)} className={own.pill}>
                {tc(GLOSSARY_TERMS[id].term, locale)}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.proseSection} data-testid="other-comparisons">
          <h2 className={styles.sectionTitle}>{tc(t.othersHeading, locale)}</h2>
          <div className={own.linkRow}>
            {others.map((id) => (
              <Link key={id} href={localePath(locale, `/${id}`)} className={own.pill}>
                {tc(COMPARISONS[id].title, locale)}
              </Link>
            ))}
          </div>
        </section>

        <Card tone="paper" className={styles.limitationCard}>
          <p className={styles.limitationText}>{tc(t.ctaLead, locale)}</p>
        </Card>

        <div className={styles.ctaWrap}>
          {/* `hard` : les pages de contenu et `/quiz` vivent sous deux layouts
              racine différents, donc `next/link` préchargerait une route
              dynamique pour rien (voir `cross-root-links.test.ts`). */}
          <Button size="lg" href="/quiz" hard>
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
