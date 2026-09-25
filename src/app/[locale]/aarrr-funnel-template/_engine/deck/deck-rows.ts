import type { DeckSlide } from "@/lib/engine/types";

/**
 * The rows `buildDeck` writes into a slide (lib/engine/deck.ts), named.
 *
 * `DeckSlide.lines` is typed `Record<string, string>[]` in the engine's
 * types: each record says what it is in its `row` key, and every value in it
 * is a string ALREADY finished by the model — a number formatted by
 * lib/engine/format.ts, a name, a whole sentence whose words phrases.ts
 * chose. The slides only place them (engine spec §6.12). A component that
 * formatted a number or assembled a sentence itself would be a second author,
 * and a second author is how a title and its body end up saying "+2 à +3 k€"
 * and "+1 400 à +2 600 €" on the same slide (the `s2-export.png` defect), or
 * a slide saying « un sprint · On ne le mesure pas » where the model says
 * « aucune mesure · Data · un sprint ».
 *
 * The model's own contract (deck.ts header): a row a slide prints as words
 * carries them finished in `text` and, when it is about one number or one
 * stage, `label`; `id` is a machine id, never printed. Where a slide needs
 * something the words don't give — a stage to group by, a verdict to order
 * by — it reads a machine field (`id`, `verdict`, `tone`, `key`) and derives
 * the structure from it, never a word.
 *
 * This file gives those records their shapes so a slide reads `row.value`,
 * not `line["value"] ?? ""`. The shapes are the model's, not ours: a unit
 * test (`__tests__/deck-rows.test.ts`) runs the real `buildDeck` on the §6.0
 * example in both languages and checks every record it writes against this
 * table, so a row renamed or a field dropped upstream fails there instead of
 * printing a blank on a slide.
 */
export interface DeckRows {
  // Slide 1 — the peloton
  /** "~3 200 visitors a month for 100 sign-ups · GA4 · August 2026", or the "not measured" sentence. */
  upstream: { text: string };
  /** The sign-ups column's referral share: `label` the column, `text` « par recommandation : 6 sur 100 ». */
  legendReferred: { label: string; text: string };
  /**
   * One per peloton column. `value` is the numeral over the grid ("" when the
   * column is unknown, never "0"; « moins de 1 » under half a person);
   * `source` the tool or status and the cohort month; `text` the whole line.
   */
  column: { id: string; label: string; value: string; source: string; text: string };
  // Slide 2 — the leak
  /** A step of the "what if" chain: `key` is today / if / then / times / annual / less-than-one. */
  calc: { key: string; label: string; text: string };
  /** Replaces the deck's common footer on this slide; it carries the assumptions (§9.3). */
  footer: { text: string };
  /** Another candidate and where it stands; `tone` (below | neutral | unknown) decides the emphasis only. */
  aside: { id: string; label: string; text: string; tone: string };
  blind: { text: string };
  // Slide 3 — visibility
  /** `label` is the STAGE (the export groups by it), `metric` the number's name, `status` its status label. */
  metric: { id: string; label: string; metric: string; status: string; text: string };
  /** A number not documented yet, quickest repair first; `repair` is the sort key, `text` cause · role · repair. */
  missing: { id: string; label: string; repair: string; text: string };
  // Slide 4 — unit economics (`value` is "" when the figure can't be computed)
  cac: { id: string; label: string; value: string; variant: string; text: string };
  payback: { id: string; label: string; value: string; note: string; text: string };
  ltv: { id: string; label: string; value: string; note: string; text: string };
  ltvCac: { id: string; label: string; value: string; note: string; text: string };
  /** The 36-month lifetime cap — written only when an LTV exists to be capped. */
  cap: { text: string };
  // Slide 5 — the mirror
  /** A verdict with its count, the label agreeing with it (« 1 angle mort », « 2 angles morts »). */
  verdictCount: { id: string; value: string; label: string };
  /** One Tour bridge. `verdict` is a machine id ("" without one), `tag` its label in the singular. */
  bridge: { id: string; questionId: string; label: string; verdict: string; tag: string; text: string };
  tourFooter: { text: string };
  // Slide 6 — the ask
  bullet: { text: string };
  cost: { text: string };
  know: { id: string; label: string; current: string; target: string; checkpoint: string; text: string };
  measure: { id: string; label: string; text: string };
  // Appendix
  annex: {
    id: string;
    label: string;
    formula: string;
    window: string;
    period: string;
    source: string;
    status: string;
    confidence: string;
    /** The user's own definitionNote — their private `note` never travels (§4.1). */
    definition: string;
    text: string;
  };
}

export type RowKind = keyof DeckRows;

/** Every field each row must carry — the table the contract test checks the real model against. */
export const ROW_FIELDS: { readonly [K in RowKind]: readonly (keyof DeckRows[K])[] } = {
  upstream: ["text"],
  legendReferred: ["label", "text"],
  column: ["id", "label", "value", "source", "text"],
  calc: ["key", "label", "text"],
  footer: ["text"],
  aside: ["id", "label", "text", "tone"],
  blind: ["text"],
  metric: ["id", "label", "metric", "status", "text"],
  missing: ["id", "label", "repair", "text"],
  cac: ["id", "label", "value", "variant", "text"],
  payback: ["id", "label", "value", "note", "text"],
  ltv: ["id", "label", "value", "note", "text"],
  ltvCac: ["id", "label", "value", "note", "text"],
  cap: ["text"],
  verdictCount: ["id", "value", "label"],
  bridge: ["id", "questionId", "label", "verdict", "tag", "text"],
  tourFooter: ["text"],
  bullet: ["text"],
  cost: ["text"],
  know: ["id", "label", "current", "target", "checkpoint", "text"],
  measure: ["id", "label", "text"],
  annex: ["id", "label", "formula", "window", "period", "source", "status", "confidence", "definition", "text"],
};

/** Whether a record is a well-formed row of that kind: every field present, every field a string. */
export function isRow<K extends RowKind>(line: Record<string, string>, kind: K): line is Record<string, string> & DeckRows[K] {
  return line.row === kind && ROW_FIELDS[kind].every((field) => typeof line[field as string] === "string");
}

/**
 * The rows of one kind, in the order the model wrote them. A malformed record
 * is skipped rather than drawn from missing fields: it shows up as a missing
 * line in review — and the contract test names it — instead of as a blank
 * that reads like data.
 */
export function rowsOf<K extends RowKind>(slide: DeckSlide, kind: K): DeckRows[K][] {
  return slide.lines.filter((line): line is Record<string, string> & DeckRows[K] => isRow(line, kind));
}

/** The first row of a kind, or undefined. */
export function rowOf<K extends RowKind>(slide: DeckSlide, kind: K): DeckRows[K] | undefined {
  return rowsOf(slide, kind)[0];
}
