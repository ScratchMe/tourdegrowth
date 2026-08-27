/**
 * The 5 AARRR pillars ("étapes"), in the canonical order used throughout the
 * product: for display, for tie-breaking the weakest pillar (SPEC.md §6),
 * and as the iteration order for building the 15-question set.
 */
export const PILLARS = ["acquisition", "activation", "retention", "referral", "revenue"] as const;

export type Pillar = (typeof PILLARS)[number];
