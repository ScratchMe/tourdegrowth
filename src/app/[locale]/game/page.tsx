import type { Metadata } from "next";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { GAME_HUB } from "@/content/game/hub";
import { GAME_META } from "@/content/game/meta";
import { GAME_LEVELS_BY_PILLAR } from "@/lib/game/levels";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { PILLARS } from "@/lib/scoring/pillars";
import { breadcrumbSchema, gameHubSchema, JsonLd } from "@/lib/seo/jsonld";
import { gameMetadata } from "./game-metadata";
import { HubProgress } from "./HubProgress";
import { PlayLevelLink } from "./PlayLevelLink";
import own from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, "/game", tc(GAME_META.hub.title, resolved), tc(GAME_META.hub.description, resolved));
}

/**
 * `/{locale}/game` — the hub of « Le côté obscur » (GAME-BRIEF 11.5).
 *
 * A prerendered Server Component, like every content page (R-24): the flag
 * is enforced in the proxy, which rewrites a closed game to the localized 404
 * without the page itself ever becoming dynamic. The two islands are the
 * play button (one analytics event) and the ending reached on this device.
 *
 * The five zones are listed in AARRR order; only a zone with an enabled level
 * carries a link (X19). The others say « bientôt » in words — the state is
 * never carried by colour or by a dashed border alone.
 */
export default async function GameHubPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const endingLabels = Object.fromEntries(
    Object.entries(GAME_HUB.endings).map(([id, label]) => [id, tc(label, locale)]),
  ) as Record<keyof typeof GAME_HUB.endings, string>;

  const playable = PILLARS.flatMap((pillar) => {
    const level = GAME_LEVELS_BY_PILLAR[pillar];
    return level?.enabled ? [{ pillar, slug: level.slug }] : [];
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(GAME_META.hub.breadcrumb, locale), path: "/game" }])} />
      <JsonLd
        data={gameHubSchema(locale, {
          path: "/game",
          name: tc(GAME_HUB.title, locale),
          description: tc(GAME_META.hub.description, locale),
          levels: playable.map(({ slug }) => ({
            path: `/game/${slug}`,
            name: tc(GAME_META[slug].breadcrumb, locale),
          })),
        })}
      />
      <ProsePage
        locale={locale}
        path="/game"
        title={tc(GAME_HUB.title, locale)}
        kicker={<MetaLabel size="xs">{tc(GAME_HUB.eyebrow, locale)}</MetaLabel>}
        lead={tc(GAME_HUB.lead, locale)}
      >
        <ProseSection heading={tc(GAME_HUB.zonesTitle, locale)}>
          <ol className={own.zones} data-testid="game-hub-zones">
            {PILLARS.map((pillar, index) => {
              const level = GAME_LEVELS_BY_PILLAR[pillar];
              const open = level?.enabled === true;
              const zone = GAME_HUB.zones[pillar];
              return (
                <li
                  key={pillar}
                  className={`${own.zone} ${open ? own.zoneOpen : own.zoneSoon}`}
                  data-testid={`game-hub-zone-${pillar}`}
                >
                  <MetaLabel size="xs">
                    {tc(GAME_HUB.zoneCounter, locale).replace("{n}", String(index + 1))} ·{" "}
                    {tc(open ? GAME_HUB.playable : GAME_HUB.soon, locale)}
                  </MetaLabel>
                  <h3 className={own.zoneName}>
                    {/* Orchestrator decision 4: both names — the Tour's, then the game's. */}
                    {tc(UI_STRINGS.pillars[pillar], locale)} — {tc(zone.question, locale)}
                  </h3>
                  <p className={own.company}>{tc(zone.company, locale)}</p>
                  {open && level && (
                    <div className={own.play}>
                      <HubProgress
                        slug={level.slug}
                        locale={locale}
                        template={tc(GAME_HUB.lastEnding, locale)}
                        endingLabels={endingLabels}
                        className={own.progress}
                      />
                      <PlayLevelLink href={`${localePath(locale, `/game/${level.slug}`)}?from=hub`} slug={level.slug}>
                        {tc(GAME_HUB.play, locale)}
                      </PlayLevelLink>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </ProseSection>

        {/* GAME-BRIEF 11.5 and 13.3 D: the way back to the Tour, for those who
            arrived by the game. A bare anchor — `/quiz` is under the other
            root layout (cross-root-links.test.ts). Secondary: the play button
            is this screen's one primary. */}
        <ProseSection heading={tc(GAME_HUB.tourLoopTitle, locale)} data-testid="game-tour-loop">
          <ProseText>{tc(GAME_HUB.tourLoopBody, locale)}</ProseText>
          <div>
            <Button href="/quiz" hard variant="secondary">
              {tc(GAME_HUB.tourLoopCta, locale)}
            </Button>
          </div>
        </ProseSection>
      </ProsePage>
    </>
  );
}
