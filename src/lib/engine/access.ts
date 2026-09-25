/**
 * The growth engine's feature flag — engine spec §11.2, a copy of
 * `lib/game/access.ts` on purpose. Factoring the two into one flags module
 * is a v1.1 follow-up (§15): doing it here would touch the game's file,
 * which another chunk owns.
 *
 * `ENGINE_ENABLED` is read on every request (server-side, never
 * `NEXT_PUBLIC_`): open only when it is exactly `"true"`, closed otherwise,
 * closed when absent — the same contract as `GAME_ENABLED` and
 * `METRICS_PAGE_ENABLED`. It stays closed until the engine's copy is signed
 * off (bon à tirer nº6). Antoine tests in production with the owner preview
 * cookie, set from `/admin/preview` behind the admin password
 * (`lib/owner-preview.ts`, 2026-09-25) — the public `?engine=preview` it
 * replaced opened the page for anyone who had read this repository.
 *
 * THIS module is the only one that reads `process.env.ENGINE_ENABLED`
 * (`engine-boundary.test.ts` holds that): the proxy asks
 * `engineEnvFlag()`, the page asks `isEngineOpenAtBuild()`.
 */

export type EngineAccess = "open" | "closed";

export const ENGINE_PREVIEW_COOKIE = "tdg_engine_preview";
/** The one page behind the flag, without its locale prefix. */
export const ENGINE_PATH = "/aarrr-funnel-template";

export function resolveEngineAccess({
  env,
  ownerPreview,
}: {
  env: string | undefined;
  /** Whether the request carries a VERIFIED owner preview cookie. */
  ownerPreview: boolean;
}): EngineAccess {
  if (env === "true") return "open";
  if (ownerPreview) return "open";
  return "closed";
}

/**
 * Whether a locale-less path (`rest` from `splitLocalePath`) is the engine's
 * page. Exactly one address: the engine is a single route with a client
 * state machine (§7), so `/aarrr-funnel-template/x` is not the engine — and
 * with `dynamicParams` off under `[locale]` it is a 404 anyway.
 */
export function isEnginePath(rest: string): boolean {
  return rest === ENGINE_PATH;
}

/** The raw env value, read at call time (the proxy calls it per request). */
export function engineEnvFlag(): string | undefined {
  return process.env.ENGINE_ENABLED;
}

/**
 * Whether the flag was open when THIS page was prerendered. The page is
 * static (●): its `robots` tag and, later, the sitemap are fixed at build
 * time, while the proxy reads the flag per request. So the page stays
 * `noindex` until a build runs with the flag open — opening for good means
 * setting the variable AND redeploying, exactly as `.env.local.example` says
 * for the game. A preview cookie never makes a build indexable: a build has
 * no browser, so it holds none.
 */
export function isEngineOpenAtBuild(): boolean {
  return resolveEngineAccess({ env: engineEnvFlag(), ownerPreview: false }) === "open";
}
