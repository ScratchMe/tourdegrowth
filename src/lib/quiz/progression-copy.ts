import type { Progression } from "./progression";

/**
 * The three shapes a progression sentence takes — up, down, flat — resolved
 * in one place so the landing and the result page cannot drift apart on the
 * sign, and so neither has to reimplement "+8" versus "-8" versus "same".
 *
 * Takes the already-translated templates rather than the dictionary: the
 * landing's island must not pull `UI_STRINGS` into its bundle
 * (REVIEW-02.md R2-14).
 */
export interface ProgressionTemplates {
  up: string;
  down: string;
  flat: string;
}

export function progressionSentence(p: Progression, templates: ProgressionTemplates): string {
  const template = p.delta > 0 ? templates.up : p.delta < 0 ? templates.down : templates.flat;
  return template
    .replace("{prev}", String(p.previousTotal))
    .replace("{score}", String(p.currentTotal))
    // `String(-9)` already carries its sign; only the plus is in the copy.
    .replace("{delta}", String(p.delta));
}
