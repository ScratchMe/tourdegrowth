/**
 * Level 1 « S'ils reviennent » — its card identifiers.
 *
 * Only the ids for now, so the content, storage and view work can type
 * against them while the engine chunk (G1) fills in the LevelDefinition —
 * constants and card parameters from GAME-BRIEF.md §5.4-5.5 — in this file.
 */
export const RETENTION_HONEST_IDS = [
  "pause", "survey", "onboard", "annual", "present", "remind", "reco", "three", "clean",
] as const;

export const RETENTION_DARK_IDS = [
  "pdef", "bury", "cascade", "shame", "call", "social", "notice", "streak",
] as const;

export type RetentionHonestId = (typeof RETENTION_HONEST_IDS)[number];
export type RetentionDarkId = (typeof RETENTION_DARK_IDS)[number];
export type RetentionCardId = RetentionHonestId | RetentionDarkId;
