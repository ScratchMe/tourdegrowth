import type { Metadata } from "next";
import { ACTIVATION_CONTENT } from "@/content/game/activation";
import { ACTIVATION_INTRO, GAME_META } from "@/content/game/meta";
import { resolveLevelCopy, type ActivationCopy } from "@/lib/game/copy";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { gameMetadata } from "../game-metadata";
import { GameIsland } from "../_island/GameIsland";
import type { IslandCopies } from "../_island/sides";
import { LevelPage, levelPath, nextLevelLinks } from "../_level/LevelPage";

const SLUG = "activation" as const;

/** What the island needs: everything but the footnote, which the page renders (plan E3). */
function islandCopy(copy: ActivationCopy): IslandCopies["activation"] {
  const { footer: _footer, ...rest } = copy;
  return rest;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, levelPath(SLUG), tc(GAME_META.activation.title, resolved), tc(GAME_META.activation.description, resolved));
}

/**
 * `/{locale}/game/activation` — level 3, « Comment ils comprennent ce que
 * vous apportez » (GAME-BRIEF §18, `docs/game/activation.md`), wired on
 * 2026-10-05 (A24, ACT-3). Quandi's year, on the same page as Flixo's and
 * Pédalix's (`LevelPage`); its December closes on the next level the player
 * has not finished (C75): the page hands the island every open level, the
 * island chooses.
 */
export default async function ActivationLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const copy = resolveLevelCopy<ActivationCopy>(ACTIVATION_CONTENT, locale);
  return (
    <LevelPage
      locale={locale}
      slug={SLUG}
      pillar="activation"
      intro={ACTIVATION_INTRO}
      glossary={["activation", "aha-moment"]}
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
