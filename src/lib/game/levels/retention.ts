/**
 * Level 1 « S'ils reviennent » — its card identifiers and its LevelDefinition.
 *
 * Every number here is ported from the prototype
 * (`design/game/prototype-s-ils-reviennent.html`, the `CARDS` table and the
 * constants at the top of its script) and tabled in GAME-BRIEF.md §5.4-5.5.
 * They are the balance of the game: the fixtures F1-F5 in
 * `__tests__/fixtures.test.ts` pin the outcome of four reference years, so a
 * change here that moves a fixture is a rebalancing, not a tweak — regenerate
 * F1-F4, keep F5 green, and bump `modelVersion` so saved games from the old
 * model are ignored instead of resumed into a world that no longer adds up.
 *
 * No text lives here (5.5): names, pitches, the law and the cases are copy,
 * resolved by the content layer from these ids.
 *
 * Relative imports only (and types from `@/`): e2e specs import the engine
 * to build seeded saves, and Playwright does not resolve the `@/` alias.
 */
import type { CardDef, LevelDefinition } from "../types";

export const RETENTION_HONEST_IDS = [
  "pause", "survey", "onboard", "annual", "present", "remind", "reco", "three", "clean",
] as const;

export const RETENTION_DARK_IDS = [
  "pdef", "bury", "cascade", "shame", "call", "social", "notice", "streak",
] as const;

export type RetentionHonestId = (typeof RETENTION_HONEST_IDS)[number];
export type RetentionDarkId = (typeof RETENTION_DARK_IDS)[number];
export type RetentionCardId = RetentionHonestId | RetentionDarkId;

const CARDS = {
  // Honest cards — slow, and they raise a counter the dashboard never shows.
  pause: { id: "pause", kind: "h", perm: true, red: 0.04, ramp: 0.07, trust: 4, radar: -2 },
  survey: { id: "survey", kind: "h", perm: false, insight: true, trust: 2 },
  onboard: { id: "onboard", kind: "h", perm: true, red: 0, ramp: 0.09, trust: 3 },
  annual: { id: "annual", kind: "h", perm: true, red: 0.02, ramp: 0.06, mrr: 0.97, trust: 3 },
  remind: { id: "remind", kind: "h", perm: true, red: -0.01, trust: 8, radar: -8 },
  reco: { id: "reco", kind: "h", perm: true, red: 0, ramp: 0.06, trust: 3 },
  three: { id: "three", kind: "h", perm: true, red: -0.02, temp: true, trust: 10, radar: -20 },
  present: { id: "present", kind: "h", perm: false, present: true },
  clean: { id: "clean", kind: "h", perm: false, clean: true, onlyIfDark: true, trust: 6, radar: -25 },
  // Dark patterns, under the names they carry in a meeting. `clicks` is what
  // each adds to the cancellation path; "phone" is the prototype's Infinity,
  // spelled so the definition survives JSON.
  bury: { id: "bury", kind: "d", perm: true, red: 0.08, trust: -5, radar: 15, clicks: 3 },
  call: { id: "call", kind: "d", perm: true, red: 0.14, trust: -10, radar: 25, clicks: "phone" },
  cascade: { id: "cascade", kind: "d", perm: true, red: 0.06, trust: -3, radar: 8, clicks: 3 },
  shame: { id: "shame", kind: "d", perm: true, red: 0.02, trust: -2, radar: 3, clicks: 0 },
  social: { id: "social", kind: "d", perm: true, red: 0.03, trust: -5, radar: 12, clicks: 0 },
  notice: { id: "notice", kind: "d", perm: true, red: 0, extra: true, trust: -5, radar: 12, clicks: 1 },
  pdef: { id: "pdef", kind: "d", perm: true, red: 0.09, trust: -4, radar: 10, clicks: 1 },
  streak: { id: "streak", kind: "d", perm: true, red: 0.04, trust: -4, radar: 4, clicks: 0 },
} as const satisfies Record<RetentionCardId, CardDef<RetentionCardId>>;

export const RETENTION_LEVEL: LevelDefinition<RetentionCardId> = {
  slug: "retention",
  pillar: "retention",
  modelVersion: 1,
  constants: {
    price: 12.99,
    subs0: 100_000,
    churn0: 0.06,
    acq0: 5_000,
    targets: [0.056, 0.051, 0.046, 0.04],
    patience0: 55,
    trust0: 60,
    radar0: 10,
    picksPerQuarter: 2,
    honestCap: 0.3,
    darkCap: 0.45,
    churnFloor: 0.012,
    // Slightly above the board's 4 %: 4,0 % on screen is a win even when the
    // unrounded value is 4,04 — the player is judged on what the tile shows.
    winChurn: 0.041,
    // A competitor's aggressive spring offer (months 4 to 6).
    season: { months: [4, 5, 6], add: 0.003 },
    // Every "hit" below is a signed delta, added as is: the sign is the rule,
    // so no call site has to remember which ones to subtract.
    control: {
      radar: 75, fineBase: 60_000, finePerPoint: 500, leaversRate: 0.015,
      radarAfter: 20, trustHit: -10, patienceHit: -15, spike: 0.015,
    },
    reports: { radar: 45, patienceHit: -5, trustHit: -3 },
    viral: { trust: 35, spike: 0.01, patienceHit: -5 },
    press: { trust: 80, months: 3, patienceBoost: 8, acqBoost: 1.2 },
    patience: {
      hit: 12, missPerPoint: 2800, missCap: 32, obeyed: 10, refused: -8,
      presentInsight: 15, presentBlind: 3, fireBelow: 25, lowLine: 35,
    },
    competitorQuarter: 1,
  },
  cards: CARDS,
  honestOrder: RETENTION_HONEST_IDS,
  darkOrder: RETENTION_DARK_IDS,
  darkFirstQuarter: ["pdef", "bury", "cascade", "shame"],
  handSize: { honest: 6, dark: 5 },
  orderSchedule: [null, "pdef", "call", "bury"],
  orderPool: ["pdef", "call", "bury", "cascade", "notice"],
  bannedAfterSanction: ["call", "bury"],
};
