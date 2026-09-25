import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineState, MetricId, SourceRef, YearMonth } from "@/lib/engine/types";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * Small text helpers of the collection screens. None of them writes a word
 * of copy: every word arrives resolved in props, these only put formatted
 * values into the `{name}` slots the copy already has.
 */

/** Fills `{name}` placeholders. An unknown placeholder is left as is, so a missing value shows instead of vanishing. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/**
 * Splits a template's `**…**` accent (engine-copy.ts conventions) into plain
 * and accented runs, so the screen colours the accent the way the slide does
 * without either of them parsing the sentence differently.
 */
export function accentRuns(text: string): { text: string; accent: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith("**") ? { text: part.slice(2, -2), accent: true } : { text: part, accent: false }));
}

/** Stage names are the AARRR pillar names, untranslated in both languages (CLAUDE.md, step 3). */
export function stageName(stage: Pillar): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

function monthDate(m: YearMonth): Date {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y!, mo! - 1, 1));
}

/** "juillet 2026" / "July 2026". UTC on both sides, so a month never slips a day at a time-zone edge. */
export function formatMonth(m: YearMonth, locale: "en" | "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    monthDate(m),
  );
}

/** A calendar date for "last saved" and the Tour's date — the reader's day, not UTC. */
export function formatDate(iso: string, locale: "en" | "fr"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Whole days between two instants, never negative (a clock set ahead reads as "today"). */
export function daysBetween(fromIso: string, now: Date): number {
  const t = Date.parse(fromIso);
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

/**
 * A catalogue label used mid-sentence ("18 in 100 {population}"): its first
 * letter lowered — unless the first word is an acronym (MRR) or a month name,
 * which keep their capital in English. French month names are lower case
 * already, so the same rule is right in both languages.
 */
export function midSentence(label: string, locale: "en" | "fr"): string {
  const first = label.split(/\s/)[0] ?? "";
  if (first.length > 1 && first === first.toUpperCase()) return label;
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, i, 1))),
  );
  if (months.includes(first)) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** Which window, in days, is part of a metric's definition (setup's activation or payment window, or a fixed 30). */
export function windowDaysOf(window: "activation" | "paid" | 30 | undefined, state: EngineState): number | null {
  if (window === "activation") return state.setup.activationWindowDays;
  if (window === "paid") return state.setup.paidWindowDays;
  if (window === 30) return 30;
  return null;
}

/**
 * The catalogue prose with its placeholders filled from the engine's own
 * setup: the flows' month, the followed cohort, the window, the user's
 * activation event (their own words, quoted) and the CAC variant chosen.
 */
export function catalogFill(
  text: string,
  context: {
    state: EngineState;
    locale: "en" | "fr";
    strings: EngineStrings;
    metrics: ResolvedMetric[];
    windowDays: number | null;
    variantLabel?: string;
  },
): string {
  const snap = context.state.snapshots[context.state.snapshots.length - 1]!;
  const event = snap.metrics["act.event"];
  const eventName = event?.value?.kind === "text" ? event.value.text : null;
  const eventMetric = context.metrics.find((m) => m.id === "act.event");
  return fill(text, {
    month: formatMonth(snap.referenceMonth, context.locale),
    cohort: formatMonth(snap.cohortMonth, context.locale),
    ...(context.windowDays !== null ? { n: String(context.windowDays) } : {}),
    event: eventName
      ? context.locale === "fr"
        ? `«\u00A0${eventName}\u00A0»`
        : `"${eventName}"`
      : midSentence(eventMetric?.name ?? "", context.locale),
    ...(context.variantLabel ? { variant: context.variantLabel } : {}),
  });
}

/** A source for display: a tool's name, a role, or "other". */
export function sourceLabel(source: SourceRef | undefined | null, strings: EngineStrings): string | null {
  if (!source) return null;
  if (source.kind === "tool") return strings.tools[source.tool];
  if (source.kind === "person") return strings.role[source.role];
  return strings.source.other;
}

export function metricById(metrics: ResolvedMetric[], id: MetricId): ResolvedMetric {
  const m = metrics.find((x) => x.id === id);
  if (!m) throw new Error(`The page did not resolve engine metric ${id}`);
  return m;
}

/** A metric id as a DOM id: dots are legal in an id but not in a CSS selector, and tests select by id. */
export function domId(id: string): string {
  return id.replace(/\./g, "-");
}

/** "a, b and c" / "a, b et c" — the copy's own separators, never a comma chosen here. */
export function joinList(items: readonly string[], grammar: EngineStrings["grammar"]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(grammar.listSeparator)}${grammar.and}${items[items.length - 1]}`;
}
