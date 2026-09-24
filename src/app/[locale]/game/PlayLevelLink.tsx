"use client";

import { Button } from "@/components/core/Button";
import { trackEvent } from "@/lib/analytics/goatcounter";
import type { LevelSlug } from "@/lib/game/types";

export interface PlayLevelLinkProps {
  href: string;
  slug: LevelSlug;
  children: string;
}

/**
 * The hub's "play" button, and the one reason it is a client island: the
 * click is an entry into the game, measured as `game_entry_clicked/hub`
 * (GAME-BRIEF 9.6 and 13.3 C). The name and detail are the vocabulary
 * `lib/game/events.ts` declares; the hub page itself stays a prerendered
 * Server Component.
 *
 * `next/link` (via `Button`), not a bare anchor: the hub and the level share
 * the `[locale]` root layout, so this is a client navigation and its prefetch
 * is what makes the click instant — the rule `cross-root-links.test.ts`
 * enforces only applies to links that CROSS a root layout.
 */
export function PlayLevelLink({ href, slug, children }: PlayLevelLinkProps) {
  return (
    <Button href={href} data-testid={`game-hub-level-${slug}`} onClick={() => trackEvent("game_entry_clicked", "hub")}>
      {children}
    </Button>
  );
}
