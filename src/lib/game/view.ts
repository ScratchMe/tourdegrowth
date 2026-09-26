/**
 * What the screen shows, derived from the state — numbers and typed items,
 * never text (the copy layer writes the words, `format.ts` writes the
 * numbers). Pure and tested, so the components below it stay dumb.
 *
 * The one rule that matters most here: before December the dashboard view
 * does not CARRY trust or radar (X11). The brief's thesis is that the growth
 * dashboard shows the number and hides the cost; a blurred tile whose real
 * value sits in the DOM, an `aria-label` or a `title` would hide nothing from
 * anyone who looks. The honest way to blur is to never hand the value over.
 *
 * Relative imports only, types from `@/` — see model.ts.
 */
import type { Locale } from "@/lib/i18n/locale";

import { deltaSign, type DeltaKind } from "./format";
import type { RetentionCardId } from "./levels/retention";
import { targetFor } from "./model";
import type { ChurnDrivers, GameEvent, GameState, LevelDefinition, Mood, MonthPoint, QuarterLog } from "./types";

// ------------------------------------------------------------ dashboard ---

export type Sentiment = "good" | "bad" | "flat";

export interface Delta {
  /** The raw difference, next minus previous. */
  value: number;
  /** Whether the change is good news for this tile — never inferred from the sign alone. */
  sentiment: Sentiment;
}

/** A tile the dashboard does not show yet: no value, by construction. */
export interface HiddenValue {
  hidden: true;
}
export interface RevealedValue {
  hidden: false;
  value: number;
}

export interface DashboardView {
  churn: number;
  /** The target the tile compares against: the quarter's, or the board's once the year is over. */
  target: number;
  targetScope: "quarter" | "board";
  subs: number;
  /** Index into the months copy: the month the numbers describe. */
  monthIndex: number;
  /** True once a month has been simulated — the figure is an end-of-month one. */
  monthEnd: boolean;
  mrr: number;
  /** Revenue against January's, once a month has run; null on the first of January. */
  mrrVsJanuary: number | null;
  patience: number;
  /** Width of the patience bar, 0 to 100. */
  patienceBar: number;
  patienceLow: boolean;
  trust: HiddenValue | RevealedValue;
  radar: HiddenValue | RevealedValue;
  /** Changes since `prev` — only when a previous reading is given (after a quarter). */
  deltas: { churn: Delta; subs: Delta; mrr: Delta; patience: Delta } | null;
}

function delta(kind: DeltaKind, a: number, b: number, upIsGood: boolean): Delta {
  const dir = deltaSign(kind, a, b);
  return { value: b - a, sentiment: dir === 0 ? "flat" : (dir > 0) === upIsGood ? "good" : "bad" };
}

function reveal(over: boolean, value: number): HiddenValue | RevealedValue {
  return over ? { hidden: false, value } : { hidden: true };
}

export function dashboardView<Id extends string>(
  level: LevelDefinition<Id>,
  state: GameState<Id>,
  prev?: GameState<Id>,
): DashboardView {
  const c = level.constants;
  const board = state.over;
  return {
    churn: state.churn,
    target: targetFor(c, board ? c.targets.length - 1 : state.q),
    targetScope: board ? "board" : "quarter",
    subs: state.subs,
    // Month m (1-12) has just ENDED: its figures are end-of-month m, index
    // m − 1. The prototype read index m and so labelled the end of March
    // « avril, fin de mois ».
    monthIndex: state.month === 0 ? 0 : state.month - 1,
    monthEnd: state.month > 0,
    mrr: state.mrr,
    mrrVsJanuary: state.month > 0 ? state.mrr - c.subs0 * c.price : null,
    patience: state.patience,
    patienceBar: Math.max(0, Math.min(100, state.patience)),
    patienceLow: state.patience < c.patience.lowLine,
    trust: reveal(state.over, state.trust),
    radar: reveal(state.over, state.radar),
    deltas: prev
      ? {
          churn: delta("churn", prev.churn, state.churn, false),
          subs: delta("int", prev.subs, state.subs, true),
          mrr: delta("millions", prev.mrr, state.mrr, true),
          patience: delta("int", prev.patience, state.patience, true),
        }
      : null,
  };
}

/** The months simulated between two states — what the dashboard scrolls through after « Lancer ». */
export function monthFrames<Id extends string>(prev: GameState<Id>, next: GameState<Id>): MonthPoint[] {
  return next.history.slice(prev.history.length);
}

// ---------------------------------------------------------------- phone ---

/**
 * Level 1's cancellation screen (§5.9), top to bottom. The phone is the
 * product of the level — a later level draws its own screen — hence the
 * retention ids here rather than generic ones.
 */
export type PhoneItem =
  | { kind: "appBar" }
  | { kind: "streakPush" }
  | { kind: "crumbs"; buried: boolean }
  | { kind: "plan"; annual: boolean }
  | { kind: "socialProof" }
  | { kind: "reminder" }
  | { kind: "cancel"; variant: "phone" | "pauseFirst" | "buriedLink" | "button"; buried: boolean }
  | { kind: "pauseOffer" }
  | { kind: "retentionOffers"; shamed: boolean }
  | { kind: "areYouSure" }
  | { kind: "exitSurvey" }
  | { kind: "noticePeriod" }
  | { kind: "effectiveToday" };

type Rid = RetentionCardId;

/** What the phone reflects: the cards in production AND the ones ticked but not yet played. */
export function phoneIds(state: GameState<Rid>): Rid[] {
  return [...new Set([...state.active, ...state.picks])];
}

export function phoneView(level: LevelDefinition<Rid>, ids: readonly Rid[]): PhoneItem[] {
  const has = (id: Rid) => ids.includes(id) && id in level.cards;
  const items: PhoneItem[] = [{ kind: "appBar" }];
  if (has("streak")) items.push({ kind: "streakPush" });
  items.push({ kind: "crumbs", buried: has("bury") });
  items.push({ kind: "plan", annual: has("annual") });
  if (has("social")) items.push({ kind: "socialProof" });
  if (has("remind")) items.push({ kind: "reminder" });
  // One cancel affordance, and the phone wins over everything: there is no
  // button to style once you have to call.
  const variant = has("call") ? "phone" : has("pdef") ? "pauseFirst" : has("bury") ? "buriedLink" : "button";
  items.push({ kind: "cancel", variant, buried: has("bury") });
  if (has("pause") && !has("pdef") && !has("call")) items.push({ kind: "pauseOffer" });
  if (has("cascade")) items.push({ kind: "retentionOffers", shamed: has("shame") });
  else if (has("shame") && !has("call")) items.push({ kind: "areYouSure" });
  if (has("survey")) items.push({ kind: "exitSurvey" });
  if (has("notice")) items.push({ kind: "noticePeriod" });
  else if (has("three")) items.push({ kind: "effectiveToday" });
  return items;
}

/** The clicks a subscriber needs to leave with nothing in the way: a button, a confirmation. */
export const BASE_CLICKS = 2;
/** « Résiliation en trois clics » brings the path back to at most this. */
export const THREE_CLICKS_CAP = 3;
/** Beyond this, the pill adds « la loi attend un parcours direct ». */
export const DIRECT_PATH_MAX = 3;

/**
 * The pill under the phone (§5.9): 2 to start, plus each pattern's clicks,
 * +1 for the pause offer, capped at 3 by the three-click card — or "phone"
 * when leaving takes a call, which no number of clicks describes.
 */
export function clicksFor(level: LevelDefinition<Rid>, ids: readonly Rid[]): number | "phone" {
  const cards = [...new Set(ids)].filter((id) => id in level.cards).map((id) => level.cards[id]);
  const dark = cards.filter((c) => c.kind === "d");
  if (dark.some((c) => c.clicks === "phone")) return "phone";
  let n = BASE_CLICKS + dark.reduce((sum, c) => sum + (typeof c.clicks === "number" ? c.clicks : 0), 0);
  if (ids.includes("pause")) n += 1;
  if (ids.includes("three")) n = Math.min(n, THREE_CLICKS_CAP);
  return n;
}

/** Whether the pill reads as a legal problem — and turns red, with words saying why. */
export function clicksOverLaw(clicks: number | "phone"): boolean {
  return clicks === "phone" || clicks > DIRECT_PATH_MAX;
}

// --------------------------------------------------------------- report ---

/** Missed by more than one point reads as a bad miss (red), less as a near one. */
export const SEVERE_MISS = 0.01;

export type ReportStatus = { kind: "hit" } | { kind: "missed"; by: number; severe: boolean };

export interface ReportView<Id extends string> {
  q: number;
  /** Months the quarter covers, as indexes into the months copy (0 = January). */
  monthFrom: number;
  monthTo: number;
  picked: Id[];
  order: Id | null;
  status: ReportStatus;
  churnStart: number;
  churnEnd: number;
  target: number;
  subs: number;
  mrr: number;
  patience: number;
  fx: QuarterLog<Id>["fx"];
  events: GameEvent[];
  boss: QuarterLog<Id>["boss"];
  moodAfter: Mood;
}

export type DriverKey = keyof ChurnDrivers;
/** The order the report reads them: what you did, what was already there, what people say, the market. */
export const DRIVER_ORDER: readonly DriverKey[] = ["picks", "production", "inspection", "word", "market"];

/**
 * The quarter's drivers as the report prints them: each rounded to the tenth
 * of a point the tiles use, and adding up to the move the TILES show
 * (churn at the quarter's end minus churn at its start, each rounded as
 * displayed) — largest remainder, so a line and the total never disagree by
 * a rounding. A driver that rounds to nothing is dropped; the total is kept
 * even when it is zero. Values stay fractions (0.004 = 0,4 point).
 */
export function driverRows(log: Pick<QuarterLog, "churnStart" | "churnEnd" | "drivers">): {
  total: number;
  rows: { key: DriverKey; value: number }[];
} {
  const tenths = (x: number) => x * 1000;
  const total = Math.round(tenths(log.churnEnd)) - Math.round(tenths(log.churnStart));
  const raw = DRIVER_ORDER.map((key) => ({ key, exact: tenths(log.drivers[key]) }));
  const rounded = raw.map((r) => ({ ...r, value: Math.round(r.exact) }));
  let gap = total - rounded.reduce((sum, r) => sum + r.value, 0);
  // Hand the missing tenths to the lines whose rounding lost the most in that direction.
  const byRemainder = [...rounded].sort((a, b) =>
    gap > 0 ? b.exact - b.value - (a.exact - a.value) : a.exact - a.value - (b.exact - b.value),
  );
  for (let i = 0; gap !== 0 && byRemainder.length > 0; i = (i + 1) % byRemainder.length) {
    const step = gap > 0 ? 1 : -1;
    byRemainder[i]!.value += step;
    gap -= step;
  }
  return {
    total: total / 1000,
    rows: rounded.filter((r) => r.value !== 0).map((r) => ({ key: r.key, value: r.value / 1000 })),
  };
}

export function reportView<Id extends string>(level: LevelDefinition<Id>, log: QuarterLog<Id>): ReportView<Id> {
  const status: ReportStatus = log.gap <= 0 ? { kind: "hit" } : { kind: "missed", by: log.gap, severe: log.gap > SEVERE_MISS };
  return {
    q: log.q,
    monthFrom: log.q * 3,
    monthTo: log.q * 3 + 2,
    picked: [...log.picked],
    order: log.order,
    status,
    churnStart: log.churnStart,
    churnEnd: log.churnEnd,
    target: log.target,
    subs: log.subs,
    mrr: log.mrr,
    patience: log.patience,
    fx: log.fx,
    events: log.events,
    boss: log.boss,
    moodAfter: log.moodAfter,
  };
}

// ------------------------------------------------------------- December ---

export interface ScaleSpec {
  /** The frame shows at least this range… */
  min: number;
  max: number;
  /** …and stretches to keep every value this far inside it. */
  headroom: number;
  /** Gridlines at tickFrom, tickFrom + tickStep, … up to the top. */
  tickFrom: number;
  tickStep: number;
}

export interface ChartScale {
  min: number;
  max: number;
  ticks: number[];
}

/** Churn, in percent: 2 to 9 % unless a spike goes higher (it can reach ~11 %, R16). */
export const CHURN_SCALE: ScaleSpec = { min: 2, max: 9, headroom: 0.5, tickFrom: 3, tickStep: 2 };
/** Trust, 0 to 100. Clamped by the model, so it never needs to stretch. */
export const TRUST_SCALE: ScaleSpec = { min: 0, max: 100, headroom: 0, tickFrom: 25, tickStep: 25 };

/**
 * The frame of a December curve. The prototype fixed churn at 2-9 %, and a
 * control plus a viral thread take it past 9: the line left its own chart.
 * The frame now grows to hold the data, never the other way round.
 */
export function chartScale(values: readonly number[], spec: ScaleSpec): ChartScale {
  const top = values.length ? Math.max(...values) : spec.max;
  const bottom = values.length ? Math.min(...values) : spec.min;
  const max = Math.max(spec.max, Math.ceil(top + spec.headroom));
  const min = Math.min(spec.min, Math.max(0, Math.floor(bottom - spec.headroom)));
  const ticks: number[] = [];
  for (let t = spec.tickFrom; t <= max; t += spec.tickStep) if (t >= min) ticks.push(t);
  return { min, max, ticks };
}

export interface CurveView {
  /** Values to plot, one per history point (January 1st first). */
  values: number[];
  /** Month of each point, 0 for January 1st then 1-12 — indexes the month initials as m − 1. */
  months: number[];
  scale: ChartScale;
  /** The dashed reference line (the board's target, the viral threshold), in the curve's unit. */
  reference: number;
  /**
   * The final value in the SAME unit as the December cell — churn as a
   * fraction, not the percent the curve is plotted in — so the end-of-curve
   * label is formatted by the cell's formatter and cannot say « 3,99 % »
   * beside a cell that says « 4,0 % » (R5).
   */
  end: number;
}

export interface DecemberView {
  cells: { churn: number; trust: number; radar: number };
  churn: CurveView;
  trust: CurveView;
}

export function decemberView<Id extends string>(level: LevelDefinition<Id>, state: GameState<Id>): DecemberView {
  const c = level.constants;
  const churnValues = state.history.map((h) => h.churn * 100);
  const trustValues = state.history.map((h) => h.trust);
  const months = state.history.map((h) => h.m);
  return {
    cells: { churn: state.churn, trust: state.trust, radar: state.radar },
    churn: {
      values: churnValues,
      months,
      scale: chartScale(churnValues, CHURN_SCALE),
      reference: targetFor(c, c.targets.length - 1) * 100,
      end: state.churn,
    },
    trust: {
      values: trustValues,
      months,
      scale: chartScale(trustValues, TRUST_SCALE),
      reference: c.viral.trust,
      end: state.trust,
    },
  };
}

/**
 * The honest cards played this year, once each, in the order first played —
 * the « what you did that was clean » list, with their hidden effects.
 */
export function playbookCards<Id extends string>(level: LevelDefinition<Id>, state: GameState<Id>): Id[] {
  const seen: Id[] = [];
  for (const entry of state.log) for (const id of entry.picked) if (level.cards[id].kind === "h" && !seen.includes(id)) seen.push(id);
  return seen;
}

export type PatternGroup = "used" | "refused" | "unseen";

/**
 * December's catalogue (§5.11.5): every pattern of the level in three groups
 * — used, refused (dealt but never played), never dealt — with its status.
 */
export function patternCatalogue<Id extends string>(
  level: LevelDefinition<Id>,
  state: GameState<Id>,
): { id: Id; group: PatternGroup; status: "live" | "removed" | null }[] {
  return level.darkOrder.map((id) => {
    const used = state.everDark.includes(id);
    const group: PatternGroup = used ? "used" : state.seenDark.includes(id) ? "refused" : "unseen";
    // Production first: `removedDark` remembers every cleaning and never
    // forgets, so a pattern cleaned out then shipped again is in both lists —
    // and it is the running one that December's ending counts.
    const status = state.active.includes(id) ? "live" : state.removedDark.includes(id) ? "removed" : used ? "live" : null;
    return { id, group, status };
  });
}

// ---------------------------------------------------------------- voice ---

export interface VoiceParams {
  rate: number;
  pitch: number;
  volume: number;
}

/** §5.10: the angry CEO speaks faster and lower; the cold one slower. */
export const VOICE_PARAMS: Readonly<Record<Mood, VoiceParams>> = {
  calm: { rate: 1.02, pitch: 0.85, volume: 0.9 },
  firm: { rate: 1.02, pitch: 0.78, volume: 0.9 },
  angry: { rate: 1.18, pitch: 0.62, volume: 1 },
  cold: { rate: 0.92, pitch: 0.7, volume: 0.9 },
};

export function voiceParams(mood: Mood): VoiceParams {
  return VOICE_PARAMS[mood];
}

/** The speech language, always set: without it Chrome may read French with an English voice (R17). */
export function voiceLang(locale: Locale): "fr-FR" | "en-US" {
  return locale === "fr" ? "fr-FR" : "en-US";
}
