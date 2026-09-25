import type { DeckSlide } from "@/lib/engine/types";

/**
 * The rows `buildDeck` writes into a slide (lib/engine/deck.ts), named.
 *
 * `DeckSlide.lines` is typed `Record<string, string>[]` in the engine's
 * types: each record says what it is in its `row` key, and every value in it
 * is a string ALREADY formatted by lib/engine/format.ts — a number, a name, a
 * whole sentence. The slides only place them (engine spec §6.12). A component
 * that formatted a number itself would be a second formatter, and a second
 * formatter is how a title and its body end up saying "+2 à +3 k€" and
 * "+1 400 à +2 600 €" on the same slide (the `s2-export.png` defect).
 *
 * This file gives those records their shapes so a slide reads `row.n`, not
 * `line["n"] ?? ""`. The shapes are the model's, not ours: a unit test
 * (`__tests__/deck-rows.test.ts`) runs the real `buildDeck` on the §6.0
 * example in both languages and checks every record it writes against this
 * table, so a row renamed or a field dropped upstream fails there instead of
 * printing a blank on a slide.
 */
export interface DeckRows {
  // Slide 1 — the peloton
  /** `n` is the visitors count WITHOUT its "~" (the template writes it). */
  upstream: { n: string; source: string; month: string };
  /** One per peloton column; `n` is "" when the column is unknown, never "0". */
  column: { metric: string; n: string; source: string; period: string };
  // Slide 2 — the leak
  /** A step of the "what if" chain: `key` is today / if / then / times / annual / less-than-one. */
  calc: { key: string; label: string; text: string };
  assumption: { text: string };
  /** Replaces the deck's common footer on this slide. */
  footer: { text: string };
  /** Another candidate and where it stands; `metric` is its catalogue NAME. */
  aside: { metric: string; text: string };
  blind: { text: string };
  // Slide 3 — visibility
  /** `stage` is a pillar id; `status` is the status LABEL. */
  metric: { stage: string; metric: string; status: string };
  missing: { metric: string; cause: string; role: string; repair: string };
  // Slide 4 — unit economics (`value` is "" when it can't be computed)
  cac: { value: string; variant: string };
  payback: { value: string };
  ltv: { value: string };
  ltvCac: { value: string };
  cap: { text: string };
  // Slide 5 — the mirror
  /** `metric` is an id; `found` a tracking level, `verdict` a mirror verdict, both "" without a verdict. */
  bridge: { questionId: string; metric: string; points: string; found: string; verdict: string };
  tourFooter: { text: string };
  // Slide 6 — the ask
  bullet: { text: string };
  cost: { text: string };
  know: { metric: string; current: string; target: string; checkpoint: string };
  measure: { metric: string; repair: string; role: string };
  // Appendix
  annex: {
    number: string;
    formula: string;
    window: string;
    period: string;
    source: string;
    status: string;
    confidence: string;
    /** The user's own definitionNote — their private `note` never travels (§4.1). */
    definition: string;
  };
}

export type RowKind = keyof DeckRows;

/** Every field each row must carry — the table the contract test checks the real model against. */
export const ROW_FIELDS: { readonly [K in RowKind]: readonly (keyof DeckRows[K])[] } = {
  upstream: ["n", "source", "month"],
  column: ["metric", "n", "source", "period"],
  calc: ["key", "label", "text"],
  assumption: ["text"],
  footer: ["text"],
  aside: ["metric", "text"],
  blind: ["text"],
  metric: ["stage", "metric", "status"],
  missing: ["metric", "cause", "role", "repair"],
  cac: ["value", "variant"],
  payback: ["value"],
  ltv: ["value"],
  ltvCac: ["value"],
  cap: ["text"],
  bridge: ["questionId", "metric", "points", "found", "verdict"],
  tourFooter: ["text"],
  bullet: ["text"],
  cost: ["text"],
  know: ["metric", "current", "target", "checkpoint"],
  measure: ["metric", "repair", "role"],
  annex: ["number", "formula", "window", "period", "source", "status", "confidence", "definition"],
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
