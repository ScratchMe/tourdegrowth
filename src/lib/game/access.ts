/**
 * The game's feature flag — GAME-BRIEF.md section 13.1.
 *
 * `GAME_ENABLED` is read on every request (server-side, never
 * `NEXT_PUBLIC_`): open only when it is exactly `"true"`, closed otherwise,
 * closed when absent — the same contract as `METRICS_PAGE_ENABLED`. Read per
 * request, but on Vercel the value itself only changes with a redeploy: a
 * changed variable reaches new deployments only (see `build-flag.ts`).
 *
 * The preview cookie lets ONE browser see the game while it stays closed for
 * everybody else. Since 2026-09-25 its value is a signature only the owner can
 * produce, set from `/admin/preview` behind the admin password
 * (`lib/owner-preview.ts`): the old public `?game=preview` opened it for
 * anyone who had read this repository. Callers verify the cookie and pass the
 * verdict here as `ownerPreview`.
 *
 * Pure and framework-free, like `resolveLocale`: the proxy and the result
 * page call it per request, `build-flag.ts` calls it at build with no preview.
 * The one other reader of `process.env.GAME_ENABLED` is `next.config.mjs`,
 * which cannot import TypeScript and inlines the same rule as "1"/"0" for the
 * footer (`next-config.test.ts` holds the two to the same answer).
 */

export type GameAccess = "open" | "closed";

export const GAME_PREVIEW_COOKIE = "tdg_game_preview";

export function resolveGameAccess({
  env,
  ownerPreview,
}: {
  env: string | undefined;
  /** Whether the request carries a VERIFIED owner preview cookie. */
  ownerPreview: boolean;
}): GameAccess {
  if (env === "true") return "open";
  if (ownerPreview) return "open";
  return "closed";
}

/**
 * Whether a locale-less path (`rest` from `splitLocalePath`) is one of the
 * game's pages: `/game` (the hub) and `/game/<level>`. `/gamers` is not.
 */
export function isGamePath(rest: string): boolean {
  return rest === "/game" || rest.startsWith("/game/");
}
