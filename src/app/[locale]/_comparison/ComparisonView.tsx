import Link from "next/link";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { COMPARISON_ORDER, COMPARISONS, type ComparisonSlug } from "@/content/comparisons";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import { articleDates } from "@/content/updated-at";
import own from "./comparison.module.css";

/**
 * Le rendu partagé des pages « AARRR vs X » (`GROWTH-PLAN.md` vague 2.3, et
 * HEART, cinquième, ajoutée par l'audit SEO v1 §3.1). Chaque route est un
 * fichier de dix lignes qui appelle ceci ; le contenu vit dans
 * `content/comparisons.ts`.
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
 * en clair — et le nom reste lu même quand l'en-tête a défilé. Visuellement
 * c'est pourtant un tableau à filets (ds-critique M-4) : huit cellules
 * encadrées se lisaient comme huit boutons, pas comme quatre lignes.
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
      <JsonLd
        data={articleSchema(locale, `/${slug}`, tc(entry.title, locale), tc(entry.metaDescription, locale), articleDates(`/${slug}`))}
      />
      <ProsePage locale={locale} path={`/${slug}`} title={tc(entry.title, locale)} lead={tc(entry.intro, locale)}>
        <ProseSection heading={tc(t.atAGlance, locale)} data-testid="comparison-table">
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
        </ProseSection>

        {entry.sections.map((section) => (
          <ProseSection key={section.heading.en} heading={tc(section.heading, locale)}>
            {section.body.map((paragraph) => (
              <ProseText key={paragraph.en}>{tc(paragraph, locale)}</ProseText>
            ))}
          </ProseSection>
        ))}

        {/* La page doit trancher plutôt que renvoyer les deux cadres dos à
            dos — c'est la seule chose qu'un lecteur venu d'une requête
            comparative cherche vraiment. Le seul élément surélevé de la page. */}
        <ProseSection heading={tc(t.verdictHeading, locale)} data-testid="comparison-verdict">
          <Card elevation="raised">
            <p className={own.verdict}>{tc(entry.verdict, locale)}</p>
          </Card>
        </ProseSection>

        {/* GROWTH-PLAN.md 2.4 : chaque page sort vers le glossaire et vers
            toutes les autres comparaisons, donc le cluster est parcourable
            depuis n'importe laquelle de ses entrées. */}
        <ProseSection heading={tc(t.glossaryHeading, locale)} data-testid="comparison-glossary">
          <div className={own.linkRow}>
            {entry.glossary.map((id) => (
              <Link key={id} href={localePath(locale, `/glossary/${id}`)} className={own.pill}>
                {tc(GLOSSARY_TERMS[id].term, locale)}
              </Link>
            ))}
          </div>
        </ProseSection>

        <ProseSection heading={tc(t.othersHeading, locale)} data-testid="other-comparisons">
          <div className={own.linkRow}>
            {others.map((id) => (
              <Link key={id} href={localePath(locale, `/${id}`)} className={own.pill}>
                {tc(COMPARISONS[id].title, locale)}
              </Link>
            ))}
          </div>
        </ProseSection>

        {/* `hard` : les pages de contenu et `/quiz` vivent sous deux layouts
            racine différents, donc `next/link` préchargerait une route
            dynamique pour rien (voir `cross-root-links.test.ts`). */}
        <Callout
          tone="cta"
          action={
            <Button size="lg" href="/quiz" hard>
              {tc(UI_STRINGS.landing.ctaPrimary, locale)}
            </Button>
          }
        >
          <p>{tc(t.ctaLead, locale)}</p>
        </Callout>
      </ProsePage>
    </>
  );
}
