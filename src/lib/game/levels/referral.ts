/**
 * The referral level « S'ils vous recommandent » — its card identifiers and
 * its LevelDefinition, wired on 2026-10-05 (A24, REF-3): its copy is
 * `content/game/referral.ts`, its page `app/[locale]/game/referral/`. The spec
 * is `docs/game/referral.md` (GAME-BRIEF §19), written on 2026-10-04 for an
 * agent to build from; every number it quotes is one this file produces,
 * pinned by the fixtures F19.1 to F19.4 of `__tests__/referral.test.ts`.
 *
 * An app for splitting costs with friends: the board wants the viral
 * coefficient UP, from 0,40 in January to 0,60 in December — the same ×1,5
 * as level 2, so this level is level 2 scaled card for card by role (the
 * role is at the end of each line, level 1's name). Its absolute constants
 * are level 2's times 0,40 / 2 000, and its four targets fall exactly on the
 * hundredth the tile shows, so a reference year keeps the patience Antoine
 * validated.
 *
 * No text lives here (5.5): names, pitches, the law and the cases are copy.
 *
 * Relative imports only (and types from `@/`): e2e specs import the engine
 * to build seeded saves, and Playwright does not resolve the `@/` alias.
 */
import type { CardDef, LevelDefinition } from "../types";

export const REFERRAL_HONEST_IDS = [
  "fairbonus", "guests", "recap", "guestpage", "present", "chosen", "grouplink", "nobook", "clean",
] as const;

export const REFERRAL_DARK_IDS = [
  "contacts", "bigshare", "fakeinvite", "unlock", "autoinvite", "shadow", "bonus", "reviewgate",
] as const;

export type ReferralHonestId = (typeof REFERRAL_HONEST_IDS)[number];
export type ReferralDarkId = (typeof REFERRAL_DARK_IDS)[number];
export type ReferralCardId = ReferralHonestId | ReferralDarkId;

// The level 1 card each one stands in for is at the end of its line; the
// numbers are level 2's for the same role (levels/acquisition.ts), except the
// honest gains and ramps, × 0,99 (C86, 2026-10-04): the tile rounds to the
// hundredth, so a year ending at 0,595 already shows 0,60 and wins, and a
// random honest player was applauded 49 % of the time against level 2's 43 %.
// One percent off the honest effects brings it back to 43 % and leaves the
// reference years where they were.
const CARDS = {
  // Honest cards — slow, and they raise a counter the dashboard never shows.
  fairbonus: { id: "fairbonus", kind: "h", perm: true, gain: 0.0495, ramp: 0.0891, trust: 4, radar: -2 }, // pause
  guests: { id: "guests", kind: "h", perm: false, insight: true, trust: 2 }, // survey
  recap: { id: "recap", kind: "h", perm: true, gain: 0, ramp: 0.1188, trust: 3 }, // onboard
  guestpage: { id: "guestpage", kind: "h", perm: true, gain: 0.0297, ramp: 0.0792, trust: 3 }, // annual
  present: { id: "present", kind: "h", perm: false, present: true }, // present
  chosen: { id: "chosen", kind: "h", perm: true, gain: -0.01, trust: 8, radar: -8 }, // remind
  grouplink: { id: "grouplink", kind: "h", perm: true, gain: 0, ramp: 0.0792, trust: 3 }, // reco
  nobook: { id: "nobook", kind: "h", perm: true, gain: -0.03, temp: true, trust: 10, radar: -20 }, // three
  clean: { id: "clean", kind: "h", perm: false, clean: true, onlyIfDark: true, trust: 6, radar: -25 }, // clean
  // Dark patterns, under the names they carry in a meeting.
  contacts: { id: "contacts", kind: "d", perm: true, gain: 0.12, trust: -4, radar: 10 }, // pdef
  bigshare: { id: "bigshare", kind: "d", perm: true, gain: 0.1, trust: -5, radar: 15 }, // bury
  fakeinvite: { id: "fakeinvite", kind: "d", perm: true, gain: 0.08, trust: -3, radar: 8 }, // cascade
  unlock: { id: "unlock", kind: "d", perm: true, gain: 0.03, trust: -2, radar: 3 }, // shame
  autoinvite: { id: "autoinvite", kind: "d", perm: true, gain: 0.18, trust: -10, radar: 25 }, // call
  shadow: { id: "shadow", kind: "d", perm: true, gain: 0.04, trust: -5, radar: 12 }, // social
  // The bonuses promised are rarely paid out: money kept, not the number the board watches.
  bonus: { id: "bonus", kind: "d", perm: true, gain: 0.04, revenueMult: 1.02, trust: -5, radar: 12 }, // notice
  reviewgate: { id: "reviewgate", kind: "d", perm: true, gain: 0.05, trust: -4, radar: 4 }, // streak
} as const satisfies Record<ReferralCardId, CardDef<ReferralCardId>>;

export const REFERRAL_LEVEL: LevelDefinition<ReferralCardId, "referral"> = {
  slug: "referral",
  pillar: "referral",
  modelVersion: 1,
  constants: {
    direction: "up",
    metric0: 0.4,
    targets: [0.43, 0.47, 0.52, 0.6],
    // A million users, 26 000 a month arriving from outside, each of those
    // bringing k more through three waves of invitations; 4 % stop each
    // month; 0,20 € a user a month (premium and partners, averaged): 0,20 M€
    // a month in January. At k = 0,40 the base holds still.
    economy: { kind: "viral", customers0: 1_000_000, organic0: 26_000, leaveRate: 0.04, arpu: 0.2 },
    patience0: 55,
    trust0: 60,
    radar0: 10,
    picksPerQuarter: 2,
    honestCap: 0.43,
    darkCap: 0.82,
    floor: 0.08,
    // 0,60 as the tile shows it, rounded to the hundredth.
    win: 0.595,
    spikeDecay: 0.034,
    // A rival app pays 5 € a referral in the spring (months 4 to 6): the
    // invitations go to it.
    season: { months: [4, 5, 6], add: 0.02 },
    // An administrative fine by the CNIL's formation restreinte, made public:
    // about 3 % of the app's year, for breaches that add up (GDPR articles 6
    // and 14, minimisation, prospection) — docs/game/referral.md §19.3 and
    // §19.9, C84. Fixed (C14).
    control: {
      radar: 75, fine: 75_000, leaversRate: 0.015,
      radarAfter: 20, trustHit: -10, patienceHit: -15, spike: 0.1,
    },
    reports: { radar: 45, patienceHit: -5, trustHit: -3 },
    viral: { trust: 35, spike: 0.066, patienceHit: -5 },
    press: { trust: 80, months: 3, patienceBoost: 8, boost: 1.05 },
    patience: {
      // 0,02 of coefficient missed costs 8,4 patience, as 100 customers did on level 2.
      hit: 12, missPerPoint: 420, missCap: 32, obeyed: 10, refused: -8,
      present: 15, fireBelow: 25, lowLine: 35,
    },
    competitorQuarter: 1,
  },
  display: {
    kind: "ratio",
    step: 0.01,
    severeMiss: 0.06,
    // Plotted in hundredths: `chartScale` rounds the frame to whole units, and
    // in the model's own unit a 0,60 curve would get a frame from 0 to 1.
    chart: { min: 20, max: 80, headroom: 2, tickFrom: 20, tickStep: 20, factor: 100 },
  },
  cards: CARDS,
  honestOrder: REFERRAL_HONEST_IDS,
  darkOrder: REFERRAL_DARK_IDS,
  darkFirstQuarter: ["contacts", "bigshare", "fakeinvite", "unlock"],
  handSize: { honest: 6, dark: 5 },
  orderSchedule: [null, "contacts", "autoinvite", "bigshare"],
  orderPool: ["contacts", "autoinvite", "bigshare", "fakeinvite", "bonus"],
  bannedAfterSanction: ["autoinvite", "bigshare"],
};
