/**
 * The game's feature flag — GAME-BRIEF.md section 13.1.
 *
 * `GAME_ENABLED` is read on every request (server-side, never
 * `NEXT_PUBLIC_`): open only when it is exactly `"true"`, closed otherwise,
 * closed when absent — the same contract as `METRICS_PAGE_ENABLED`. Read per
 * request, but on Vercel the value itself only changes with a redeploy: a
 * changed variable reaches new deployments only (see `build-flag.ts`).
 *
 * The preview cookie lets one browser see the game while it stays closed for
 * everybody else: `?game=preview` on any URL sets it (in the proxy),
 * `?game=off` clears it. That is how Antoine tests in production while the
 * feature is being polished.
 *
 * Pure and framework-free, like `resolveLocale`: the proxy and the result
 * page call it per request, `build-flag.ts` calls it at build with no cookie.
 * The one other reader of `process.env.GAME_ENABLED` is `next.config.mjs`,
 * which cannot import TypeScript and inlines the same rule as "1"/"0" for the
 * footer (`next-config.test.ts` holds the two to the same answer).
 */

export type GameAccess = "open" | "closed";

export const GAME_PREVIEW_COOKIE = "tdg_game_preview";
export const GAME_PREVIEW_PARAM = "game";

export function resolveGameAccess({
  env,
  cookie,
}: {
  env: string | undefined;
  cookie: string | null | undefined;
}): GameAccess {
  if (env === "true") return "open";
  if (cookie === "1") return "open";
  return "closed";
}

/**
 * What `?game=` asks for. Anything but the two exact values is ignored, so a
 * stray parameter never changes anyone's access.
 */
export function previewRequest(param: string | null): "preview" | "off" | null {
  if (param === "preview") return "preview";
  if (param === "off") return "off";
  return null;
}

/**
 * Whether a locale-less path (`rest` from `splitLocalePath`) is one of the
 * game's pages: `/game` (the hub) and `/game/<level>`. `/gamers` is not.
 */
export function isGamePath(rest: string): boolean {
  return rest === "/game" || rest.startsWith("/game/");
}
