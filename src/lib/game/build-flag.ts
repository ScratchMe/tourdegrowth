/**
 * What the game's flag was when the site was BUILT — GAME-BRIEF.md 13.1-13.2.
 *
 * `access.ts` answers per request: the proxy (the game's own routes) and the
 * result page (`readGameAccess` in `app/(app)/r/[id]/page.tsx`, the entry
 * card) call it with `process.env.GAME_ENABLED` on every hit — which is what
 * lets the preview cookie work, since the cookie is per request. Some surfaces
 * cannot ask per request because they are decided at build time: the sitemap
 * and the prerendered pages' hreflang and robots (through this module), and
 * the footer link (through the "1"/"0" `next.config.mjs` inlines — the footer
 * is also rendered by the error boundaries, which are Client Components and
 * cannot read a server variable, the dead end `/metrics` hit on 2026-09-07).
 *
 * "Read per request" does NOT mean "flips without a redeploy". On Vercel a
 * changed environment variable only reaches new deployments; the running one
 * keeps the value it was deployed with. So any change to `GAME_ENABLED` —
 * opening the game, or closing it in a hurry — takes a redeploy, and that
 * redeploy moves the per-request readers and the build-time ones together.
 * The "built open, closed at runtime" split only exists locally, when
 * `next start` runs with a different variable than `next build` saw.
 *
 * One rule, not two: "open at build" is `resolveGameAccess` with no preview
 * cookie. A build has no browser, so it cannot hold one.
 */
import type { Metadata } from "next";
import { resolveGameAccess } from "./access";
import { enabledLevelSlugs, GAME_LEVELS_BY_PILLAR, type GameLevelTable } from "./levels";

/**
 * The only form in which the flag reaches client code: a derived "1"/"0",
 * inlined by `next.config.mjs` (`env`). `GAME_ENABLED` itself is never exposed
 * (13.1: server-side, never `NEXT_PUBLIC_`).
 */
export const GAME_OPEN_AT_BUILD_ENV = "TDG_GAME_OPEN_AT_BUILD";

/**
 * The rule, pure: open for exactly this value of `GAME_ENABLED`. Separate from
 * `isGameOpenAtBuild` rather than a defaulted parameter, because a default
 * also applies to an explicit `undefined` — "the variable is absent" would
 * then silently read the real environment instead.
 */
export function gameOpenWith(env: string | undefined): boolean {
  return resolveGameAccess({ env, ownerPreview: false }) === "open";
}

/** The flag as this build sees it. */
export function isGameOpenAtBuild(): boolean {
  return gameOpenWith(process.env.GAME_ENABLED);
}

/**
 * The locale-less paths the sitemap lists (9.3): the hub and every enabled
 * level — nothing at all while the game is closed at build, so a closed game
 * never advertises a URL that answers 404.
 */
export function gameSitemapPaths(open: boolean, levels: GameLevelTable = GAME_LEVELS_BY_PILLAR): string[] {
  if (!open) return [];
  return ["/game", ...enabledLevelSlugs(levels).map((slug) => `/game/${slug}`)];
}

/**
 * Belt and braces for the prerendered game pages (X18): the proxy already
 * answers 404 to anyone without the preview cookie, but a page built closed
 * and fetched with the cookie must not ask to be indexed either. `follow:
 * false` too — nothing on an unannounced page is meant to pass signal yet.
 */
export function gamePageRobots(open: boolean): Metadata["robots"] {
  return open ? undefined : { index: false, follow: false };
}
