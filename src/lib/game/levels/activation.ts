/**
 * The activation level « Comment ils comprennent ce que vous apportez » — its
 * card identifiers and its LevelDefinition, in DRAFT (`DraftLevelSlug`): no
 * page, no copy, no save yet. The spec is `docs/game/activation.md`
 * (GAME-BRIEF §18), written on 2026-10-04 for an agent to build from; every
 * number it quotes is one this file produces, pinned by the fixtures F18.1 to
 * F18.4 of `__tests__/activation.test.ts`.
 *
 * A scheduling tool for freelancers: the board wants the share of sign-ups
 * who publish a first schedule within seven days UP, from 30 % in January
 * to 45 % in December. Level 2 already made the engine serve a number that
 * goes up; this level is level 2 scaled to a rate, card for card by role
 * (the role is at the end of each line, level 1's name). Its absolute
 * constants are level 2's times 0,30 / 2 000, so a reference year keeps the
 * patience Antoine validated; only the targets differ, rounded to the tenth
 * of a point the tile shows (32,3 % where the exact scale gives 32,25 %).
 *
 * No text lives here (5.5): names, pitches, the law and the cases are copy.
 *
 * Relative imports only (and types from `@/`): e2e specs import the engine
 * to build seeded saves, and Playwright does not resolve the `@/` alias.
 */
import type { CardDef, LevelDefinition } from "../types";

export const ACTIVATION_HONEST_IDS = [
  "demo", "calls", "checklist", "import", "present", "refuse", "welcome", "minimal", "clean",
] as const;

export const ACTIVATION_DARK_IDS = [
  "bundle", "phone", "prechecked", "analysis", "banner", "pixels", "partners", "tour",
] as const;

export type ActivationHonestId = (typeof ACTIVATION_HONEST_IDS)[number];
export type ActivationDarkId = (typeof ACTIVATION_DARK_IDS)[number];
export type ActivationCardId = ActivationHonestId | ActivationDarkId;

// The level 1 card each one stands in for is at the end of its line; the
// numbers are level 2's for the same role (levels/acquisition.ts).
const CARDS = {
  // Honest cards — slow, and they raise a counter the dashboard never shows.
  demo: { id: "demo", kind: "h", perm: true, gain: 0.05, ramp: 0.09, trust: 4, radar: -2 }, // pause
  calls: { id: "calls", kind: "h", perm: false, insight: true, trust: 2 }, // survey
  checklist: { id: "checklist", kind: "h", perm: true, gain: 0, ramp: 0.12, trust: 3 }, // onboard
  import: { id: "import", kind: "h", perm: true, gain: 0.03, ramp: 0.08, trust: 3 }, // annual
  present: { id: "present", kind: "h", perm: false, present: true }, // present
  refuse: { id: "refuse", kind: "h", perm: true, gain: -0.01, trust: 8, radar: -8 }, // remind
  welcome: { id: "welcome", kind: "h", perm: true, gain: 0, ramp: 0.08, trust: 3 }, // reco
  minimal: { id: "minimal", kind: "h", perm: true, gain: -0.03, temp: true, trust: 10, radar: -20 }, // three
  clean: { id: "clean", kind: "h", perm: false, clean: true, onlyIfDark: true, trust: 6, radar: -25 }, // clean
  // Dark patterns, under the names they carry in a meeting.
  bundle: { id: "bundle", kind: "d", perm: true, gain: 0.12, trust: -4, radar: 10 }, // pdef
  phone: { id: "phone", kind: "d", perm: true, gain: 0.1, trust: -5, radar: 15 }, // bury
  prechecked: { id: "prechecked", kind: "d", perm: true, gain: 0.08, trust: -3, radar: 8 }, // cascade
  analysis: { id: "analysis", kind: "d", perm: true, gain: 0.03, trust: -2, radar: 3 }, // shame
  banner: { id: "banner", kind: "d", perm: true, gain: 0.18, trust: -10, radar: 25 }, // call
  pixels: { id: "pixels", kind: "d", perm: true, gain: 0.04, trust: -5, radar: 12 }, // social
  // The partners pay per contact passed on: revenue, not the number the board watches.
  partners: { id: "partners", kind: "d", perm: true, gain: 0.04, revenueMult: 1.02, trust: -5, radar: 12 }, // notice
  tour: { id: "tour", kind: "d", perm: true, gain: 0.05, trust: -4, radar: 4 }, // streak
} as const satisfies Record<ActivationCardId, CardDef<ActivationCardId>>;

export const ACTIVATION_LEVEL: LevelDefinition<ActivationCardId, "activation"> = {
  slug: "activation",
  pillar: "activation",
  modelVersion: 1,
  constants: {
    direction: "up",
    metric0: 0.3,
    targets: [0.323, 0.353, 0.39, 0.45],
    // 10 000 sign-ups a month, 60 000 active users who each bring 5 € a
    // month on average (the paid plan, spread over every active account):
    // 0,30 M€ a month in January. At 30 % activation and 5 % of actives
    // stopping each month, the base holds still.
    economy: { kind: "activation", customers0: 60_000, signups0: 10_000, leaveRate: 0.05, price: 5 },
    patience0: 55,
    trust0: 60,
    radar0: 10,
    picksPerQuarter: 2,
    honestCap: 0.43,
    darkCap: 0.82,
    floor: 0.06,
    // 45,0 % as the tile shows it, rounded to the tenth of a point.
    win: 0.4495,
    spikeDecay: 0.0255,
    // A competitor's free-for-life plan in the spring (months 4 to 6): the
    // curious sign up everywhere and publish nowhere.
    season: { months: [4, 5, 6], add: 0.015 },
    // An administrative fine by the CNIL's formation restreinte, made public:
    // about 3 % of the tool's year, between the published fines of small
    // firms (75 000 and 80 000 €) and a 43-person one (150 000 €) —
    // docs/game/activation.md §18.3 and §18.9. Fixed whatever the radar (C14).
    control: {
      radar: 75, fine: 100_000, leaversRate: 0.015,
      radarAfter: 20, trustHit: -10, patienceHit: -15, spike: 0.075,
    },
    reports: { radar: 45, patienceHit: -5, trustHit: -3 },
    viral: { trust: 35, spike: 0.0495, patienceHit: -5 },
    press: { trust: 80, months: 3, patienceBoost: 8, boost: 1.05 },
    patience: {
      // A point of activation missed costs 5,6 patience, as 100 customers did on level 2.
      hit: 12, missPerPoint: 560, missCap: 32, obeyed: 10, refused: -8,
      present: 15, fireBelow: 25, lowLine: 35,
    },
    competitorQuarter: 1,
  },
  display: {
    kind: "rate",
    step: 0.001,
    severeMiss: 0.045,
    chart: { min: 15, max: 60, headroom: 1.5, tickFrom: 15, tickStep: 15, factor: 100 },
  },
  cards: CARDS,
  honestOrder: ACTIVATION_HONEST_IDS,
  darkOrder: ACTIVATION_DARK_IDS,
  darkFirstQuarter: ["bundle", "phone", "prechecked", "analysis"],
  handSize: { honest: 6, dark: 5 },
  orderSchedule: [null, "bundle", "banner", "phone"],
  orderPool: ["bundle", "banner", "phone", "prechecked", "partners"],
  bannedAfterSanction: ["banner", "phone"],
};
