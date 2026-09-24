import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { DIAGNOSTIC } from "@/content/open-door";
import { PILLARS } from "@/lib/scoring/pillars";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { contentMetadata } from "@/lib/i18n/meta";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
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
      <ProsePage
        locale={locale}
        path="/startup-growth-diagnostic"
        title={tc(DIAGNOSTIC.title, locale)}
        lead={tc(DIAGNOSTIC.intro, locale)}
      >
        {DIAGNOSTIC.sections.map((section) => (
          <ProseSection key={section.heading.en} heading={tc(section.heading, locale)}>
            {section.body.map((paragraph) => (
              <ProseText key={paragraph.en}>{tc(paragraph, locale)}</ProseText>
            ))}
          </ProseSection>
        ))}

        {/* Maillage (R2-13, appliqué d'emblée) : les cinq étapes vers leur
            page de glossaire, et un lien vers l'artefact. */}
        <ProseSection heading={tc(UI_STRINGS.openDoor.stagesHeading, locale)}>
          <ul className={own.stageLinks} data-testid="stage-links">
            {PILLARS.map((pillar) => (
              <li key={pillar}>
                <Link href={localePath(locale, `/glossary/${pillar}`)}>
                  {tc(UI_STRINGS.pillars[pillar], locale)}
                </Link>
              </li>
            ))}
          </ul>
          <ProseText>
            {tc(UI_STRINGS.openDoor.checklistLead, locale)}{" "}
            <Link href={localePath(locale, "/growth-audit-checklist")} data-testid="checklist-link">
              {tc(UI_STRINGS.openDoor.checklistLink, locale)}
            </Link>
          </ProseText>
        </ProseSection>

        <Callout
          tone="cta"
          action={
            <Button size="lg" href="/quiz" hard>
              {tc(DIAGNOSTIC.ctaLabel, locale)}
            </Button>
          }
        >
          <p>{tc(DIAGNOSTIC.ctaLead, locale)}</p>
        </Callout>
      </ProsePage>
    </>
  );
}
