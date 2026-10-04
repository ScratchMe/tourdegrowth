import type { Metadata } from "next";
import { ACQUISITION_CONTENT } from "@/content/game/acquisition";
import { ACQUISITION_INTRO, GAME_META } from "@/content/game/meta";
import { resolveLevelCopy, type AcquisitionCopy } from "@/lib/game/copy";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { gameMetadata } from "../game-metadata";
import { GameIsland } from "../_island/GameIsland";
import type { IslandCopies } from "../_island/sides";
import { LevelPage, levelPath, nextLevelLinks } from "../_level/LevelPage";

const SLUG = "acquisition" as const;

/** What the island needs: everything but the footnote, which the page renders (plan E3). */
function islandCopy(copy: AcquisitionCopy): IslandCopies["acquisition"] {
  const { footer: _footer, ...rest } = copy;
  return rest;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, levelPath(SLUG), tc(GAME_META.acquisition.title, resolved), tc(GAME_META.acquisition.description, resolved));
}

/**
 * `/{locale}/game/acquisition` — level 2, « Comment les gens vous trouvent »
 * (GAME-BRIEF §17, `docs/game/niveau-2.md`), wired on 2026-10-01 (A12.f).
 * Pédalix's year, on the same page as Flixo's (`LevelPage`); its December
 * closes on the next level the player has not finished (C75): the page hands
 * the island every open level, the island chooses.
 */
export default async function AcquisitionLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const copy = resolveLevelCopy<AcquisitionCopy>(ACQUISITION_CONTENT, locale);
  return (
    <LevelPage
      locale={locale}
      slug={SLUG}
      pillar="acquisition"
      intro={ACQUISITION_INTRO}
      glossary={["acquisition", "cac"]}
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
