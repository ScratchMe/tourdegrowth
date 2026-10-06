/**
 * The revenue level « Comment vous gagnez de l'argent » — its card
 * identifiers and its LevelDefinition, wired on 2026-10-06 (A24, REV-3): its
 * copy is `content/game/revenue.ts`, its page `app/[locale]/game/revenue/`.
 * The spec is `docs/game/revenue.md` (GAME-BRIEF §20), written on 2026-10-04
 * for an agent to build from; every number it quotes is one this file
 * produces, pinned by the fixtures F20.1 to F20.4 of
 * `__tests__/revenue.test.ts`.
 *
 * A fitness app with a subscription and a virtual currency: the board wants
 * the monthly revenue per active user UP, from 4,00 € in January to 6,00 €
 * in December — the same ×1,5 as level 2, so this level is level 2 scaled
 * card for card by role (the role is at the end of each line, level 1's
 * name). Its absolute constants are level 2's times 4 / 2 000, and its four
 * targets fall exactly on the cent the tile shows, so a reference year keeps
 * the patience Antoine validated.
 *
 * No text lives here (5.5): names, pitches, the law and the cases are copy.
 *
 * Relative imports only (and types from `@/`): e2e specs import the engine
 * to build seeded saves, and Playwright does not resolve the `@/` alias.
 */
import type { CardDef, LevelDefinition } from "../types";

export const REVENUE_HONEST_IDS = [
  "fullprice", "checkout", "downgrade", "programs", "present", "trialmail", "roundpacks", "renewmail", "clean",
] as const;

export const REVENUE_DARK_IDS = [
  "addon", "lootbox", "hiddensub", "pricing", "trial", "express", "renewal", "gems",
] as const;

export type RevenueHonestId = (typeof REVENUE_HONEST_IDS)[number];
export type RevenueDarkId = (typeof REVENUE_DARK_IDS)[number];
export type RevenueCardId = RevenueHonestId | RevenueDarkId;

// The level 1 card each one stands in for is at the end of its line; the
// numbers are level 2's for the same role (levels/acquisition.ts).
const CARDS = {
  // Honest cards — slow, and they raise a counter the dashboard never shows.
  fullprice: { id: "fullprice", kind: "h", perm: true, gain: 0.05, ramp: 0.09, trust: 4, radar: -2 }, // pause
  checkout: { id: "checkout", kind: "h", perm: false, insight: true, trust: 2 }, // survey
  downgrade: { id: "downgrade", kind: "h", perm: true, gain: 0, ramp: 0.12, trust: 3 }, // onboard
  programs: { id: "programs", kind: "h", perm: true, gain: 0.03, ramp: 0.08, trust: 3 }, // annual
  present: { id: "present", kind: "h", perm: false, present: true }, // present
  trialmail: { id: "trialmail", kind: "h", perm: true, gain: -0.01, trust: 8, radar: -8 }, // remind
  roundpacks: { id: "roundpacks", kind: "h", perm: true, gain: 0, ramp: 0.08, trust: 3 }, // reco
  renewmail: { id: "renewmail", kind: "h", perm: true, gain: -0.03, temp: true, trust: 10, radar: -20 }, // three
  clean: { id: "clean", kind: "h", perm: false, clean: true, onlyIfDark: true, trust: 6, radar: -25 }, // clean
  // Dark patterns, under the names they carry in a meeting.
  addon: { id: "addon", kind: "d", perm: true, gain: 0.12, trust: -4, radar: 10 }, // pdef
  lootbox: { id: "lootbox", kind: "d", perm: true, gain: 0.1, trust: -5, radar: 15 }, // bury
  hiddensub: { id: "hiddensub", kind: "d", perm: true, gain: 0.08, trust: -3, radar: 8 }, // cascade
  pricing: { id: "pricing", kind: "d", perm: true, gain: 0.03, trust: -2, radar: 3 }, // shame
  trial: { id: "trial", kind: "d", perm: true, gain: 0.18, trust: -10, radar: 25 }, // call
  express: { id: "express", kind: "d", perm: true, gain: 0.04, trust: -5, radar: 12 }, // social
  // Inactive subscribers keep paying: revenue the per-ACTIVE-user number never counts.
  renewal: { id: "renewal", kind: "d", perm: true, gain: 0.04, revenueMult: 1.02, trust: -5, radar: 12 }, // notice
  gems: { id: "gems", kind: "d", perm: true, gain: 0.05, trust: -4, radar: 4 }, // streak
} as const satisfies Record<RevenueCardId, CardDef<RevenueCardId>>;

export const REVENUE_LEVEL: LevelDefinition<RevenueCardId, "revenue"> = {
  slug: "revenue",
  pillar: "revenue",
  modelVersion: 1,
  constants: {
    direction: "up",
    metric0: 4,
    targets: [4.3, 4.7, 5.2, 6],
    // 200 000 active users at 4,00 € a month each: 0,80 M€ a month in
    // January. 10 000 arrive and 5 % stop each month, so the base holds still.
    economy: { kind: "arpu", customers0: 200_000, acq0: 10_000, leaveRate: 0.05 },
    patience0: 55,
    trust0: 60,
    radar0: 10,
    picksPerQuarter: 2,
    honestCap: 0.43,
    darkCap: 0.82,
    floor: 0.8,
    // 6,00 € as the tile shows it, rounded to the cent.
    win: 5.995,
    spikeDecay: 0.34,
    // A big-name fitness app halves its subscription in the spring (months 4
    // to 6): everybody discounts to keep up.
    season: { months: [4, 5, 6], add: 0.2 },
    // Two DGCCRF outcomes added up: a transaction pénale of 300 000 € with the
    // prosecutor's agreement for the misleading practices (C. consom. L132-2,
    // L523-1) and an administrative fine of 75 000 € for the missing
    // information (L242-10) — about 4 % of the app's year. A silent renewal
    // carries no fine at all (L215-1): docs/game/revenue.md §20.3. Fixed (C14).
    control: {
      radar: 75, fine: 375_000, leaversRate: 0.015,
      radarAfter: 20, trustHit: -10, patienceHit: -15, spike: 1,
    },
    reports: { radar: 45, patienceHit: -5, trustHit: -3 },
    viral: { trust: 35, spike: 0.66, patienceHit: -5 },
    press: { trust: 80, months: 3, patienceBoost: 8, boost: 1.05 },
    patience: {
      // 0,20 € missed costs 8,4 patience, as 100 customers did on level 2.
      hit: 12, missPerPoint: 42, missCap: 32, obeyed: 10, refused: -8,
      present: 15, fireBelow: 25, lowLine: 35,
    },
    competitorQuarter: 1,
  },
  display: {
    kind: "money",
    step: 0.01,
    severeMiss: 0.6,
    chart: { min: 2, max: 8, headroom: 0.2, tickFrom: 2, tickStep: 2, factor: 1 },
  },
  cards: CARDS,
  honestOrder: REVENUE_HONEST_IDS,
  darkOrder: REVENUE_DARK_IDS,
  darkFirstQuarter: ["addon", "lootbox", "hiddensub", "pricing"],
  handSize: { honest: 6, dark: 5 },
  orderSchedule: [null, "addon", "trial", "lootbox"],
  orderPool: ["addon", "trial", "lootbox", "hiddensub", "renewal"],
  bannedAfterSanction: ["trial", "lootbox"],
};
