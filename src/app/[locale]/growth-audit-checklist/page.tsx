import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { QUESTIONS } from "@/content/copy-library";
import { CHECKLIST } from "@/content/open-door";
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
        data={articleSchema(locale, "/growth-audit-checklist", tc(CHECKLIST.title, locale), tc(CHECKLIST.metaDescription, locale))}
      />
      <ContentHeader locale={locale} path="/growth-audit-checklist" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={`${styles.title} ${own.title}`}>{tc(CHECKLIST.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(CHECKLIST.intro, locale)}</p>
        </div>

        <ol className={own.stages}>
          {byPillar.map(({ pillar, questions }, index) => (
            <li key={pillar} className={own.stage} data-testid={`checklist-${pillar}`}>
              <MetaLabel size="xs">
                {tc(UI_STRINGS.howItWorksPage.stageEyebrowTemplate, locale).replace("{n}", String(index + 1))}
              </MetaLabel>
              {/* Chaque étape pointe vers sa page de glossaire : la règle de
                  maillage de R2-13, appliquée d'emblée. */}
              <h2 className={own.stageName}>
                <Link href={localePath(locale, `/glossary/${pillar}`)} className={styles.pillarLink}>
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
          <section key={section.heading.en} className={styles.proseSection}>
            <h2 className={styles.sectionTitle}>{tc(section.heading, locale)}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.en} className={styles.sectionBody}>
                {tc(paragraph, locale)}
              </p>
            ))}
          </section>
        ))}

        {/* Le lien réciproque vers la méthode : les deux pages répondent à
            deux intentions différentes, donc chacune envoie vers l'autre
            plutôt que de la redire (R2-13, appliqué d'emblée). */}
        <section className={styles.proseSection}>
          <p className={styles.sectionBody}>
            {tc(UI_STRINGS.openDoor.diagnosticLead, locale)}{" "}
            <Link href={localePath(locale, "/startup-growth-diagnostic")} data-testid="diagnostic-link">
              {tc(UI_STRINGS.openDoor.diagnosticLink, locale)}
            </Link>
          </p>
        </section>

        <Card tone="paper" className={styles.limitationCard}>
          <p className={styles.limitationText}>{tc(CHECKLIST.ctaLead, locale)}</p>
        </Card>

        <div className={styles.ctaWrap}>
          {/* `hard` : la landing et `/quiz` vivent sous deux layouts racine
              différents, donc `next/link` préchargerait une route dynamique
              pour rien (voir `cross-root-links.test.ts`). */}
          <Button size="lg" href="/quiz" hard>
            {tc(CHECKLIST.ctaLabel, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
