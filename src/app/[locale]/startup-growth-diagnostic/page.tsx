import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { DIAGNOSTIC } from "@/content/open-door";
import { PILLARS } from "@/lib/scoring/pillars";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { contentMetadata } from "@/lib/i18n/meta";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import styles from "../how-it-works/page.module.css";
import own from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    "/startup-growth-diagnostic",
    tc(DIAGNOSTIC.metaTitle, resolved),
    tc(DIAGNOSTIC.metaDescription, resolved),
  );
}

/**
 * La page « porte ouverte » de la requête « diagnostic croissance startup »
 * (`GROWTH-PLAN.md` vague 2.1).
 *
 * **Elle ne redit pas la checklist.** L'autre page est l'ARTEFACT (les
 * quinze points, le barème) ; celle-ci est la MÉTHODE (par quoi commencer,
 * dans quel ordre, ce qu'un diagnostic doit produire). Les livrer comme deux
 * variantes du même texte ferait deux quasi-doublons, ce qui vaut moins que
 * rien en référencement — c'est pour ça qu'elles se lient l'une à l'autre au
 * lieu de se répéter.
 */
export default async function DiagnosticPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(DIAGNOSTIC.title, locale), path: "/startup-growth-diagnostic" }])} />
      <JsonLd
        data={articleSchema(
          locale,
          "/startup-growth-diagnostic",
          tc(DIAGNOSTIC.title, locale),
          tc(DIAGNOSTIC.metaDescription, locale),
        )}
      />
      <ContentHeader locale={locale} path="/startup-growth-diagnostic" />

      <main id="main" className={styles.main}>
        <div className={styles.intro}>
          <h1 className={`${styles.title} ${own.title}`}>{tc(DIAGNOSTIC.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(DIAGNOSTIC.intro, locale)}</p>
        </div>

        {DIAGNOSTIC.sections.map((section) => (
          <section key={section.heading.en} className={styles.proseSection}>
            <h2 className={styles.sectionTitle}>{tc(section.heading, locale)}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.en} className={styles.sectionBody}>
                {tc(paragraph, locale)}
              </p>
            ))}
          </section>
        ))}

        {/* Maillage (R2-13, appliqué d'emblée) : les cinq étapes vers leur
            page de glossaire, et un lien vers l'artefact. */}
        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(UI_STRINGS.openDoor.stagesHeading, locale)}</h2>
          <ul className={own.stageLinks} data-testid="stage-links">
            {PILLARS.map((pillar) => (
              <li key={pillar}>
                <Link href={localePath(locale, `/glossary/${pillar}`)} className={styles.pillarLink}>
                  {tc(UI_STRINGS.pillars[pillar], locale)}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.sectionBody}>
            {tc(UI_STRINGS.openDoor.checklistLead, locale)}{" "}
            <Link href={localePath(locale, "/growth-audit-checklist")} data-testid="checklist-link">
              {tc(UI_STRINGS.openDoor.checklistLink, locale)}
            </Link>
          </p>
        </section>

        <Card tone="paper" className={styles.limitationCard}>
          <p className={styles.limitationText}>{tc(DIAGNOSTIC.ctaLead, locale)}</p>
        </Card>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz" hard>
            {tc(DIAGNOSTIC.ctaLabel, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
