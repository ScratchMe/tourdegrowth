import {
  DEEP_DIVE_CONTEXT_DETAILS,
  PROFILE_CLICK_DETAILS,
  QUIZ_STAGES,
  SHARE_METHODS,
  TONES,
  OWN_TOUR_EVENT,
  SEGMENT_DETAILS,
  RETAKE_STARTED_EVENT,
  LANDING_RETURN_EVENT,
  RETAKE_NUDGE_EVENT,
  ENGINE_DECK_OPENED_EVENT,
  ENGINE_EXPORT_FORMATS,
  ENGINE_EXPORTED_EVENT,
  ENGINE_OPENED_EVENT,
  ENGINE_REQUEST_COPIED_EVENT,
  ENGINE_STAGE_SAVED_EVENT,
  ENGINE_STAGES,
  ENGINE_TOUR_LINKED_EVENT,
  engineEventPaths,
} from "./goatcounter";
import {
  GAME_CATALOGUE_OPEN_EVENT,
  GAME_ENDING_EVENT,
  GAME_ENDINGS,
  GAME_ENTRY_DETAILS,
  GAME_ENTRY_EVENT,
  GAME_HANGUP_EVENT,
  GAME_LEVEL_SLUGS,
  GAME_MOODS,
  GAME_ORDER_EVENT,
  GAME_ORDER_OUTCOMES,
  GAME_QUARTER_EVENT,
  GAME_QUARTERS,
  GAME_REPLAY_EVENT,
  GAME_RESUME_DETAILS,
  GAME_RESUME_EVENT,
  GAME_SHARE_EVENT,
  GAME_START_FROM,
  GAME_STARTED_EVENT,
  GAME_TOUR_LOOP_EVENT,
  GAME_VOICE_EVENT,
  gameEventPaths,
  gameStartedDetail,
  type GameEntryDetail,
  type GameOrderOutcome,
  type GameResumeDetail,
  type GameStartFrom,
} from "@/lib/game/events";
import type { EndingId, Mood } from "@/lib/game/types";

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
const SEGMENT_PATHS = SEGMENT_DETAILS.map((d) => `segment_answered/${d}`);

const ALL_PATHS = [
  ...HOME_PATHS,
  QUIZ_STARTED_PATH,
  ...STAGE_PATHS,
  ...SEGMENT_PATHS,
  ...TONE_SELECTED_PATHS,
  ...SUBMISSION_PATHS,
  ...SHARE_PATHS,
  OWN_TOUR_EVENT,
  DEEP_DIVE_STARTED_PATH,
  ...DEEP_DIVE_COMPLETED_PATHS,
  ...PROFILE_CLICK_PATHS,
  RETAKE_STARTED_EVENT,
  LANDING_RETURN_EVENT,
  RETAKE_NUDGE_EVENT,
  // The game (GAME-BRIEF.md §9.6) — built from the same lists the island
  // fires from, so a path cannot exist on one side only.
  ...gameEventPaths(),
  // The growth engine (engine spec §11.6) — same reason: the island builds
  // its paths from these lists, so a path cannot exist on one side only.
  ...engineEventPaths(),
];

/**
 * The game's numbers, straight from the same response as the funnel — plan
 * §3.8 and GAME-BRIEF.md §13.5. Every count is a sum over exact paths; a
 * path missing from `gameEventPaths()` would read as zero here, which is why
 * the island and this block share one vocabulary.
 */
export interface GameFunnelStats {
  /** `game_entry_clicked/<detail>` — the four doors into the game. */
  entries: Record<GameEntryDetail, number>;
  /** `game_started/<level>/<from>`, summed over levels: fresh years only, never a resume. */
  started: Record<GameStartFrom, number>;
  /** Quarters 1-4 run (`game_quarter/<q>`), in order — where players stop. */
  quartersRun: number[];
  /** CEO calls hung up per quarter (`game_hangup/<q>`). */
  hangups: number[];
  endings: Record<EndingId, number>;
  orders: Record<GameOrderOutcome, number>;
  voices: Record<Mood, number>;
  resume: Record<GameResumeDetail, number>;
  catalogueOpened: number;
  replays: number;
  shares: number;
  /** December's loop back to the Tour (`game_tour_loop`) — readers the game sends to the quiz. */
  tourLoops: number;
}

/**
 * The growth engine's numbers (engine spec §11.6). Paths only, by design: the
 * page promises that nothing typed leaves the browser, so this is how many
 * people used each part of it — never what they found. Everything reads zero
 * until the engine is opened.
 */
export interface EngineFunnelStats {
  /** `engine_opened` — the island's first view in a session. */
  opened: number;
  /** `engine_stage_saved/<stage>` — first number saved in that stage, once a session. */
  stagesSaved: Record<(typeof ENGINE_STAGES)[number], number>;
  requestsCopied: number;
  deckOpened: number;
  /** `engine_exported/<format>` — files downloaded, or the deck's text copied. */
  exported: Record<(typeof ENGINE_EXPORT_FORMATS)[number], number>;
  tourLinked: number;
}

export interface FunnelStats {
  /** Pageviews on "/" in the requested window. */
  homeViews: number;
  /** First answer recorded — the quiz was actually started, not just loaded. */
  quizStarted: number;
  /** One entry per AARRR stage, in order: where people drop out mid-questionnaire. */
  stagesCompleted: number[];
  /** The context screen (REVIEW-02.md R2-26): how many answered at least one axis, and how many both. */
  segmentAnswered: number;
  segmentBothAxes: number;
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
  /** A Tour begun on a device that already held a result — REVIEW-03.md A4. */
  retakeStarted: number;
  /** The landing rendered for someone who already had a result — REVIEW-03.md A4. */
  landingReturn: number;
  /** REVIEW-03.md C1 — the 30-day nudge was clicked. Against `landingReturn`, this is whether the nudge works at all. */
  retakeNudgeClicked: number;
  /**
   * Value actions per result — REVIEW-03.md A4, the closest thing this
   * product has to the North Star the external review asked for: did the
   * result produce anything at all?
   *
   * Numerator: shares + visitor "take your own Tour" clicks + Deep dives
   * started + retakes. Denominator: results created.
   *
   * Deliberately NOT called a rate, and deliberately not a percentage: one
   * result can be shared twice, opened by two visitors AND lead to a Deep
   * dive, so this legitimately exceeds 1. Naming it a conversion rate would
   * repeat exactly the R2-01 mistake — a ratio that cannot live in the range
   * its name implies.
   *
   * Both halves come from GoatCounter, never one from Firestore: an
   * ad-blocked visitor is invisible to GoatCounter and visible to Firestore,
   * so dividing a GoatCounter numerator by a Firestore denominator would
   * understate this number by however many people block scripts.
   */
  valueActionsPerResult: number | null;
  game: GameFunnelStats;
  engine: EngineFunnelStats;
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

  // REVIEW-03.md A4 — every number in this ratio comes from this one
  // response, so the two halves are always the same population.
  const shares = sum(SHARE_PATHS);
  const ownTourClicks = counts.get(OWN_TOUR_EVENT) ?? 0;
  const deepDiveStarted = counts.get(DEEP_DIVE_STARTED_PATH) ?? 0;
  const retakeStarted = counts.get(RETAKE_STARTED_EVENT) ?? 0;
  const submissionsCompleted = sum(SUBMISSION_PATHS);
  const valueActions = shares + ownTourClicks + deepDiveStarted + retakeStarted;

  return {
    label,
    stats: {
      homeViews,
      quizStarted: counts.get(QUIZ_STARTED_PATH) ?? 0,
      stagesCompleted: STAGE_PATHS.map((path) => counts.get(path) ?? 0),
      segmentAnswered: sum(SEGMENT_PATHS),
      // "both" is the only detail that produces a segment average at all —
      // the other three fall the reader back to the global one.
      segmentBothAxes: sum(["segment_answered/both"]),
      toneSelected: sum(TONE_SELECTED_PATHS),
      submissionsCompleted,
      shares,
      ownTourClicks,
      deepDiveStarted,
      deepDiveCompleted: sum(DEEP_DIVE_COMPLETED_PATHS),
      profileClicks,
      rate: homeViews > 0 ? profileClicks / homeViews : null,
      retakeStarted,
      landingReturn: counts.get(LANDING_RETURN_EVENT) ?? 0,
      retakeNudgeClicked: counts.get(RETAKE_NUDGE_EVENT) ?? 0,
      valueActionsPerResult: submissionsCompleted > 0 ? valueActions / submissionsCompleted : null,
      game: gameStats((path) => counts.get(path) ?? 0),
      engine: engineStats((path) => counts.get(path) ?? 0),
    },
  };
}

function tally<K extends string>(keys: readonly K[], countOf: (key: K) => number): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, countOf(k)])) as Record<K, number>;
}

function gameStats(count: (path: string) => number): GameFunnelStats {
  return {
    entries: tally(GAME_ENTRY_DETAILS, (d) => count(`${GAME_ENTRY_EVENT}/${d}`)),
    started: tally(GAME_START_FROM, (from) =>
      GAME_LEVEL_SLUGS.reduce((n, slug) => n + count(`${GAME_STARTED_EVENT}/${gameStartedDetail(slug, from)}`), 0),
    ),
    quartersRun: GAME_QUARTERS.map((q) => count(`${GAME_QUARTER_EVENT}/${q}`)),
    hangups: GAME_QUARTERS.map((q) => count(`${GAME_HANGUP_EVENT}/${q}`)),
    endings: tally(GAME_ENDINGS, (e) => count(`${GAME_ENDING_EVENT}/${e}`)),
    orders: tally(GAME_ORDER_OUTCOMES, (o) => count(`${GAME_ORDER_EVENT}/${o}`)),
    voices: tally(GAME_MOODS, (m) => count(`${GAME_VOICE_EVENT}/${m}`)),
    resume: tally(GAME_RESUME_DETAILS, (d) => count(`${GAME_RESUME_EVENT}/${d}`)),
    catalogueOpened: count(GAME_CATALOGUE_OPEN_EVENT),
    replays: count(GAME_REPLAY_EVENT),
    shares: count(GAME_SHARE_EVENT),
    tourLoops: count(GAME_TOUR_LOOP_EVENT),
  };
}

function engineStats(count: (path: string) => number): EngineFunnelStats {
  return {
    opened: count(ENGINE_OPENED_EVENT),
    stagesSaved: tally(ENGINE_STAGES, (stage) => count(`${ENGINE_STAGE_SAVED_EVENT}/${stage}`)),
    requestsCopied: count(ENGINE_REQUEST_COPIED_EVENT),
    deckOpened: count(ENGINE_DECK_OPENED_EVENT),
    exported: tally(ENGINE_EXPORT_FORMATS, (format) => count(`${ENGINE_EXPORTED_EVENT}/${format}`)),
    tourLinked: count(ENGINE_TOUR_LINKED_EVENT),
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
