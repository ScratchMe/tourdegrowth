import type { Translatable } from "./translatable";

/**
 * The words of the space band (`brand/SpaceBand`) — design I + B, retained
 * by Antoine on 2026-09-28.
 *
 * In their own module, like `nav-strings.ts` (REVIEW-02.md R2-14): the band
 * renders in the quiz and the result, which are Client Components, so what
 * it imports ships to the browser. A dozen words cost nothing; the
 * dictionary would have come with them.
 *
 * The band never says « étape » / "stage" (Antoine, 2026-09-28): the product
 * already calls the five AARRR steps « étapes » (« Une étape te freine »,
 * « Étape 1 sur 5 — Acquisition »), and the band sits right above them. It
 * says « 1/3 · Plaine » — the race's number and the kind of stage, as a road
 * book prints it.
 */
export const SPACE_STRINGS = {
  // TODO: à relire (convention 6).
  /** The kind of stage each space is, in the road book's words. */
  kind: {
    tour: { fr: "Plaine", en: "Flat" },
    engine: { fr: "Contre-la-montre", en: "Time trial" },
    game: { fr: "Montagne", en: "Mountain" },
  },
  // TODO: à relire (convention 6).
  /** The space's name, set large on the band. */
  name: {
    tour: { fr: "Le diagnostic", en: "The check-up" },
    engine: { fr: "Le moteur", en: "The engine" },
    game: { fr: "Le côté obscur", en: "The dark side" },
  },
  // TODO: à relire (convention 6).
  /** The same, short, in the race's three pills. */
  short: {
    tour: { fr: "Diagnostic", en: "Check-up" },
    engine: { fr: "Moteur", en: "Engine" },
    game: { fr: "Côté obscur", en: "Dark side" },
  },
  // TODO: à relire (convention 6).
  /** On a pill whose space is not open yet (Antoine, 2026-09-28: the race stays whole, the closed ones greyed). */
  soon: { fr: "bientôt", en: "soon" },
  // TODO: à relire (convention 6).
  /** The race's accessible name on the band, and the heading of the landing's strip (`brand/SpaceStrip`). */
  race: { fr: "Le Tour en trois parties", en: "The Tour in three parts" },
} as const satisfies Record<string, Translatable | Record<string, Translatable>>;
