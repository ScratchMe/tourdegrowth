import type { Metadata } from "next";
import Link from "next/link";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { QUESTIONS } from "@/content/copy-library";
import { CHECKLIST } from "@/content/open-door";
import { PILLARS } from "@/lib/scoring/pillars";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { contentMetadata } from "@/lib/i18n/meta";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import { articleDates } from "@/content/updated-at";
import own from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    "/growth-audit-checklist",
    tc(CHECKLIST.metaTitle, resolved),
    tc(CHECKLIST.metaDescription, resolved),
  );
}

/**
 * La page « porte ouverte » de la requête « growth audit checklist /
 * template » (`GROWTH-PLAN.md` vague 2.1).
 *
 * **Les quinze points sont rendus depuis `copy-library.ts`**, jamais
 * recopiés — même discipline que `/about`. Une seconde copie dériverait, et
 * la page décrirait alors un questionnaire qui n'existe plus. C'est aussi ce
 * qui rend cette page défendable : elle EST le questionnaire, sur papier.
 *
 * **Les points d'une réponse sont affichés ici**, contrairement au
 * questionnaire où `AnswerOption` les cache (« scoring stays invisible to
 * the user »). Cette règle protège le parcours de trois minutes : voir le
 * barème en répondant fausse les réponses. Ici, la page existe pour qu'on
 * puisse se noter à la main — cacher le barème la rendrait inutilisable.
 *
 * Server Component, prérendue comme le reste des pages de contenu (R-24).
 */
export default async function ChecklistPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const byPillar = PILLARS.map((pillar) => ({ pillar, questions: QUESTIONS.filter((q) => q.pillar === pillar) }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(CHECKLIST.title, locale), path: "/growth-audit-checklist" }])} />
      <JsonLd
        data={articleSchema(
          locale,
          "/growth-audit-checklist",
          tc(CHECKLIST.title, locale),
          tc(CHECKLIST.metaDescription, locale),
          articleDates("/growth-audit-checklist"),
        )}
      />
      <ProsePage
        locale={locale}
        path="/growth-audit-checklist"
        title={tc(CHECKLIST.title, locale)}
        lead={tc(CHECKLIST.intro, locale)}
      >
        <ol className={own.stages}>
          {byPillar.map(({ pillar, questions }, index) => (
            <li key={pillar} className={own.stage} data-testid={`checklist-${pillar}`}>
              <MetaLabel size="xs">
                {tc(UI_STRINGS.howItWorksPage.stageEyebrowTemplate, locale).replace("{n}", String(index + 1))}
              </MetaLabel>
              {/* Chaque étape pointe vers sa page de glossaire : la règle de
                  maillage de R2-13, appliquée d'emblée. */}
              <h2 className={own.stageName}>
                <Link href={localePath(locale, `/glossary/${pillar}`)} className={own.pillarLink}>
                  {tc(UI_STRINGS.pillars[pillar], locale)}
                </Link>
              </h2>
              <ol className={own.questions}>
                {questions.map((question) => (
                  <li key={question.id} className={own.question}>
                    <p className={own.questionText}>{tc(question.question, locale)}</p>
                    <ul className={own.options}>
                      {question.options.map((option) => (
                        <li key={option.points} className={own.option}>
                          <span className={own.points}>{option.points}</span>
                          <span>{tc(option.label, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>

        {CHECKLIST.sections.map((section) => (
          <ProseSection key={section.heading.en} heading={tc(section.heading, locale)}>
            {section.body.map((paragraph) => (
              <ProseText key={paragraph.en}>{tc(paragraph, locale)}</ProseText>
            ))}
          </ProseSection>
        ))}

        {/* Le lien réciproque vers la méthode : les deux pages répondent à
            deux intentions différentes, donc chacune envoie vers l'autre
            plutôt que de la redire (R2-13, appliqué d'emblée). */}
        <ProseSection>
          <ProseText>
            {tc(UI_STRINGS.openDoor.diagnosticLead, locale)}{" "}
            <Link href={localePath(locale, "/startup-growth-diagnostic")} data-testid="diagnostic-link">
              {tc(UI_STRINGS.openDoor.diagnosticLink, locale)}
            </Link>
          </ProseText>
        </ProseSection>

        {/* `hard` : la landing et `/quiz` vivent sous deux layouts racine
            différents, donc `next/link` préchargerait une route dynamique
            pour rien (voir `cross-root-links.test.ts`). */}
        <Callout
          tone="cta"
          action={
            <Button size="lg" href="/quiz" hard>
              {tc(CHECKLIST.ctaLabel, locale)}
            </Button>
          }
        >
          <p>{tc(CHECKLIST.ctaLead, locale)}</p>
        </Callout>
      </ProsePage>
    </>
  );
}
