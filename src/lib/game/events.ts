import type { EndingId, LevelSlug, Mood } from "./types";

/**
 * The game's GoatCounter vocabulary — GAME-BRIEF.md §9.6, plan §3.8.
 *
 * A closed list, on purpose: `goatcounter-api.ts` asks GoatCounter for exact
 * path names (`include_paths`), so an event fired under a name that is not
 * in `gameEventPaths()` is counted by GoatCounter and then silently absent
 * from /admin/stats (REVIEW.md R-11). Every path the island can emit is
 * built from the lists below, and the dashboard asks for the same lists.
 *
 * No path carries a number the player produced or free text — only these
 * fixed segments — so the dashboard stays a bounded set of rows and nothing
 * about a player's year leaves the device beyond which branch they took.
 *
 * Each event is `name/detail`, the same convention as `share/<tone>/<method>`:
 * pass the name and the detail to `trackEvent` separately.
 */

/** The levels the vocabulary covers. Adding a level adds its paths here, and the dashboard follows. */
export const GAME_LEVEL_SLUGS = ["retention"] as const satisfies readonly LevelSlug[];

/** `game_entry_clicked/<detail>` — the four doors into the game (§13.3). */
export const GAME_ENTRY_EVENT = "game_entry_clicked";
export const GAME_ENTRY_DETAILS = ["result/retention", "deep_dive/retention", "footer", "hub"] as const;
export type GameEntryDetail = (typeof GAME_ENTRY_DETAILS)[number];

/** `game_started/<level>/<from>` — once, when a fresh year mounts; never on a resume. */
export const GAME_STARTED_EVENT = "game_started";
export const GAME_START_FROM = ["direct", "result", "deep_dive", "hub"] as const;
export type GameStartFrom = (typeof GAME_START_FROM)[number];

export const GAME_QUARTERS = ["1", "2", "3", "4"] as const;
export type GameQuarter = (typeof GAME_QUARTERS)[number];

/** `game_hangup/<q>` — the player hung up the CEO's call of quarter q. */
export const GAME_HANGUP_EVENT = "game_hangup";
/** `game_quarter/<q>` — quarter q was run. */
export const GAME_QUARTER_EVENT = "game_quarter";

/** `game_voice/<mood>` — « Écouter » pressed on a call. */
export const GAME_VOICE_EVENT = "game_voice";
export const GAME_MOODS = ["calm", "firm", "angry", "cold"] as const satisfies readonly Mood[];

/** `game_order/<outcome>` — the CEO's order of the quarter, when there was one. */
export const GAME_ORDER_EVENT = "game_order";
export const GAME_ORDER_OUTCOMES = ["obeyed", "refused"] as const;
export type GameOrderOutcome = (typeof GAME_ORDER_OUTCOMES)[number];

/** `game_ending/<id>` — December was reached with this ending. */
export const GAME_ENDING_EVENT = "game_ending";
export const GAME_ENDINGS = [
  "firedDark", "firedClean", "applause", "cleanMiss", "fine", "repentant", "labyrinth",
] as const satisfies readonly EndingId[];

/**
 * `satisfies` checks that every listed id exists, not that every id is
 * listed: this alias fails to compile when `EndingId` gains a member the
 * list lacks — which would otherwise be an ending the dashboard never counts.
 */
type AssertNever<T extends never> = T;
export type GameEndingsCovered = AssertNever<Exclude<EndingId, (typeof GAME_ENDINGS)[number]>>;
export type GameMoodsCovered = AssertNever<Exclude<Mood, (typeof GAME_MOODS)[number]>>;

/**
 * `game_resume/<choice>` — the answer to « Reprendre l'année en cours ? »
 * (orchestrator decision 5). Without it, a resume prompt nobody accepts would
 * look exactly like one that works.
 */
export const GAME_RESUME_EVENT = "game_resume";
export const GAME_RESUME_DETAILS = ["resume", "restart"] as const;
export type GameResumeDetail = (typeof GAME_RESUME_DETAILS)[number];

/**
 * Events with no detail. `game_catalogue_open` fires on the player's FIRST
 * opening of a pattern sheet, not the ones open by default.
 */
export const GAME_CATALOGUE_OPEN_EVENT = "game_catalogue_open";
export const GAME_REPLAY_EVENT = "game_replay";
export const GAME_SHARE_EVENT = "game_share";
export const GAME_SIMPLE_EVENTS = [GAME_CATALOGUE_OPEN_EVENT, GAME_REPLAY_EVENT, GAME_SHARE_EVENT] as const;

/** The detail for `game_started`, typed so a caller cannot invent a `from`. */
export function gameStartedDetail(level: LevelSlug, from: GameStartFrom): string {
  return `${level}/${from}`;
}

/**
 * Reads the `?from=` a page was opened with. Anything outside the list —
 * absent, misspelled, hand-edited — counts as a direct arrival rather than
 * creating a path the dashboard would never ask for.
 */
export function parseGameStartFrom(param: string | null | undefined): GameStartFrom {
  return (GAME_START_FROM as readonly string[]).includes(param ?? "") ? (param as GameStartFrom) : "direct";
}

/** Every exact path the game can emit — what `goatcounter-api.ts` asks GoatCounter for. */
export function gameEventPaths(): string[] {
  return [
    ...GAME_ENTRY_DETAILS.map((d) => `${GAME_ENTRY_EVENT}/${d}`),
    ...GAME_LEVEL_SLUGS.flatMap((slug) => GAME_START_FROM.map((from) => `${GAME_STARTED_EVENT}/${gameStartedDetail(slug, from)}`)),
    ...GAME_QUARTERS.map((q) => `${GAME_HANGUP_EVENT}/${q}`),
    ...GAME_QUARTERS.map((q) => `${GAME_QUARTER_EVENT}/${q}`),
    ...GAME_MOODS.map((m) => `${GAME_VOICE_EVENT}/${m}`),
    ...GAME_ORDER_OUTCOMES.map((o) => `${GAME_ORDER_EVENT}/${o}`),
    ...GAME_ENDINGS.map((e) => `${GAME_ENDING_EVENT}/${e}`),
    ...GAME_RESUME_DETAILS.map((d) => `${GAME_RESUME_EVENT}/${d}`),
    ...GAME_SIMPLE_EVENTS,
  ];
}
