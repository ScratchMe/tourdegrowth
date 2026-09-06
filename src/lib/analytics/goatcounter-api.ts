import {
  DEEP_DIVE_CONTEXT_DETAILS,
  PROFILE_CLICK_DETAILS,
  QUIZ_STAGES,
  SHARE_METHODS,
  TONES,
  OWN_TOUR_EVENT,
} from "./goatcounter";

// Server-only — never import this from a "use client" component.
// GOATCOUNTER_API_TOKEN is a GoatCounter API key with the "read stats"
// permission only (no site/account admin scope needed), generated in
// GoatCounter's own Settings → API. See CLAUDE.md for how it was obtained.

/**
 * Every exact event path the dashboard asks GoatCounter for — REVIEW.md
 * R-11. Built from the shared vocabulary in `goatcounter.ts` rather than
 * retyped, because `include_paths` matches names exactly: a path spelled
 * differently here than at the call site is simply invisible in the
 * dashboard, with no error anywhere.
 */
/**
 * The landing page's paths. Since REVIEW.md R-13 the homepage lives at `/en`
 * and `/fr` (with `/` redirecting), so counting only "/" would have silently
 * zeroed the funnel's first step. The bare "/" stays for hits recorded
 * before that change.
 */
const HOME_PATHS = ["/", "/en", "/fr"];
const QUIZ_STARTED_PATH = "quiz_started";
const DEEP_DIVE_STARTED_PATH = "deep_dive_started";

const STAGE_PATHS = QUIZ_STAGES.map((stage) => `quiz_stage_completed/${stage}`);
const TONE_SELECTED_PATHS = TONES.map((tone) => `tone_selected/${tone}`);
const SUBMISSION_PATHS = TONES.map((tone) => `submission_completed/${tone}`);
const SHARE_PATHS = TONES.flatMap((tone) => SHARE_METHODS.map((method) => `share/${tone}/${method}`));
const DEEP_DIVE_COMPLETED_PATHS = DEEP_DIVE_CONTEXT_DETAILS.map((d) => `deep_dive_completed/${d}`);
const PROFILE_CLICK_PATHS = PROFILE_CLICK_DETAILS.map((detail) => `profile_click/${detail}`);

const ALL_PATHS = [
  ...HOME_PATHS,
  QUIZ_STARTED_PATH,
  ...STAGE_PATHS,
  ...TONE_SELECTED_PATHS,
  ...SUBMISSION_PATHS,
  ...SHARE_PATHS,
  OWN_TOUR_EVENT,
  DEEP_DIVE_STARTED_PATH,
  ...DEEP_DIVE_COMPLETED_PATHS,
  ...PROFILE_CLICK_PATHS,
];

export interface FunnelStats {
  /** Pageviews on "/" in the requested window. */
  homeViews: number;
  /** First answer recorded — the quiz was actually started, not just loaded. */
  quizStarted: number;
  /** One entry per AARRR stage, in order: where people drop out mid-questionnaire. */
  stagesCompleted: number[];
  /** "Get my score" pressed (either tone). */
  toneSelected: number;
  /** A result exists. */
  submissionsCompleted: number;
  /** A share actually happened (native sheet or clipboard). */
  shares: number;
  /** Visitors of a shared result who clicked into their own Tour (REVIEW-02.md R2-02). */
  ownTourClicks: number;
  deepDiveStarted: number;
  deepDiveCompleted: number;
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
  url.searchParams.set("include_paths", ALL_PATHS.join(","));
  url.searchParams.set("start", startISO);
  url.searchParams.set("end", new Date().toISOString());
  // Must stay above the number of paths requested: a limit below it would
  // silently truncate the response and under-report the tail of the funnel.
  // (It was hard-coded to 10 back when only 4 paths were asked for.)
  url.searchParams.set("limit", String(ALL_PATHS.length + 10));

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

  const counts = new Map<string, number>();
  for (const hit of body.hits ?? []) {
    counts.set(hit.path, (counts.get(hit.path) ?? 0) + hit.count);
  }
  const sum = (paths: readonly string[]) => paths.reduce((total, path) => total + (counts.get(path) ?? 0), 0);

  const homeViews = sum(HOME_PATHS);
  const profileClicks = sum(PROFILE_CLICK_PATHS);

  return {
    label,
    stats: {
      homeViews,
      quizStarted: counts.get(QUIZ_STARTED_PATH) ?? 0,
      stagesCompleted: STAGE_PATHS.map((path) => counts.get(path) ?? 0),
      toneSelected: sum(TONE_SELECTED_PATHS),
      submissionsCompleted: sum(SUBMISSION_PATHS),
      shares: sum(SHARE_PATHS),
      ownTourClicks: counts.get(OWN_TOUR_EVENT) ?? 0,
      deepDiveStarted: counts.get(DEEP_DIVE_STARTED_PATH) ?? 0,
      deepDiveCompleted: sum(DEEP_DIVE_COMPLETED_PATHS),
      profileClicks,
      rate: homeViews > 0 ? profileClicks / homeViews : null,
    },
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
