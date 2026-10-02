import Link from "next/link";
import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { ZoneNav } from "@/components/game/ZoneNav";
import { REPO_URL } from "@/content/about";
import { GAME_HUB } from "@/content/game/hub";
import { GAME_META } from "@/content/game/meta";
import { GLOSSARY_TERMS, type GlossaryTermId } from "@/content/glossary-terms";
import { GAME_LEVELS_BY_PILLAR } from "@/lib/game/levels";
import type { LevelSlug } from "@/lib/game/types";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import type { Translatable } from "@/lib/i18n/translatable";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { breadcrumbSchema, gameSchema, JsonLd } from "@/lib/seo/jsonld";
import own from "./LevelPage.module.css";

/** The file the footnote points to: the model is written, and anyone can read it (plan §2.7, P19). */
const MODEL_SOURCE_URL = `${REPO_URL}/blob/main/src/lib/game/model.ts`;

/** A level's paper-world intro (`content/game/meta.ts`): the part of the page read before anything is played. */
export interface LevelIntro {
  eyebrow: Translatable;
  title: Translatable;
  lead: Translatable;
  stepsTitle: Translatable;
  steps: readonly { title: Translatable; body: Translatable }[];
  glossaryLead: Translatable;
}

/** The address of a level's page, the same for its route, its sitemap entry and the links to it. */
export function levelPath(slug: LevelSlug): string {
  return `/game/${slug}`;
}

/**
 * The link from one level's page to another level — its zone in the nav, the
 * block that closes its December (C31) — or nothing while that level is not
 * open. `?from=other_level` is the door the dashboard counts (`events.ts`).
 */
export function otherLevelHref(locale: Locale, slug: LevelSlug): string | undefined {
  const open = Object.values(GAME_LEVELS_BY_PILLAR).some((level) => level?.slug === slug && level.enabled);
  return open ? `${localePath(locale, levelPath(slug))}?from=other_level` : undefined;
}

export interface LevelPageProps {
  locale: Locale;
  slug: LevelSlug;
  /** The stage the level plays — its zone in the nav. */
  pillar: Pillar;
  intro: LevelIntro;
  /** The two glossary terms the intro links to: the level's own words. */
  glossary: readonly [GlossaryTermId, GlossaryTermId];
  /** Under the year, on paper: what the numbers are, and the link to the model's code. */
  footer: { note: string; codeLink: string };
  /** The year itself — `GameIsland`, built by the page so its slug and its copy stay typed together. */
  island: ReactNode;
}

/**
 * `/{locale}/game/{level}` — every level's page: the paper-world intro and
 * the zone nav, then the year itself (the island, a night band as wide as
 * the desk, plan §2.1), and the footnote that says what the numbers are.
 * Level 1's page until level 2 needed the same one (2026-10-01, A12.f): each
 * level's `page.tsx` now brings its intro, its glossary pair, its copy and
 * its island, and nothing else.
 *
 * Prerendered, like every content page: the intro is the indexable part of
 * the level, read by search engines and by anyone before they play (plan
 * §2.1). The flag lives in the proxy, so the page never becomes dynamic.
 *
 * The language switch carries `resume=1` (plan §3.7, P18): switching language
 * in the middle of a year is a full page load under the other locale, and the
 * island will read that flag to restore the year without asking.
 */
export function LevelPage({ locale, slug, pillar, intro, glossary, footer, island }: LevelPageProps) {
  const path = levelPath(slug);
  const meta = GAME_META[slug];
  const hubHref = localePath(locale, "/game");

  const zones = PILLARS.map((zone) => {
    const level = GAME_LEVELS_BY_PILLAR[zone];
    const current = zone === pillar;
    return {
      id: zone,
      pillar: tc(UI_STRINGS.pillars[zone], locale),
      question: tc(GAME_HUB.zones[zone].question, locale),
      current,
      // The zone being played leads back to the hub; another open level leads
      // to that level; the rest are text, « bientôt ».
      href: current ? hubHref : level?.enabled ? otherLevelHref(locale, level.slug) : undefined,
      soonLabel: level?.enabled ? undefined : tc(GAME_HUB.soon, locale),
    };
  });
  const position = PILLARS.indexOf(pillar) + 1;
  const compactLabel = `${tc(GAME_HUB.zoneCounter, locale).replace("{n}", String(position))} · ${tc(
    UI_STRINGS.pillars[pillar],
    locale,
  )} — ${tc(GAME_HUB.zones[pillar].question, locale)}`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: tc(GAME_META.hub.breadcrumb, locale), path: "/game" },
          { name: tc(meta.breadcrumb, locale), path },
        ])}
      />
      <JsonLd
        data={gameSchema(locale, {
          path,
          name: tc(intro.title, locale),
          description: tc(meta.description, locale),
        })}
      />
      <ProsePage
        locale={locale}
        path={path}
        switchQuery="resume=1"
        space="game"
        title={tc(intro.title, locale)}
        kicker={<MetaLabel size="xs">{tc(intro.eyebrow, locale)}</MetaLabel>}
        lead={tc(intro.lead, locale)}
        band={
          <>
            {island}
            <p className={own.footnote} data-testid="game-footnote">
              {footer.note}{" "}
              <a href={MODEL_SOURCE_URL} target="_blank" rel="noopener">
                {footer.codeLink}
              </a>
            </p>
          </>
        }
      >
        <ProseSection heading={tc(intro.stepsTitle, locale)}>
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
          <ProseText>
            {tc(intro.glossaryLead, locale)}{" "}
            <Link href={localePath(locale, `/glossary/${glossary[0]}`)}>{tc(GLOSSARY_TERMS[glossary[0]].term, locale)}</Link>,{" "}
            <Link href={localePath(locale, `/glossary/${glossary[1]}`)}>{tc(GLOSSARY_TERMS[glossary[1]].term, locale)}</Link>.
          </ProseText>
        </ProseSection>

        <ZoneNav label={tc(GAME_HUB.zonesTitle, locale)} items={zones} compactLabel={compactLabel} />
      </ProsePage>
    </>
  );
}
