import type { Metadata } from "next";
import { REVENUE_CONTENT } from "@/content/game/revenue";
import { REVENUE_INTRO, GAME_META } from "@/content/game/meta";
import { resolveLevelCopy, type RevenueCopy } from "@/lib/game/copy";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { gameMetadata } from "../game-metadata";
import { GameIsland } from "../_island/GameIsland";
import type { IslandCopies } from "../_island/sides";
import { LevelPage, levelPath, nextLevelLinks } from "../_level/LevelPage";

const SLUG = "revenue" as const;

/** What the island needs: everything but the footnote, which the page renders (plan E3). */
function islandCopy(copy: RevenueCopy): IslandCopies["revenue"] {
  const { footer: _footer, ...rest } = copy;
  return rest;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, levelPath(SLUG), tc(GAME_META.revenue.title, resolved), tc(GAME_META.revenue.description, resolved));
}

/**
 * `/{locale}/game/revenue` — level 5, « Comment vous gagnez de l'argent »
 * (GAME-BRIEF §20, `docs/game/revenue.md`), wired on 2026-10-06 (A24, REV-3).
 * Gainix's year, on the same page as Flixo's, Pédalix's, Quandi's and
 * Partix's (`LevelPage`); its
 * December closes on the next level the player has not finished (C75): the
 * page hands the island every open level, the island chooses.
 */
export default async function RevenueLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const copy = resolveLevelCopy<RevenueCopy>(REVENUE_CONTENT, locale);
  return (
    <LevelPage
      locale={locale}
      slug={SLUG}
      pillar="revenue"
      intro={REVENUE_INTRO}
      glossary={["revenue", "arpu"]}
      footer={copy.footer}
      island={
        <GameIsland
          slug={SLUG}
          copy={islandCopy(copy)}
          locale={locale}
          nextLevels={nextLevelLinks(locale, SLUG)}
        />
      }
    />
  );
}
