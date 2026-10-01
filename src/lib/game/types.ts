/**
 * The game's contract — GAME-BRIEF.md and the implementation plan §3.2.
 *
 * Written first and frozen: the engine, the level content, storage, views
 * and the island all build against these shapes in parallel. Numbers only —
 * no string a player reads ever lives here (the copy layer resolves text
 * from ids and structured events, which is what lets a game in progress
 * switch language and re-render its whole journal).
 */
import type { Pillar } from "@/lib/scoring/pillars";

/** The levels a player can reach: each has a page, a save, an entry card and its analytics. */
export type LevelSlug = "retention";
/**
 * A level whose model is written and tested but not yet wired to a page —
 * level 2 (GAME-BRIEF §17, validated on 2026-10-01) until `CHANTIERS.md` A12
 * wires it. Kept out of `LevelSlug` on purpose: every record keyed by it (the
 * save, the result page's entry card, the analytics) would otherwise demand
 * copy and decisions for a level nobody can play. Wiring the level is moving
 * its slug from here to there, and letting the compiler list what it needs.
 */
export type DraftLevelSlug = "acquisition";
/** Any level the engine can run: published or still a draft. */
export type ModelSlug = LevelSlug | DraftLevelSlug;
export type CardKind = "h" | "d";
export type Mood = "calm" | "firm" | "angry" | "cold";
export type EndingId = "firedDark" | "firedClean" | "applause" | "cleanMiss" | "fine" | "repentant" | "labyrinth";

/**
 * Which way the level's number has to go for the board: churn DOWN (level 1),
 * new customers UP (level 2, GAME-BRIEF §17). Every card's `gain` moves the
 * number that way; the engine reads the direction once, where a gap, a win
 * or a formula needs a sign, so no call site has to remember it.
 */
export type Direction = "down" | "up";

/** Paramètres numériques d'une carte — jamais de texte ici (5.5). */
export interface CardDef<Id extends string = string> {
  id: Id;
  kind: CardKind;
  perm: boolean;          // reste en production
  /**
   * Moves the level's number the way the board wants, from the day the card
   * ships: a churn cut on level 1, a lift in new customers on level 2. The
   * brief's `red` (§5.5), renamed when a second level made "reduction" wrong
   * half the time. Negative: the card costs some of the number.
   */
  gain?: number;
  ramp?: number;          // gain à partir de l'âge 4
  temp?: boolean;         // gain nul à partir de l'âge 3
  trust?: number;         // appliqué une fois, au choix
  radar?: number;         // idem
  revenueMult?: number;   // multiplicateur de revenu (le `mrr` du brief)
  extra?: boolean;        // un mois de plus facturé aux partants (économie d'abonnement)
  clicks?: number | "phone"; // la pastille du téléphone du niveau 1 ; Infinity du prototype → "phone"
  insight?: boolean;
  present?: boolean;
  clean?: boolean;
  onlyIfDark?: boolean;
}

/**
 * How a month turns the level's number into customers and revenue. Level 1
 * is a subscription: its number is the share that LEAVES, and new
 * subscribers come in at a rate trust bends. Level 2 is a shop: its number
 * is the customers who COME, and the ones already won buy again at a rate
 * trust bends. Two shapes of business, not two tunings of one — hence a
 * union rather than optional fields.
 */
export type Economy =
  | {
      kind: "subscription";
      /** Monthly price. */
      price: number;
      customers0: number;
      /** New subscribers a month at trust 60. */
      acq0: number;
    }
  | {
      kind: "shop";
      /** Average order, in euros. */
      basket: number;
      /** Customers already won on January 1st. */
      customers0: number;
      /** Share of past customers who order again in a month, at trust 60. */
      repeatRate: number;
    };

export interface ModelConstants {
  direction: Direction;
  /** The level's number on January 1st (churn 0,06 ; new customers 2 000). */
  metric0: number;
  /** The number the board wants at the end of each quarter. */
  targets: readonly [number, number, number, number];
  /** Level 1: churn never goes under it. Level 2: new customers never go under it. */
  floor: number;
  /** The board's number as the tile shows it: at or past it, December is a win (computeEnding). */
  win: number;
  economy: Economy;
  patience0: number; trust0: number; radar0: number;
  picksPerQuarter: 2; honestCap: number; darkCap: number;
  /** How much of a spike wears off each month, in the level's unit (0,005 of churn on level 1). */
  spikeDecay: number;
  /** A month of the calendar that works against the number (a competitor's spring offer). */
  season: { months: readonly number[]; add: number };
  control: { radar: number; fine: number; leaversRate: number;
             radarAfter: number; trustHit: number; patienceHit: number; spike: number };
  reports: { radar: number; patienceHit: number; trustHit: number };
  viral: { trust: number; spike: number; patienceHit: number };
  /** `boost`: the good press multiplies the month's inflow — new subscribers, or new customers. */
  press: { trust: number; months: number; patienceBoost: number; boost: number };
  patience: { hit: number; missPerPoint: number; missCap: number; obeyed: number; refused: number;
              present: number; fireBelow: number; lowLine: number };
  competitorQuarter: number;        // 1
}

/** The frame of a December curve, in the unit it is plotted in (view.ts `chartScale`). */
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

/** How the level's number reads — still numbers only; the island picks the formatter. */
export interface MetricDisplay {
  /** A rate shown in percent to one decimal (churn), or a count of people (new customers). */
  kind: "rate" | "count";
  /** The step the tiles round to and the report's drivers add up at: a tenth of a point, one customer. */
  step: number;
  /** A quarter missed by more than this reads as a bad miss (red), less as a near one. */
  severeMiss: number;
  /** December's curve: the model's unit times `factor` is what is plotted (100 turns a rate into percent). */
  chart: ScaleSpec & { factor: number };
}

export interface LevelDefinition<Id extends string = string, Slug extends ModelSlug = LevelSlug> {
  slug: Slug;
  pillar: Pillar;
  modelVersion: number;             // incrémenté à toute modification du modèle → sauvegardes ignorées
  constants: ModelConstants;
  display: MetricDisplay;
  cards: Readonly<Record<Id, CardDef<Id>>>;
  honestOrder: readonly Id[];       // pause, survey, onboard, annual, present, remind, reco, three, clean
  darkOrder: readonly Id[];         // pdef, bury, cascade, shame, call, social, notice, streak
  darkFirstQuarter: readonly Id[];  // pdef, bury, cascade, shame
  handSize: { honest: number; dark: number };   // 6, 5
  orderSchedule: readonly (Id | null)[];        // [null, pdef, call, bury]
  orderPool: readonly Id[];                     // pdef, call, bury, cascade, notice
  bannedAfterSanction: readonly Id[];           // call, bury
}

/** One month of the year: the level's number, trust, customers and revenue at its end. */
export interface MonthPoint { m: number; metric: number; trust: number; customers: number; revenue: number }

export type VisibleEffect =
  | { kind: "insight" }
  | { kind: "present" }
  | { kind: "clean" }
  | { kind: "extra" }
  /** The number moved the board's way (churn down, customers up); `rising` while a ramp is still coming. */
  | { kind: "gain"; pct: number; rising: boolean }
  /** The number moved against it — an honest card that costs some of it. */
  | { kind: "loss"; pct: number }
  | { kind: "none" };

export type GameEvent =
  | { kind: "midMail"; moving: boolean }
  | { kind: "present" }
  /** The exit survey picked this quarter: its answers are in, the data review with the CEO is unlocked. */
  | { kind: "surveyAnswers" }
  /** `removed`: the patterns the inspection made the team take down — read back by next quarter's drivers. */
  | { kind: "control"; fine: number; leavers: number; removed: string[] }
  | { kind: "reports" }
  | { kind: "viral" }
  | { kind: "press" }
  | { kind: "competitor" };

export interface BossLine { verdict: "hit" | "cover" | "missed"; order: "obeyed" | "refused" | null }

/**
 * Why the level's number moved over one quarter, in its own unit (level 1:
 * churn fraction, 0.004 = 0,4 point ; level 2: customers). The five sum
 * EXACTLY to `metricEnd - metricStart`: `word` is computed as the remainder,
 * so a rounding or the floor can never make the report's lines disagree with
 * its tile (Antoine, 2026-09-25: « difficile de comprendre pourquoi les
 * chiffres ont bougé autant »).
 */
export interface MetricDrivers {
  /** The two cards picked this quarter, cleaning included. */
  picks: number;
  /** What was already in production: ramps coming in, patterns wearing off. */
  production: number;
  /** The patterns an inspection forced down at the end of the quarter before: what they held up falls back. */
  inspection: number;
  /** What customers say — trust, a viral thread, an inspection's rush of leavers, good press. Never the trust figure itself. */
  word: number;
  /** The competitor's spring offer coming in or going away. */
  market: number;
}

export interface QuarterLog<Id extends string = string> {
  q: number; picked: Id[]; order: Id | null;
  fx: { card: Id; effect: VisibleEffect }[];
  metricStart: number; metricEnd: number; target: number;
  /** Positive when the quarter missed its target, in the level's unit, whichever way the number has to go. */
  gap: number;
  customers: number; revenue: number; patience: number;
  events: GameEvent[]; boss: BossLine; moodAfter: Mood;
  drivers: MetricDrivers;
}

/** Quel message le DG dit à l'ouverture de la visio — le texte est résolu par la couche copie. */
export type BossMessageSpec =
  | { kind: "t1" }
  | { kind: "quarter"; q: 1 | 2 | 3; hit: boolean; metricPrev: number; target: number; order: string | null }
  | { kind: "yearEnd" }
  | { kind: "fired" };

/**
 * `v` is the shape of this object: 2 since the engine serves more than one
 * level (2026-09-30), when churn, subs and mrr became metric, customers and
 * revenue. A save of another shape is never read (storage-keys.ts).
 */
export interface GameState<Id extends string = string> {
  v: 2;
  level: ModelSlug;
  q: number; month: number;
  /** The level's number: churn on level 1, new customers of the month on level 2. */
  metric: number;
  customers: number; revenue: number;
  trust: number; radar: number; patience: number; lagTrust: number;
  callOpen: boolean;
  order: Id | null; orders: Id[]; obeyed: Id[]; refused: Id[];
  active: Id[]; since: Partial<Record<Id, number>>;
  everDark: Id[]; removedDark: Id[]; seenDark: Id[];
  insight: boolean; presented: number; picks: Id[];
  history: MonthPoint[]; log: QuarterLog<Id>[];
  sanction: boolean; fired: boolean; over: boolean; ending: EndingId | null;
  spike: number; press: number;
  session?: string;                 // 9.4, mode classe — non utilisé en v1
}

export type GameAction<Id extends string = string> =
  | { type: "hangup" }
  | { type: "toggle"; card: Id }
  | { type: "run" }
  | { type: "reset" }
  | { type: "restore"; state: GameState<Id> };
