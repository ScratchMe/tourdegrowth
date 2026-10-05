import type { Metadata } from "next";
import { REFERRAL_CONTENT } from "@/content/game/referral";
import { REFERRAL_INTRO, GAME_META } from "@/content/game/meta";
import { resolveLevelCopy, type ReferralCopy } from "@/lib/game/copy";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { gameMetadata } from "../game-metadata";
import { GameIsland } from "../_island/GameIsland";
import type { IslandCopies } from "../_island/sides";
import { LevelPage, levelPath, nextLevelLinks } from "../_level/LevelPage";

const SLUG = "referral" as const;

/** What the island needs: everything but the footnote, which the page renders (plan E3). */
function islandCopy(copy: ReferralCopy): IslandCopies["referral"] {
  const { footer: _footer, ...rest } = copy;
  return rest;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, levelPath(SLUG), tc(GAME_META.referral.title, resolved), tc(GAME_META.referral.description, resolved));
}

/**
 * `/{locale}/game/referral` — level 4, « S'ils vous recommandent » (GAME-BRIEF
 * §19, `docs/game/referral.md`), wired on 2026-10-05 (A24, REF-3). Partix's
 * year, on the same page as Flixo's, Pédalix's and Quandi's (`LevelPage`); its
 * December closes on the next level the player has not finished (C75): the
 * page hands the island every open level, the island chooses.
 */
export default async function ReferralLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const copy = resolveLevelCopy<ReferralCopy>(REFERRAL_CONTENT, locale);
  return (
    <LevelPage
      locale={locale}
      slug={SLUG}
      pillar="referral"
      intro={REFERRAL_INTRO}
      glossary={["referral", "viral-coefficient"]}
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
