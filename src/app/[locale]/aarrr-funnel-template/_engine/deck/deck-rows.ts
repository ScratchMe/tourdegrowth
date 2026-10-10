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
  /** A step of the "what if" chain: `key` is today / if / then / times / annual / less-than-one; an app's two streams add usage-then / usage-times / sum. */
  calc: { key: string; label: string; text: string };
  /** Replaces the deck's common footer on its slide; it carries the assumptions (§9.3) — the leak's, and each what-if slide's. */
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
  /** A consumer app's install value over 12 months (§21.7.3): the ratio's numerator, between the cost and the 36-month value. */
  value12: { id: string; label: string; value: string; note: string; text: string };
  ltv: { id: string; label: string; value: string; note: string; text: string };
  ltvCac: { id: string; label: string; value: string; note: string; text: string };
  /**
   * The money (A20.d T4.c): the months after payback (« –4 mois » with « part ~4 mois avant d'avoir remboursé » when
   * the customer leaves first) and the cash tied up (« ne revient pas toute » with the loss) — `value` "" and `note`
   * what is missing when they can't be computed.
   */
  after: { id: string; label: string; value: string; note: string; text: string };
  cash: { id: string; label: string; value: string; note: string; text: string };
  /** Self-serve's monthly GRR and NRR in one line with their approximation — they were two tiles until A20.d T4.c. */
  retention: { text: string };
  /** The long-payback warning (C49) in the slide's « nous »; `maybe` "true" when the payback straddles the limit. */
  warning: { maybe: string; text: string };
  /** What the cash figure assumes, printed with it. */
  assume: { text: string };
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
  // The what-if slides (2026-09-26) — one per lever moved, one for all of them together
  /**
   * One growth figure (MRR in 12 months, new MRR, NRR, GRR, CAC, LTV,
   * payback): `today`, `projected` and `change` are "" when it can't be
   * computed (the slide prints "?", never 0); `change` is signed, or the
   * "unchanged" word. `tone` — unknown | stable | moved — is the emphasis only.
   */
  kpi: { id: string; label: string; tone: string; today: string; projected: string; change: string; text: string };
  /** One step of the month's funnel, in people: the same columns as `kpi`. */
  funnelStep: { id: string; label: string; tone: string; today: string; projected: string; change: string; text: string };
  /** A lever of the « together » slide: its name, today's value and the target, and what it brings alone ("" when unpriced). */
  lever: { id: string; label: string; from: string; to: string; gain: string; text: string };
  /** The levers together against their sum: the compounding sentence. */
  together: { text: string };
  // Sales-assisted and the hybrid (A7.3.c S4, lib/engine/deck-slg.ts)
  /**
   * One relay of `slg:peloton`: `base` its base of 100 and its three months,
   * `value` the numeral ("" when nobody measures it, never "0"), `label` what
   * it counts, `source` its tool or status, `stamp` the diagnosis's words when
   * it names this relay ("" otherwise).
   */
  relay: { id: string; base: string; value: string; label: string; source: string; stamp: string; text: string };
  /** Pipeline coverage on the relays' legend line (§19.4, A14 T3.2): « Couverture : 2,6× l'objectif du trimestre ». */
  coverage: { text: string };
  /** One motion's block of `total`: `id` the motion, `mrr` and `newMrr` as the sum prints them ("" when unknown), `stage` its diagnosis and slide. */
  totalBlock: { id: string; label: string; mrr: string; newMrr: string; stage: string; text: string };
  /** The link between the two blocks, and what it is not (`note`). */
  link: { text: string; note: string };
  /** A sum of the two motions, « a + b = c ». */
  sum: { id: string; text: string };
  /** One row of the hybrid's unit economics, side by side: `plg` and `slg` the two cells, self-serve first. */
  // Appendix
  // « Ce qui a bougé » (A14 T1, §19.2.6)
  /** One number, the month before then this one, as printed; `change` « +6 points » or `whatIfStable`; `tone` moved | stable; `toward` "true" or "". */
  evolution: { id: string; label: string; tone: string; before: string; now: string; change: string; toward: string; text: string };
  /** A number that doesn't compare, and why — « estimé en août », « définition changée ». */
  apart: { id: string; label: string; text: string };
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
  value12: ["id", "label", "value", "note", "text"],
  ltv: ["id", "label", "value", "note", "text"],
  ltvCac: ["id", "label", "value", "note", "text"],
  after: ["id", "label", "value", "note", "text"],
  cash: ["id", "label", "value", "note", "text"],
  retention: ["text"],
  warning: ["maybe", "text"],
  assume: ["text"],
  cap: ["text"],
  verdictCount: ["id", "value", "label"],
  bridge: ["id", "questionId", "label", "verdict", "tag", "text"],
  tourFooter: ["text"],
  bullet: ["text"],
  cost: ["text"],
  know: ["id", "label", "current", "target", "checkpoint", "text"],
  measure: ["id", "label", "text"],
  kpi: ["id", "label", "tone", "today", "projected", "change", "text"],
  funnelStep: ["id", "label", "tone", "today", "projected", "change", "text"],
  lever: ["id", "label", "from", "to", "gain", "text"],
  together: ["text"],
  relay: ["id", "base", "value", "label", "source", "stamp", "text"],
  coverage: ["text"],
  totalBlock: ["id", "label", "mrr", "newMrr", "stage", "text"],
  link: ["text", "note"],
  sum: ["id", "text"],
  evolution: ["id", "label", "tone", "before", "now", "change", "toward", "text"],
  apart: ["id", "label", "text"],
  annex: ["id", "label", "formula", "window", "period", "source", "status", "confidence", "definition", "text"],
};

/**
 * The fields a row may carry beyond its own, in the hybrid only (A7.3.c S4):
 * the motion of a `visibility` row or a mirror bridge, the group of an
 * appendix row, the engine of a unit-economics tile (A20.d T4.d: the two
 * columns side by side) — machine ids a slide groups by, never printed as
 * they are.
 */
export const OPTIONAL_FIELDS: { readonly [K in RowKind]?: readonly string[] } = {
  metric: ["motion"],
  missing: ["motion"],
  bridge: ["motion"],
  annex: ["group"],
  cac: ["motion"],
  ltv: ["motion"],
  ltvCac: ["motion"],
  payback: ["motion"],
  cash: ["motion"],
  warning: ["motion"],
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
