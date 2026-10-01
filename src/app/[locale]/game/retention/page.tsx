import type { Metadata } from "next";
import { GAME_META, RETENTION_INTRO } from "@/content/game/meta";
import { RETENTION_CONTENT } from "@/content/game/retention";
import { resolveLevelCopy, type RetentionCopy } from "@/lib/game/copy";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { gameMetadata } from "../game-metadata";
import { GameIsland } from "../_island/GameIsland";
import type { IslandCopies } from "../_island/sides";
import { LevelPage, levelPath, otherLevelHref } from "../_level/LevelPage";

const SLUG = "retention" as const;

/**
 * What the island needs, and nothing it doesn't: the footnote is rendered by
 * the page, on the server, with the intro and the zones (which never were
 * level copy). The rest crosses as one prop, in one language (plan E3).
 */
function islandCopy(copy: RetentionCopy): IslandCopies["retention"] {
  const { footer: _footer, ...rest } = copy;
  return rest;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return gameMetadata(resolved, levelPath(SLUG), tc(GAME_META.retention.title, resolved), tc(GAME_META.retention.description, resolved));
}

/**
 * `/{locale}/game/retention` — level 1, « S'ils reviennent » (`LevelPage`).
 * Its December closes on level 2, « jouable » since 2026-10-01 (C31).
 */
export default async function RetentionLevelPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const copy = resolveLevelCopy<RetentionCopy>(RETENTION_CONTENT, locale);
  return (
    <LevelPage
      locale={locale}
      slug={SLUG}
      pillar="retention"
      intro={RETENTION_INTRO}
      glossary={["churn", "retention"]}
      footer={copy.footer}
      island={
        <GameIsland
          slug={SLUG}
          copy={islandCopy(copy)}
          locale={locale}
          nextLevelHref={otherLevelHref(locale, "acquisition")}
        />
      }
    />
  );
}
