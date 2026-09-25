import type { DeckSlide, DerivedId, MetricId } from "@/lib/engine/types";

/**
 * What a slide's `lines` carry — the half of the deck contract that
 * `types.ts` leaves open (`DeckSlide.lines: Record<string, string>[]`).
 *
 * Engine spec §6.12: `buildDeck` (lib/engine/deck.ts) picks the slides, the
 * key of each title and **every number already formatted**; the slide
 * components only place strings. That rule is why this file exists: a
 * component that formatted a number itself would be a second formatter, and
 * a second formatter is how a title and its body end up saying "+2 à +3 k€"
 * and "+1 400 à +2 600 €" on the same slide (the `s2-export.png` defect).
 *
 * So every record has a `kind`, and every record that shows a number carries
 * it as a FINISHED string — `text` is a whole sentence already filled from
 * its template, `value` a finished figure. Nothing below is parsed, split or
 * recomputed by a component. What a component may still do on its own is map
 * an id to a label (a status, a cause, a role), because that is vocabulary,
 * not arithmetic.
 *
 * Every kind is optional on purpose: a slide renders what it is given, and
 * where a fact is derivable without formatting a number (a status, a count
 * under 100, a label) it falls back to the derived state rather than to
 * nothing. A missing line is never drawn as a zero.
 */
export type DeckLine =
  // --- any slide -------------------------------------------------------------
  /** Replaces the common footer of THIS slide (the peloton's "~3 200 visitors for 100 sign-ups · …", the leak's "all else being equal · …"). */
  | { kind: "footer"; text: string }
  // --- peloton -----------------------------------------------------------------
  /** "~3 200 visiteurs du mois pour 100 inscrits · GA4 · août" — filled `peloton.upstream`. */
  | { kind: "upstream"; text: string }
  /** One of the four columns. `value` is the numeral ("18", "6 à 9", "?"); `source` the line under the grid. */
  | { kind: "column"; metric: "signups" | "act.rate" | "ret.d30" | "rev.paid-conversion"; value: string; source: string }
  /** "venus par recommandation (6)" — filled `peloton.legendReferred`. */
  | { kind: "legendReferred"; text: string }
  // --- leak --------------------------------------------------------------------
  /** One step of the calculation, the SAME `Impact.lines` the title was built from (§6.7). `step` picks the label. */
  | { kind: "calc"; step: "today" | "if" | "then" | "times"; text: string }
  /** "Soit ~6 300 € de MRR de plus au bout d'un an, churn compris." */
  | { kind: "annual"; text: string }
  /** "Moins d'un client de plus par mois." — replaces the money line when the gap is under one customer. */
  | { kind: "lessThanOne"; text: string }
  /** "Hypothèse : les payants sont parmi les activés." — printed under the calculation, never hidden. */
  | { kind: "assumption"; text: string }
  /** "La rétention à J30 n'est pas mesurée : le vrai frein peut s'y cacher." — the subtitle under the title. */
  | { kind: "blind"; text: string }
  /** One of the other candidates, ranked. `text` says where it stands ("dans le repère", "~240 € de MRR préservé"…). */
  | { kind: "aside"; stage: string; text: string; tone: "below" | "neutral" | "unknown" }
  // --- unit economics ----------------------------------------------------------
  /** A figure tile. `value` is empty when uncomputable; `note` then says what is missing ("incalculable — manque : marge brute"). */
  | { kind: "figure"; id: "cac" | "payback" | "ltv" | "ltv-cac"; value: string; note: string }
  // --- ask ---------------------------------------------------------------------
  /** "How we'll know": metric, current value, target, first checkpoint — one sentence per line. */
  | { kind: "know"; text: string }
  // --- annex -------------------------------------------------------------------
  /** One row of the definitions table, every cell finished. */
  | {
      kind: "row";
      metric: MetricId | DerivedId;
      name: string;
      formula: string;
      /** The user's own definitionNote, when written — shown under the formula (§14.5: "it appears in the deck's appendix"). */
      definition?: string;
      window: string;
      period: string;
      source: string;
      status: string;
      confidence: string;
    };

export type DeckLineKind = DeckLine["kind"];

const KINDS: ReadonlySet<string> = new Set<DeckLineKind>([
  "footer",
  "upstream",
  "column",
  "legendReferred",
  "calc",
  "annual",
  "lessThanOne",
  "assumption",
  "blind",
  "aside",
  "figure",
  "know",
  "row",
]);

/**
 * The records of one kind, in the order `buildDeck` wrote them. A record
 * whose `kind` is unknown is ignored rather than guessed at: the model is
 * produced by another module, and a renamed kind must show as a missing line
 * in review, not as a line drawn from the wrong fields.
 */
export function linesOf<K extends DeckLineKind>(slide: DeckSlide, kind: K): Extract<DeckLine, { kind: K }>[] {
  return slide.lines.filter(
    (line): line is Extract<DeckLine, { kind: K }> & Record<string, string> =>
      KINDS.has(line.kind ?? "") && line.kind === kind,
  );
}

/** The first record of a kind, or undefined. */
export function lineOf<K extends DeckLineKind>(slide: DeckSlide, kind: K): Extract<DeckLine, { kind: K }> | undefined {
  return linesOf(slide, kind)[0];
}
