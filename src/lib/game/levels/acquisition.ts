/**
 * Level 2 « Comment les gens vous trouvent » — its card identifiers and its
 * LevelDefinition. The spec is GAME-BRIEF.md §17, validated by Antoine on
 * 2026-10-01 (C30, `docs/decisions.md`). Still a draft in the code: no
 * page, no copy, no save key (`DraftLevelSlug`) until A12 wires it. The
 * level is a model the engine runs and the fixtures F2.1 to F2.4 pin, so the
 * numbers the spec quotes are the numbers the code produces.
 *
 * The shop is the mirror of level 1's streaming app: the board wants a
 * number UP (new customers a month, 2 000 in January, 3 000 in December)
 * where level 1 wanted churn down. Each card has the ROLE of a level 1 card
 * — the same place in the hand, the same weight — so the year keeps the
 * shape Antoine validated in four iterations: the tempting cards pay for two
 * quarters, the honest ones pay by December. The numbers are then tuned
 * until the four reference years hold the invariants of §6 (§17.6).
 *
 * No text lives here (5.5): names, pitches, the law and the cases are copy.
 *
 * Relative imports only (and types from `@/`): e2e specs import the engine
 * to build seeded saves, and Playwright does not resolve the `@/` alias.
 */
import type { CardDef, LevelDefinition } from "../types";

export const ACQUISITION_HONEST_IDS = [
  "delivery", "origin", "guides", "specs", "present", "allin", "compare", "verified", "clean",
] as const;

export const ACQUISITION_DARK_IDS = [
  "stock", "reviews", "countdown", "watchers", "anchor", "native", "teaser", "sponsored",
] as const;

export type AcquisitionHonestId = (typeof ACQUISITION_HONEST_IDS)[number];
export type AcquisitionDarkId = (typeof ACQUISITION_DARK_IDS)[number];
export type AcquisitionCardId = AcquisitionHonestId | AcquisitionDarkId;

// The level 1 card each one stands in for is at the end of its line: same
// place in the hand, same weight, so the year keeps its validated shape.
const CARDS = {
  // Honest cards — slow, and they raise a counter the dashboard never shows.
  delivery: { id: "delivery", kind: "h", perm: true, gain: 0.05, ramp: 0.09, trust: 4, radar: -2 }, // pause
  origin: { id: "origin", kind: "h", perm: false, insight: true, trust: 2 }, // survey
  guides: { id: "guides", kind: "h", perm: true, gain: 0, ramp: 0.12, trust: 3 }, // onboard
  specs: { id: "specs", kind: "h", perm: true, gain: 0.03, ramp: 0.08, trust: 3 }, // annual
  present: { id: "present", kind: "h", perm: false, present: true }, // present
  allin: { id: "allin", kind: "h", perm: true, gain: -0.01, trust: 8, radar: -8 }, // remind
  compare: { id: "compare", kind: "h", perm: true, gain: 0, ramp: 0.08, trust: 3 }, // reco
  verified: { id: "verified", kind: "h", perm: true, gain: -0.03, temp: true, trust: 10, radar: -20 }, // three
  clean: { id: "clean", kind: "h", perm: false, clean: true, onlyIfDark: true, trust: 6, radar: -25 }, // clean
  // Dark patterns, under the names they carry in a meeting.
  stock: { id: "stock", kind: "d", perm: true, gain: 0.12, trust: -4, radar: 10 }, // pdef
  reviews: { id: "reviews", kind: "d", perm: true, gain: 0.1, trust: -5, radar: 15 }, // bury
  countdown: { id: "countdown", kind: "d", perm: true, gain: 0.08, trust: -3, radar: 8 }, // cascade
  watchers: { id: "watchers", kind: "d", perm: true, gain: 0.03, trust: -2, radar: 3 }, // shame
  anchor: { id: "anchor", kind: "d", perm: true, gain: 0.18, trust: -10, radar: 25 }, // call
  native: { id: "native", kind: "d", perm: true, gain: 0.04, trust: -5, radar: 12 }, // social
  // The fees land on every order, not on the number the board watches.
  teaser: { id: "teaser", kind: "d", perm: true, gain: 0.04, revenueMult: 1.02, trust: -5, radar: 12 }, // notice
  sponsored: { id: "sponsored", kind: "d", perm: true, gain: 0.05, trust: -4, radar: 4 }, // streak
} as const satisfies Record<AcquisitionCardId, CardDef<AcquisitionCardId>>;

export const ACQUISITION_LEVEL: LevelDefinition<AcquisitionCardId, "acquisition"> = {
  slug: "acquisition",
  pillar: "acquisition",
  modelVersion: 1,
  constants: {
    direction: "up",
    metric0: 2_000,
    targets: [2_150, 2_350, 2_600, 3_000],
    // A bike shop: 60 000 past customers, 2 % of them order again in a month,
    // 380 € a basket — about 1,2 M€ a month in January.
    economy: { kind: "shop", basket: 380, customers0: 60_000, repeatRate: 0.02 },
    patience0: 55,
    trust0: 60,
    radar0: 10,
    picksPerQuarter: 2,
    honestCap: 0.43,
    darkCap: 0.82,
    floor: 400,
    // 3 000 as the tile shows it, rounded to the ten.
    win: 2_995,
    spikeDecay: 170,
    // A sports superstore's spring price cut on bikes (months 4 to 6).
    season: { months: [4, 5, 6], add: 100 },
    // Not level 1's administrative fine: what this shop does is a pratique
    // commerciale trompeuse, a criminal offence (C. consom. L132-2), which
    // the DGCCRF settles by a transaction pénale with the prosecutor's
    // agreement (L523-1) — Shein, 40 M€ in 2025. The ceiling for a company
    // online is 3,75 M€ or 10 % of turnover; 150 000 € is about 1 % of this
    // shop's year. GAME-BRIEF §17.3, kept by Antoine on 2026-10-01 (C30 Q3).
    control: {
      radar: 75, fine: 150_000, leaversRate: 0.015,
      radarAfter: 20, trustHit: -10, patienceHit: -15, spike: 500,
    },
    reports: { radar: 45, patienceHit: -5, trustHit: -3 },
    viral: { trust: 35, spike: 330, patienceHit: -5 },
    press: { trust: 80, months: 3, patienceBoost: 8, boost: 1.05 },
    patience: {
      hit: 12, missPerPoint: 0.084, missCap: 32, obeyed: 10, refused: -8,
      present: 15, fireBelow: 25, lowLine: 35,
    },
    competitorQuarter: 1,
  },
  display: {
    kind: "count",
    step: 10,
    severeMiss: 300,
    chart: { min: 1_000, max: 4_000, headroom: 100, tickFrom: 1_000, tickStep: 1_000, factor: 1 },
  },
  cards: CARDS,
  honestOrder: ACQUISITION_HONEST_IDS,
  darkOrder: ACQUISITION_DARK_IDS,
  darkFirstQuarter: ["stock", "reviews", "countdown", "watchers"],
  handSize: { honest: 6, dark: 5 },
  orderSchedule: [null, "stock", "anchor", "reviews"],
  orderPool: ["stock", "anchor", "reviews", "countdown", "teaser"],
  bannedAfterSanction: ["anchor", "reviews"],
};
