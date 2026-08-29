import { PROFILE_CLICK_DETAILS } from "./goatcounter";

// Server-only — never import this from a "use client" component.
// GOATCOUNTER_API_TOKEN is a GoatCounter API key with the "read stats"
// permission only (no site/account admin scope needed), generated in
// GoatCounter's own Settings → API. See CLAUDE.md for how it was obtained.

const PROFILE_CLICK_PATHS = PROFILE_CLICK_DETAILS.map((detail) => `profile_click/${detail}`);

export interface FunnelStats {
  /** Pageviews on "/" in the requested window. */
  homeViews: number;
  /** Sum of all profile_click/* events (SPEC-ADDENDUM-02.md §2 credit links) in the same window. */
  profileClicks: number;
  /** profileClicks / homeViews — null when there were no home views to divide by. */
  rate: number | null;
}

export interface FunnelWindow {
  label: string;
  stats: FunnelStats | null;
  /** Set (with `stats: null`) when the window couldn't be computed — a missing token, a GoatCounter API error, a network failure. Never thrown. */
  error?: string;
}

interface GoatCounterHit {
  path: string;
  count: number;
  event: boolean;
}

interface GoatCounterHitsResponse {
  hits: GoatCounterHit[];
  total: number;
  more: boolean;
}

/**
 * One window's "accueil → clic profil" numbers, straight from GoatCounter's
 * own API (`GET /api/v0/stats/hits`) — there's no funnel/conversion view
 * built into GoatCounter itself, so this is what "automated" looks like
 * here: fetch the two raw counts and divide.
 *
 * `path_by_name=true` + explicit `include_paths` (exact path names, comma-
 * separated) rather than the `filter` querystring some other GoatCounter
 * endpoints expose — a substring filter on "/" would match almost every
 * path in this app (`/quiz`, `/r/xyz`, ...), since they all contain a "/".
 * Asking for the exact names avoids that trap entirely.
 *
 * Never throws: any failure (missing config, non-2xx response, network
 * error) resolves to `stats: null` with a message in `error`, so a
 * GoatCounter outage or a not-yet-configured token never breaks the rest
 * of /admin/stats.
 */
export async function fetchFunnelWindow(startISO: string, label: string): Promise<FunnelWindow> {
  const token = process.env.GOATCOUNTER_API_TOKEN;
  const siteCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

  if (!token || !siteCode) {
    return { label, stats: null, error: "GOATCOUNTER_API_TOKEN or NEXT_PUBLIC_GOATCOUNTER_CODE is not configured." };
  }

  const url = new URL(`https://${siteCode}.goatcounter.com/api/v0/stats/hits`);
  url.searchParams.set("path_by_name", "true");
  url.searchParams.set("include_paths", ["/", ...PROFILE_CLICK_PATHS].join(","));
  url.searchParams.set("start", startISO);
  url.searchParams.set("end", new Date().toISOString());
  url.searchParams.set("limit", "10"); // at most 4 distinct paths are ever requested — this never paginates

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    return { label, stats: null, error: err instanceof Error ? err.message : "Network error calling the GoatCounter API." };
  }

  if (!response.ok) {
    return { label, stats: null, error: `GoatCounter API returned ${response.status}.` };
  }

  const body = (await response.json()) as GoatCounterHitsResponse;

  let homeViews = 0;
  let profileClicks = 0;
  for (const hit of body.hits ?? []) {
    if (hit.path === "/") homeViews += hit.count;
    else if (hit.path.startsWith("profile_click/")) profileClicks += hit.count;
  }

  return {
    label,
    stats: { homeViews, profileClicks, rate: homeViews > 0 ? profileClicks / homeViews : null },
  };
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// Well before this project existed — the simplest stand-in for "all-time"
// without relying on whatever GoatCounter would default to if `start` were
// omitted entirely.
const ALL_TIME_START = "2024-01-01T00:00:00Z";

/** All-time and last-30-days windows, mirroring the two horizons already shown for the Firestore numbers in /admin/stats. */
export async function fetchFunnelStats(): Promise<FunnelWindow[]> {
  const last30Start = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
  return Promise.all([
    fetchFunnelWindow(ALL_TIME_START, "All-time"),
    fetchFunnelWindow(last30Start, "Last 30 days"),
  ]);
}
