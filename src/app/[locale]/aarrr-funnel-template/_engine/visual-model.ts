import type { Pillar } from "@/lib/scoring/pillars";
import type { CandidateId, ImpactLine, Interval, SourceRef, YearMonth } from "@/lib/engine/types";
import type { EngineStrings } from "@/lib/engine/strings";

/**
 * The view model behind the engine's visuals (engine spec §8) — pure, so the
 * rules that keep a picture honest are tested rather than eyeballed:
 *
 * - a peloton grid and its numeral are drawn from the SAME interval, so the
 *   title-says-38-grid-shows-18 defect of the spec's own mock cannot happen
 *   inside a column (§1, `board-1280.png`);
 * - an unknown column is never 0 dots: it is a separate state;
 * - the "what if" slider walks a fixed ladder of targets (1 point above
 *   10 %, 0.1 below — §6.7), so a target is always a number the screen can
 *   print exactly.
 *
 * No copy lives here: words come in as `EngineStrings` slices.
 */

/** `{name}` → value. A placeholder with no value is left visible, so a missing one is seen, not silently blanked. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
}

/**
 * Pillar names are the same in both languages, by product decision (CLAUDE.md,
 * step 3): the AARRR acronym is kept whole. Capitalised from the id rather
 * than read from the dictionary, which the island must never import.
 */
export function stageLabel(pillar: Pillar): string {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
}

/** "juillet 2026" / "July 2026". UTC, so the month never slides at midnight in another zone. */
export function monthLabel(month: YearMonth, locale: "en" | "fr"): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/** A source in words: a tool's display name, a role (never a person), or "other". */
export function sourceLabel(
  source: SourceRef,
  words: Pick<EngineStrings, "tools" | "role" | "source">,
): string {
  if (source.kind === "tool") return words.tools[source.tool];
  if (source.kind === "person") return words.role[source.role];
  return words.source.other;
}

// --- The peloton -------------------------------------------------------------

/** One dot of a 10 × 10 grid (§8.1). `unknown` is a whole-grid state, never a dot state. */
export type DotState = "filled" | "referred" | "range" | "referredRange" | "empty";

export interface GridModel {
  kind: "known" | "unknown";
  /** 100 dots, row by row from the top left. Empty for `unknown`. */
  dots: DotState[];
}

const clampCount = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/**
 * A column of the peloton as dots: `lo` solid, `lo+1 … hi` hatched (the
 * estimated range), the rest outlined. `null` is the unknown grid — the one
 * shape the spec gives "not measured", so it can never read as zero.
 */
export function columnGrid(perHundred: Interval | null): GridModel {
  if (!perHundred) return { kind: "unknown", dots: [] };
  const lo = clampCount(perHundred.lo);
  const hi = Math.max(lo, clampCount(perHundred.hi));
  return {
    kind: "known",
    dots: Array.from({ length: 100 }, (_, i) => (i < lo ? "filled" : i < hi ? "range" : "empty")),
  };
}

/**
 * The sign-ups grid: all 100 are there by definition; the referred ones are
 * red, first, so the red run reads as a count. An unknown referred share
 * leaves the grid plain ink — the sign-ups themselves are never unknown.
 */
export function signupsGrid(referredPerHundred: Interval | null): GridModel {
  const lo = referredPerHundred ? clampCount(referredPerHundred.lo) : 0;
  const hi = referredPerHundred ? Math.max(lo, clampCount(referredPerHundred.hi)) : 0;
  return {
    kind: "known",
    dots: Array.from({ length: 100 }, (_, i) => (i < lo ? "referred" : i < hi ? "referredRange" : "filled")),
  };
}

/** What the numeral above a grid says, from the same interval the grid was drawn from. */
export type Numeral = { kind: "value"; lo: number; hi: number } | { kind: "less-than-one" } | { kind: "unknown" };

export function columnNumeral(perHundred: Interval | null): Numeral {
  if (!perHundred) return { kind: "unknown" };
  const lo = clampCount(perHundred.lo);
  const hi = Math.max(lo, clampCount(perHundred.hi));
  // Rounded to 0 but measured: "fewer than 1", never a 0 (a 0 is a measurement).
  if (hi === 0) return { kind: "less-than-one" };
  return { kind: "value", lo, hi };
}

/** "6 à 9" / "6–9", or a single number when both bounds agree. */
export function numeralText(n: Numeral, words: Pick<EngineStrings["units"], "range">, lessThanOne: string): string {
  if (n.kind === "unknown") return "?";
  if (n.kind === "less-than-one") return lessThanOne;
  return n.lo === n.hi ? String(n.lo) : words.range.replace("{lo}", String(n.lo)).replace("{hi}", String(n.hi));
}

// --- "What if" ---------------------------------------------------------------

/** The ladder of targets a slider can land on (§6.7): 0.1 point below 10 %, 1 point from 10 % up. */
export function targetLadder(min: number, max: number): number[] {
  const out: number[] = [];
  for (let t = 1; t < 100; t++) out.push(t / 10); // 0.1 … 9.9
  for (let t = 10; t <= 100; t++) out.push(t);
  return out.filter((t) => t >= min - 1e-9 && t <= max + 1e-9);
}

/** The ladder index nearest a value — the slider's position for a target that is not on the ladder. */
export function nearestIndex(ladder: readonly number[], value: number): number {
  let best = 0;
  for (let i = 1; i < ladder.length; i++) {
    if (Math.abs(ladder[i]! - value) < Math.abs(ladder[best]! - value)) best = i;
  }
  return best;
}

/** Which template a line of the "what if" chain is printed with. Churn has its own sentences. */
export function whatIfTemplate(
  line: ImpactLine,
  metric: CandidateId,
  words: EngineStrings["whatIf"],
): { label: string | null; template: string } {
  const churn = metric === "ret.logo-churn";
  switch (line.key) {
    case "today":
      return { label: words.today, template: churn ? words.todayChurn : words.todayFlow };
    case "if":
      return { label: words.if, template: words.ifFlow };
    case "then":
      return { label: words.then, template: churn ? words.thenChurn : words.thenFlow };
    case "times":
      return { label: words.times, template: churn ? words.timesChurn : words.timesFlow };
    case "annual":
      return { label: null, template: words.annual };
    case "less-than-one":
      return { label: null, template: words.lessThanOne };
  }
}
