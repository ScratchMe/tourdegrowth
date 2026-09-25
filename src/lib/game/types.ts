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

export type LevelSlug = "retention";
export type CardKind = "h" | "d";
export type Mood = "calm" | "firm" | "angry" | "cold";
export type EndingId = "firedDark" | "firedClean" | "applause" | "cleanMiss" | "fine" | "repentant" | "labyrinth";

/** Paramètres numériques d'une carte — jamais de texte ici (5.5). */
export interface CardDef<Id extends string = string> {
  id: Id;
  kind: CardKind;
  perm: boolean;          // reste en production
  red?: number;           // réduction immédiate
  ramp?: number;          // réduction à partir de l'âge 4
  temp?: boolean;         // réduction nulle à partir de l'âge 3
  trust?: number;         // appliqué une fois, au choix
  radar?: number;         // idem
  mrr?: number;           // multiplicateur de revenu par abonné
  extra?: boolean;        // un mois de plus facturé aux partants
  clicks?: number | "phone"; // Infinity du prototype → "phone" (JSON-sérialisable)
  insight?: boolean;
  present?: boolean;
  clean?: boolean;
  onlyIfDark?: boolean;
}

export interface ModelConstants {
  price: number; subs0: number; churn0: number; acq0: number;
  targets: readonly [number, number, number, number];
  patience0: number; trust0: number; radar0: number;
  picksPerQuarter: 2; honestCap: number; darkCap: number; churnFloor: number;
  winChurn: number;                 // 0,041 (computeEnding)
  season: { months: readonly number[]; add: number };       // mois 4-6, +0,003
  control: { radar: number; fineBase: number; finePerPoint: number; leaversRate: number;
             radarAfter: number; trustHit: number; patienceHit: number; spike: number };
  reports: { radar: number; patienceHit: number; trustHit: number };
  viral: { trust: number; spike: number; patienceHit: number };
  press: { trust: number; months: number; patienceBoost: number; acqBoost: number };
  patience: { hit: number; missPerPoint: number; missCap: number; obeyed: number; refused: number;
              presentInsight: number; presentBlind: number; fireBelow: number; lowLine: number };
  competitorQuarter: number;        // 1
}

export interface LevelDefinition<Id extends string = string> {
  slug: LevelSlug;
  pillar: Pillar;
  modelVersion: number;             // incrémenté à toute modification du modèle → sauvegardes ignorées
  constants: ModelConstants;
  cards: Readonly<Record<Id, CardDef<Id>>>;
  honestOrder: readonly Id[];       // pause, survey, onboard, annual, present, remind, reco, three, clean
  darkOrder: readonly Id[];         // pdef, bury, cascade, shame, call, social, notice, streak
  darkFirstQuarter: readonly Id[];  // pdef, bury, cascade, shame
  handSize: { honest: number; dark: number };   // 6, 5
  orderSchedule: readonly (Id | null)[];        // [null, pdef, call, bury]
  orderPool: readonly Id[];                     // pdef, call, bury, cascade, notice
  bannedAfterSanction: readonly Id[];           // call, bury
}

export interface MonthPoint { m: number; churn: number; trust: number; subs: number; mrr: number }

export type VisibleEffect =
  | { kind: "insight" }
  | { kind: "present"; insight: boolean }
  | { kind: "clean" }
  | { kind: "extra" }
  | { kind: "down"; pct: number; rising: boolean }
  | { kind: "up"; pct: number }
  | { kind: "none" };

export type GameEvent =
  | { kind: "midMail"; moving: boolean }
  | { kind: "present"; insight: boolean }
  | { kind: "control"; fine: number; leavers: number }
  | { kind: "reports" }
  | { kind: "viral" }
  | { kind: "press" }
  | { kind: "competitor" };

export interface BossLine { verdict: "hit" | "cover" | "missed"; order: "obeyed" | "refused" | null }

export interface QuarterLog<Id extends string = string> {
  q: number; picked: Id[]; order: Id | null;
  fx: { card: Id; effect: VisibleEffect }[];
  churnStart: number; churnEnd: number; target: number; gap: number;
  subs: number; mrr: number; patience: number;
  events: GameEvent[]; boss: BossLine; moodAfter: Mood;
}

/** Quel message le DG dit à l'ouverture de la visio — le texte est résolu par la couche copie. */
export type BossMessageSpec =
  | { kind: "t1" }
  | { kind: "quarter"; q: 1 | 2 | 3; hit: boolean; churnPrev: number; target: number; order: string | null }
  | { kind: "yearEnd" }
  | { kind: "fired" };

export interface GameState<Id extends string = string> {
  v: 1;
  level: LevelSlug;
  q: number; month: number;
  subs: number; churn: number; mrr: number;
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
