import type { Metadata } from "next";
import { gamePageRobots, isGameOpenAtBuild } from "@/lib/game/build-flag";
import type { Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";

/**
 * `generateMetadata` for the game's pages: the usual content-page metadata
 * when the game is open at build, and when it is closed, no hreflang set and
 * `noindex, nofollow` (GAME-BRIEF 13.2, X18).
 *
 * The proxy already answers 404 to anyone without the preview cookie, so this
 * is belt and braces — but these pages are PRERENDERED with whatever flag the
 * build saw, and a page built closed and opened with the cookie must neither
 * ask to be indexed nor declare alternates of URLs that 404 for everyone else.
 */
export function gameMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  open: boolean = isGameOpenAtBuild(),
): Metadata {
  const base = contentMetadata(locale, path, title, description);
  if (open) return base;
  const { alternates: _hreflang, ...closed } = base;
  return { ...closed, robots: gamePageRobots(false) };
}
