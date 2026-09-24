import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { ZoneNav } from "@/components/game/ZoneNav";
import { GAME_HUB } from "@/content/game/hub";
import { GAME_META, RETENTION_INTRO } from "@/content/game/meta";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { GAME_LEVELS_BY_PILLAR } from "@/lib/game/levels";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { PILLARS } from "@/lib/scoring/pillars";
import { breadcrumbSchema, gameSchema, JsonLd } from "@/lib/seo/jsonld";
import frame from "../../how-it-works/page.module.css";
import { gameMetadata } from "../game-metadata";
import { GameIslandSlot } from "./GameIslandSlot";
import own from "./page.module.css";

const PATH = "/game/retention";
const PILLAR = "retention" as const;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(
    resolved,
    PATH,
    tc(GAME_META.retention.title, resolved),
    tc(GAME_META.retention.description, resolved),
  );
}

/**
 * `/{locale}/game/retention` — level 1, « S'ils reviennent ». The SHELL
 * (plan §4.2 G4a): the paper-world intro, the zone nav and the slot the
 * island will fill.
 *
 * Prerendered, like every content page: the intro is the indexable part of
 * the level, read by search engines and by anyone before they play (plan
 * §2.1). The flag lives in the proxy, so the page never becomes dynamic.
 *
 * The language switch carries `resume=1` (plan §3.7, P18): switching language
 * in the middle of a year is a full page load under the other locale, and the
 * island will read that flag to restore the year without asking.
 */
export default async function RetentionLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const intro = RETENTION_INTRO;
  const hubHref = localePath(locale, "/game");

  const zones = PILLARS.map((pillar) => {
    const level = GAME_LEVELS_BY_PILLAR[pillar];
    const current = pillar === PILLAR;
    return {
      id: pillar,
      pillar: tc(UI_STRINGS.pillars[pillar], locale),
      question: tc(GAME_HUB.zones[pillar].question, locale),
      current,
      // The zone being played leads back to the hub; the others are text.
      href: current ? hubHref : undefined,
      soonLabel: level?.enabled ? undefined : tc(GAME_HUB.soon, locale),
    };
  });
  const position = PILLARS.indexOf(PILLAR) + 1;
  const compactLabel = `${tc(GAME_HUB.zoneCounter, locale).replace("{n}", String(position))} · ${tc(
    UI_STRINGS.pillars[PILLAR],
    locale,
  )} — ${tc(GAME_HUB.zones[PILLAR].question, locale)}`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: tc(GAME_META.hub.breadcrumb, locale), path: "/game" },
          { name: tc(GAME_META.retention.breadcrumb, locale), path: PATH },
        ])}
      />
      <JsonLd
        data={gameSchema(locale, {
          path: PATH,
          name: tc(intro.title, locale),
          description: tc(GAME_META.retention.description, locale),
        })}
      />
      <ContentHeader locale={locale} path={PATH} switchQuery="resume=1" />

      <main id="main" className={frame.main}>
        <div className={frame.intro}>
          <MetaLabel size="xs">{tc(intro.eyebrow, locale)}</MetaLabel>
          <h1 className={`${frame.title} ${own.title}`}>{tc(intro.title, locale)}</h1>
          <p className={frame.subtitle}>{tc(intro.lead, locale)}</p>
        </div>

        <section className={frame.proseSection} aria-labelledby="game-steps">
          <h2 id="game-steps" className={frame.sectionTitle}>
            {tc(intro.stepsTitle, locale)}
          </h2>
          <ol className={own.steps}>
            {intro.steps.map((step, index) => (
              <li key={index} className={own.step}>
                <span className={own.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <p className={own.stepText}>
                  <strong className={own.stepTitle}>{tc(step.title, locale)}</strong> {tc(step.body, locale)}
                </p>
              </li>
            ))}
          </ol>
          <p className={frame.sectionBody}>
            {tc(intro.glossaryLead, locale)}{" "}
            <Link href={localePath(locale, "/glossary/churn")}>{tc(GLOSSARY_TERMS.churn.term, locale)}</Link>,{" "}
            <Link href={localePath(locale, "/glossary/retention")}>{tc(GLOSSARY_TERMS.retention.term, locale)}</Link>.
          </p>
        </section>

        <ZoneNav label={tc(GAME_HUB.zonesTitle, locale)} items={zones} compactLabel={compactLabel} />

        <GameIslandSlot title={tc(intro.pendingTitle, locale)} body={tc(intro.pendingBody, locale)} />
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
