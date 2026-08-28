import { QUESTIONS as COPY_LIBRARY_QUESTIONS } from "@/content/copy-library";
import type { Pillar } from "./pillars";

export interface Question {
  /** Stable id from content/copy-library.ts (`acq-1`, `act-2`, …) — used as the key in the Answers record. */
  id: string;
  pillar: Pillar;
}

/**
 * The 15 questions (3 per pillar, canonical AARRR order), structure only —
 * derived from `content/copy-library.ts` (the id -> pillar assignment is
 * definitive there; this just re-exposes the shape the scoring/navigation
 * layer already depends on, so those call sites didn't need to change when
 * the display copy moved from a temporary dictionary entry to the delivered
 * content library — see SPEC-ADDENDUM-01.md §0).
 */
export const QUESTIONS: readonly Question[] = COPY_LIBRARY_QUESTIONS.map((q) => ({ id: q.id, pillar: q.pillar }));
