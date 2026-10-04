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
 * `engineEnvFlag()`, the page asks `isEngineOpenAtBuild()`. The same goes for
 * `ENGINE_TYPES`, the business types open in a build (§21.3): `engineTypesFlag()`
 * and `openTypesAtBuild()`.
 */

import { ALWAYS_OPEN_TYPE, BUSINESS_TYPES } from "./setup-type";
import type { BusinessType } from "./types";

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
 * Whether a locale-less path (`rest` from `splitLocalePath`) is the engine's:
 * its page, and everything under it — today its share image
 * (`/aarrr-funnel-template/opengraph-image/<locale>`, design brief 06), which
 * must 404 with the page while the engine is closed, as the game's images do
 * (`isGamePath`). Any other address under it is a 404 anyway (`dynamicParams`
 * is off under `[locale]`).
 */
export function isEnginePath(rest: string): boolean {
  return rest === ENGINE_PATH || rest.startsWith(`${ENGINE_PATH}/`);
}

/** The raw env value, read at call time (the proxy calls it per request). */
export function engineEnvFlag(): string | undefined {
  return process.env.ENGINE_ENABLED;
}

/**
 * The name under which `next.config.mjs` inlines the flag as it stood at
 * build — a derived "1"/"0" for client code (the space band), never
 * `ENGINE_ENABLED` itself.
 */
export const ENGINE_OPEN_AT_BUILD_ENV = "TDG_ENGINE_OPEN_AT_BUILD";

/** The rule, pure: open for exactly this value of `ENGINE_ENABLED`. See `gameOpenWith` for why it is not a default parameter. */
export function engineOpenWith(env: string | undefined): boolean {
  return resolveEngineAccess({ env, ownerPreview: false }) === "open";
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
  return engineOpenWith(engineEnvFlag());
}

/** The raw ENGINE_TYPES value: a comma-separated list of extra business types (§21.3). */
export function engineTypesFlag(): string | undefined {
  return process.env.ENGINE_TYPES;
}

/**
 * The business types open in THIS build: always b2b-saas, plus each known
 * type listed in ENGINE_TYPES (comma-separated, spaces ignored, unknown names
 * ignored, duplicates once), in BUSINESS_TYPES order. Pure on its input.
 */
export function openTypesWith(env: string | undefined): BusinessType[] {
  const listed = new Set((env ?? "").split(",").map((name) => name.trim()));
  return BUSINESS_TYPES.filter((type) => type === ALWAYS_OPEN_TYPE || listed.has(type));
}

/** Read at build by the page, never by the island: the page is static (●). */
export function openTypesAtBuild(): BusinessType[] {
  return openTypesWith(engineTypesFlag());
}
