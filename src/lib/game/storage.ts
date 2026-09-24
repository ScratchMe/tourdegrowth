import { GAME_ENDINGS } from "./events";
import { GAME_COLLECTION_KEY, GAME_SAVE_KEYS, type GameCollection } from "./storage-keys";
import type { EndingId, GameState, LevelDefinition, LevelSlug } from "./types";

/**
 * localStorage persistence for the game — GAME-BRIEF.md §9.5, plan §3.7.
 *
 * Same contract as `lib/quiz/storage.ts`: SSR-safe (no-ops without
 * `window`), every access inside a try/catch, and a store that cannot be read
 * or written degrades the game to "no resume" — it never stops it. The game
 * is played entirely from in-memory reducer state; this file only lets a
 * reload pick it back up.
 *
 * Nothing personal is ever written here, and nothing ever leaves the device
 * (§9.5: no identifier, no Firestore).
 */

/**
 * One key per level. A `Record` rather than a template string so that adding
 * a slug to `LevelSlug` fails to compile until someone decides its key —
 * the saved-game key is a public contract with every browser that already
 * holds one, not something to derive by accident.
 */
const SAVE_KEYS: Record<LevelSlug, string> = GAME_SAVE_KEYS;

export interface SavedGame<Id extends string = string> {
  /** ISO 8601, client clock — shown in the resume prompt, never compared across devices. */
  savedAt: string;
  state: GameState<Id>;
}

interface SaveEnvelope {
  modelVersion: number;
  savedAt: string;
  state: unknown;
}

/**
 * Written after each action that changes persistent state (toggle, hangup,
 * run), never mid-animation — the caller decides when, this only writes.
 */
export function saveGame<Id extends string>(
  level: LevelDefinition<Id>,
  state: GameState<Id>,
  now: Date = new Date(),
): void {
  if (typeof window === "undefined") return;
  const envelope: SaveEnvelope = { modelVersion: level.modelVersion, savedAt: now.toISOString(), state };
  try {
    window.localStorage.setItem(SAVE_KEYS[level.slug], JSON.stringify(envelope));
  } catch {
    // Quota, private mode: the year goes on in memory, it just won't
    // survive a reload.
  }
}

/**
 * The saved year, or null. A save from another `modelVersion` is ignored
 * rather than migrated: its numbers were produced by rules that no longer
 * exist, and resuming it would show a dashboard the current model could
 * never have produced (§9.5). A save that fails `isGameState` is ignored
 * too — a half-parsed state is a crash waiting in the renderer.
 *
 * Call it after mount, never while computing initial state: the prerendered
 * HTML is the fresh game, and reading storage during render would make the
 * first client render differ from it (the step-4 hydration lesson).
 */
export function loadGame<Id extends string>(level: LevelDefinition<Id>): SavedGame<Id> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEYS[level.slug]);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.modelVersion !== level.modelVersion) return null;
    if (typeof parsed.savedAt !== "string") return null;
    if (!isGameState(level, parsed.state)) return null;
    return { savedAt: parsed.savedAt, state: parsed.state };
  } catch {
    return null;
  }
}

/** « Recommencer » and « Rejouer »: the next load starts from the fresh year. */
export function clearGame(level: Pick<LevelDefinition, "slug">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SAVE_KEYS[level.slug]);
  } catch {
    // ignore — the in-memory reset already happened
  }
}

/**
 * What a found save should do on arrival (§3.7, P15): a year with at least
 * one quarter played asks « Reprendre l'année en cours ? »; a save with no
 * quarter played restores silently, since there is nothing to lose by not
 * asking — and asking would put a dialog in front of the video call for
 * someone who merely toggled a card before reloading.
 */
export function resumeMode(saved: SavedGame | null): "none" | "silent" | "prompt" {
  if (!saved) return "none";
  return saved.state.log.length >= 1 ? "prompt" : "silent";
}

// ---------------------------------------------------------------------------
// Shape validation
// ---------------------------------------------------------------------------

// One list of endings, shared with the analytics vocabulary, which is also
// where the compile-time check that it covers every `EndingId` lives.
const ENDING_IDS: readonly EndingId[] = GAME_ENDINGS;
const QUARTERS_PER_YEAR = 4;
const MONTHS_PER_YEAR = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIntIn(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

/** The bars the dashboard draws as 0-100 gauges; the engine clamps them, so anything outside is corruption. */
function isGauge(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

/**
 * Whether `value` is a state this level's engine could have produced — not a
 * full re-simulation, but everything the renderer relies on without checking:
 * finite numbers, gauges inside 0-100, card ids the level knows, at least one
 * history point for the charts, and a journal whose length matches the
 * quarter counter (the engine increments `q` exactly when it appends to
 * `log`). A state that fails any of these is dropped, and the player starts a
 * fresh year instead of hitting a blank screen.
 */
export function isGameState<Id extends string>(level: LevelDefinition<Id>, value: unknown): value is GameState<Id> {
  if (!isRecord(value)) return false;
  const known = new Set<string>(Object.keys(level.cards));
  const isId = (x: unknown): x is Id => typeof x === "string" && known.has(x);
  const isIdList = (x: unknown): x is Id[] => Array.isArray(x) && x.every(isId);

  if (value.v !== 1 || value.level !== level.slug) return false;
  if (!isIntIn(value.q, 0, QUARTERS_PER_YEAR) || !isIntIn(value.month, 0, MONTHS_PER_YEAR)) return false;
  if (!["subs", "churn", "mrr", "spike", "press"].every((k) => isFiniteNumber(value[k]))) return false;
  if (!["trust", "radar", "patience", "lagTrust"].every((k) => isGauge(value[k]))) return false;
  if (!isIntIn(value.presented, 0, QUARTERS_PER_YEAR)) return false;
  if (!["callOpen", "insight", "sanction", "fired", "over"].every((k) => typeof value[k] === "boolean")) return false;

  if (value.order !== null && !isId(value.order)) return false;
  for (const k of ["orders", "obeyed", "refused", "active", "everDark", "removedDark", "seenDark", "picks"]) {
    if (!isIdList(value[k])) return false;
  }
  if ((value.picks as Id[]).length > level.constants.picksPerQuarter) return false;

  if (!isRecord(value.since)) return false;
  for (const [id, month] of Object.entries(value.since)) {
    if (!isId(id) || !isIntIn(month, 0, MONTHS_PER_YEAR)) return false;
  }

  if (value.ending !== null && !ENDING_IDS.includes(value.ending as EndingId)) return false;
  if (value.session !== undefined && typeof value.session !== "string") return false;

  if (!Array.isArray(value.history) || value.history.length < 1) return false;
  for (const point of value.history) {
    if (!isRecord(point) || !["m", "churn", "trust", "subs", "mrr"].every((k) => isFiniteNumber(point[k]))) {
      return false;
    }
  }

  if (!Array.isArray(value.log) || value.log.length !== value.q) return false;
  for (const entry of value.log) {
    if (!isRecord(entry) || !isIntIn(entry.q, 0, QUARTERS_PER_YEAR - 1)) return false;
    if (!isIdList(entry.picked) || !Array.isArray(entry.fx) || !Array.isArray(entry.events)) return false;
    if (entry.order !== null && !isId(entry.order)) return false;
    if (!["churnStart", "churnEnd", "target", "gap", "subs", "mrr", "patience"].every((k) => isFiniteNumber(entry[k]))) {
      return false;
    }
    if (!isRecord(entry.boss) || typeof entry.moodAfter !== "string") return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// The collection — GAME-BRIEF.md §9.4 and §11.5
// ---------------------------------------------------------------------------

// « Ce que tu sais reconnaître », across levels — the GameCollection shape lives
// in storage-keys.ts, next to its key, because the hub reads it too (§9.4).
export type { GameCollection } from "./storage-keys";

function emptyCollection(): GameCollection {
  return { patterns: {}, endings: {} };
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

/**
 * Validated entry by entry rather than all-or-nothing: the collection spans
 * levels and grows for good, so one malformed level must not wipe what the
 * player earned elsewhere. What cannot be read is simply left out.
 */
export function loadCollection(): GameCollection {
  if (typeof window === "undefined") return emptyCollection();
  try {
    const raw = window.localStorage.getItem(GAME_COLLECTION_KEY);
    if (!raw) return emptyCollection();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyCollection();
    const out = emptyCollection();
    const slugs = Object.keys(SAVE_KEYS) as LevelSlug[];
    for (const slug of slugs) {
      const p = isRecord(parsed.patterns) ? parsed.patterns[slug] : undefined;
      if (isRecord(p) && isStringList(p.seen) && isStringList(p.used)) {
        out.patterns[slug] = { seen: p.seen, used: p.used };
      }
      const e = isRecord(parsed.endings) ? parsed.endings[slug] : undefined;
      if (isRecord(e) && ENDING_IDS.includes(e.id as EndingId) && typeof e.at === "string") {
        out.endings[slug] = { id: e.id as EndingId, at: e.at };
      }
    }
    return out;
  } catch {
    return emptyCollection();
  }
}

/**
 * December's write (§3.7). Patterns accumulate across years — replaying never
 * makes the player « unknow » a pattern — while the ending is replaced by the
 * latest one. Ids the level does not know are dropped, so a caller mistake
 * cannot plant an entry the hub would later fail to label.
 */
export function recordYearEnd<Id extends string>(
  level: LevelDefinition<Id>,
  year: { seen: readonly Id[]; used: readonly Id[]; ending: EndingId },
  now: Date = new Date(),
): void {
  if (typeof window === "undefined") return;
  try {
    const known = new Set<string>(Object.keys(level.cards));
    const current = loadCollection();
    const before = current.patterns[level.slug] ?? { seen: [], used: [] };
    const merge = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])].filter((id) => known.has(id));
    current.patterns[level.slug] = { seen: merge(before.seen, year.seen), used: merge(before.used, year.used) };
    current.endings[level.slug] = { id: year.ending, at: now.toISOString() };
    window.localStorage.setItem(GAME_COLLECTION_KEY, JSON.stringify(current));
  } catch {
    // The collection is a keepsake, never worth interrupting December for.
  }
}
