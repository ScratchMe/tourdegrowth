import type { MetricShape } from "@/lib/engine/catalog-shape";
import { hasReading } from "@/lib/engine/merge";
import { proposedFromBefore } from "@/lib/engine/series";
import { propagateFrom, sharedCountAt } from "@/lib/engine/shared-counts";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineState, MetricEntry, MetricId, RoleId, SharedCount, Snapshot, ToolId } from "@/lib/engine/types";
import { parseTypedNumber } from "@/lib/forms/number";
import { draftFromEntry, entryFromDraft, withProposals, type DraftProblem, type SheetDraft, type SourceChoice } from "./sheet-draft";
import { ALL_TOOLS, currencySymbol } from "./sources";

/**
 * csv.ts — « Saisie en tableau » (engine spec §19.6, C32 Q11, A14 T5): the
 * engine's own template, downloaded pre-filled, and what a spreadsheet puts
 * back on the clipboard, read and SHOWN before anything is written.
 *
 * The engine's template, never a tool's export: Stripe's, GA4's or HubSpot's
 * formats change without warning and can only be checked with an account
 * (§19.6, « Rejeté »). Ours is stable, and tested here to the character.
 *
 * In the island, not in `lib/engine` (`engine-boundary.test.ts`): reading
 * what a person pasted is the screen's business, and the engine's pure
 * modules never parse a text from outside.
 *
 * Every pasted number goes through the sheet's own rules (`entryFromDraft`):
 * a row can never save what the sheet would refuse, and a number that needs a
 * choice the table cannot carry — a variant, a duration's statistic, a text —
 * is sent back to its sheet with that reason.
 */

export type TableColumn = "id" | "name" | "stage" | "numerator" | "denominator" | "value" | "unit" | "source";
export const TABLE_COLUMNS: readonly TableColumn[] = ["id", "name", "stage", "numerator", "denominator", "value", "unit", "source"];

type Locale = "en" | "fr";

/** French writes the decimal with a comma, so its spreadsheets separate the columns with « ; ». */
export const separatorOf = (locale: Locale): ";" | "," => (locale === "fr" ? ";" : ",");

// --- The template ------------------------------------------------------------------

/**
 * One line per number of the ticked motions, in catalogue order, with the
 * values already entered: a found number's counts, or its value when it was
 * typed as one. An estimate, a cause or a text is the sheet's, and stays
 * blank. Numbers are written without grouping and with the language's
 * decimal, so a spreadsheet in that language reads them as numbers.
 */
export function tableTemplate(state: EngineState, shapes: readonly MetricShape[], metrics: readonly ResolvedMetric[], strings: EngineStrings, locale: Locale): string {
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const sep = separatorOf(locale);
  const rows: string[][] = [TABLE_COLUMNS.map((c) => strings.table.columns[c])];
  for (const shape of shapes) {
    const entry = snapshot.metrics[shape.id];
    const v = entry?.status === "measured" ? entry.value : undefined;
    const cells: Record<TableColumn, string> = {
      id: shape.id,
      name: metrics.find((m) => m.id === shape.id)?.name ?? shape.id,
      stage: strings.stages[shape.stage],
      numerator: v?.kind === "ratio" ? plain(v.numerator, locale) : "",
      denominator: v?.kind === "ratio" ? plain(v.denominator, locale) : "",
      value: v?.kind === "rate" ? plain(v.percent, locale) : v?.kind === "amount" ? plain(v.amount, locale) : v?.kind === "duration" ? plain(v.value, locale) : "",
      unit: unitCell(shape, entry, state, strings, locale),
      source: entry?.status === "measured" ? sourceCell(entry, strings) : "",
    };
    rows.push(TABLE_COLUMNS.map((c) => cells[c]));
  }
  return `${rows.map((row) => row.map((cell) => quote(cell, sep)).join(sep)).join("\r\n")}\r\n`;
}

/**
 * 1250.5 → « 1250,5 » in French: the language's decimal, no grouping a
 * spreadsheet could read as text. Only a finite number is written: a file
 * opened or merged can carry anything in a count, and a cell must never
 * become a formula (the security review of A14 T5).
 */
function plain(n: unknown, locale: Locale): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "";
  const s = String(n);
  return locale === "fr" ? s.replace(".", ",") : s;
}

function unitCell(shape: MetricShape, entry: MetricEntry | undefined, state: EngineState, strings: EngineStrings, locale: Locale): string {
  if (shape.unit === "percent") return "%";
  if (shape.unit === "money") return currencySymbol(state.setup.currency, locale);
  if (shape.unit === "duration") {
    const v = entry?.value;
    return v?.kind === "duration" && v.unit === "hours" ? strings.workbench.hours : strings.workbench.days;
  }
  return "";
}

function sourceCell(entry: MetricEntry, strings: EngineStrings): string {
  const s = entry.source;
  if (!s) return "";
  if (s.kind === "tool") return strings.tools[s.tool];
  if (s.kind === "person") return strings.role[s.role];
  return strings.source.other;
}

/**
 * RFC 4180: a cell holding the separator, a quote or a line break is quoted,
 * its quotes doubled. And no cell a spreadsheet would run: one that starts
 * like a formula (= + - @, a tab, a return) and is not a plain number gets a
 * leading apostrophe — the spreadsheets' own « this is text » — which
 * `parseTypedNumber` drops when the table comes back.
 */
function quote(cell: string, sep: string): string {
  const safe = /^[=+\-@\t\r]/.test(cell) && !/^-?\d+([.,]\d+)?$/.test(cell) ? `'${cell}` : cell;
  return safe.includes(sep) || /["\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

// --- Reading what was pasted --------------------------------------------------------

/**
 * The rows of a pasted table. A spreadsheet's clipboard is separated by
 * tabs; a CSV by « ; » or « , » — the first line says which. Quoted cells
 * may hold the separator, a doubled quote, a line break. A byte-order mark
 * and blank lines are dropped.
 */
export function readTable(text: string): string[][] {
  const body = text.replace(/^﻿/, "");
  const firstLine = body.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";
  const sep = body.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i]!;
    if (quoted) {
      if (c === '"' && body[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === sep) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && body[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) rows.push([...row, cell]);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// --- The preview --------------------------------------------------------------------

/**
 * Why a row is refused (§19.6). The sheet's own refusals, plus the table's:
 * a number it does not know, one the setup does not show, one already on an
 * earlier row, and a count that contradicts the same count on an earlier
 * row — written, it would silently rewrite that row's number.
 */
export type TableRefusal =
  | "unknown"
  | "hidden"
  | "duplicate"
  | "unreadable"
  | "incomplete"
  | "denominator-zero"
  | "num-gt-den"
  | "negative"
  | "percent-range"
  | "text"
  | "sheet"
  | "shared";

export type TableRow =
  /** `before` is what the month held: absent, or no reading yet, for a new one. */
  | { line: number; kind: "new" | "changed" | "same"; id: MetricId; entry: MetricEntry; before: MetricEntry | undefined }
  | { line: number; kind: "refused"; id: MetricId | null; label: string; reason: TableRefusal; other?: MetricId };

export interface TablePreview {
  /** Every row that says something, in the table's order. */
  rows: TableRow[];
  /** Rows with no number in them — the template's untouched lines. Counted, never listed. */
  empty: number;
  /** Numbers the table moves through a count they share (`shared-counts.ts`) without a row of their own: listed too. */
  following: { id: MetricId; before: MetricEntry; after: MetricEntry }[];
  /** New and changed rows: what « Appliquer {n} chiffres » writes. */
  count: number;
  /** The month with every new and changed row written, and the counts they share carried: what is committed. */
  snapshot: Snapshot;
}

const PROBLEM_REFUSAL: Partial<Record<DraftProblem, TableRefusal>> = {
  numerator: "incomplete",
  denominator: "incomplete",
  "denominator-zero": "denominator-zero",
  "num-gt-den": "num-gt-den",
  "count-negative": "negative",
  "amount-negative": "negative",
  "duration-negative": "negative",
  percent: "percent-range",
  "percent-range": "percent-range",
};

/**
 * The pasted table against the month on screen: each row new, changed (with
 * what it replaces), unchanged, or refused with its reason — and the month
 * as it would be written. Nothing is written here; « Annuler » leaves the
 * month as it was.
 */
export function tablePreview(
  text: string,
  state: EngineState,
  shapes: readonly MetricShape[],
  metrics: readonly ResolvedMetric[],
  strings: EngineStrings,
  locale: Locale,
  nowIso: string,
): TablePreview {
  const original = state.snapshots[state.snapshots.length - 1]!;
  const table = readTable(text);
  const columns = columnsOf(table[0] ?? [], strings);
  const body = columns.header ? table.slice(1) : table;
  const known = new Set(metrics.map((m) => m.id));
  const shown = new Map(shapes.map((s) => [s.id, s]));
  const byName = new Map(metrics.map((m) => [normalize(m.name), m.id]));

  const rows: TableRow[] = [];
  const seen = new Set<MetricId>();
  const claimed = new Map<SharedCount, { value: number; id: MetricId }>();
  let empty = 0;

  body.forEach((cells, i) => {
    const line = i + 1 + (columns.header ? 1 : 0);
    const cell = (c: TableColumn) => (columns.at[c] >= 0 ? (cells[columns.at[c]] ?? "").trim() : "");
    const raw = { numerator: cell("numerator"), denominator: cell("denominator"), value: cell("value") };
    if (!raw.numerator && !raw.denominator && !raw.value) {
      empty += 1;
      return;
    }
    const idCell = cell("id");
    const id = (known.has(idCell as MetricId) ? idCell : byName.get(normalize(cell("name")))) as MetricId | undefined;
    const refuse = (reason: TableRefusal, other?: MetricId) =>
      rows.push({ line, kind: "refused", id: id ?? null, label: (id && metrics.find((m) => m.id === id)?.name) || cell("name") || idCell, reason, ...(other ? { other } : {}) });
    if (!id) return refuse("unknown");
    const shape = shown.get(id);
    if (!shape) return refuse("hidden");
    if (seen.has(id)) return refuse("duplicate");
    seen.add(id);
    if (shape.unit === "text") return refuse("text");
    if (shape.unit === "choice") return refuse("sheet");

    const [numerator, denominator, value] = [num(raw.numerator, locale), num(raw.denominator, locale), num(raw.value, locale)];
    if (numerator === undefined || denominator === undefined || value === undefined) return refuse("unreadable");
    const n = { numerator, denominator, value };

    const existing = original.metrics[id];
    const metric = metrics.find((m) => m.id === id)!;
    const draft = rowDraft(shape, existing, state, sourceOf(cell("source"), strings), strings, n, cell("unit"));
    if (typeof draft === "string") return refuse(draft);
    const { entry, problems } = entryFromDraft(draft, shape, nowIso, {
      hasVariants: Boolean(metric.variants?.length) && shape.id !== "act.ttv",
      hasChoices: Boolean(metric.choices?.length),
      hasNaReasons: Boolean(metric.naReasons?.length),
    });
    if (!entry) return refuse(PROBLEM_REFUSAL[problems[0]!] ?? "sheet");

    // A count several numbers share must say the same on every row that carries it (shared-counts.ts).
    if (entry.value?.kind === "ratio") {
      for (const side of ["numerator", "denominator"] as const) {
        const count = sharedCountAt(id, side);
        const before = count ? claimed.get(count) : undefined;
        if (count && before && before.value !== entry.value[side]) return refuse("shared", before.id);
      }
      for (const side of ["numerator", "denominator"] as const) {
        const count = sharedCountAt(id, side);
        if (count && !claimed.has(count)) claimed.set(count, { value: entry.value[side], id });
      }
    }
    const kind = !hasReading(existing) ? "new" : sameStored(existing, entry) ? "same" : "changed";
    rows.push({ line, kind, id, entry: kind === "same" ? existing! : entry, before: existing });
  });

  let snapshot = original;
  const written = rows.filter((r): r is Extract<TableRow, { id: MetricId; entry: MetricEntry }> => r.kind === "new" || r.kind === "changed");
  for (const row of written) snapshot = propagateFrom({ ...snapshot, metrics: { ...snapshot.metrics, [row.id]: row.entry } }, row.id);
  const rowIds = new Set(written.map((r) => r.id));
  const following = (Object.keys(snapshot.metrics) as MetricId[])
    .filter((id) => !rowIds.has(id) && original.metrics[id] !== snapshot.metrics[id])
    .map((id) => ({ id, before: original.metrics[id]!, after: snapshot.metrics[id]! }));

  return { rows, empty, following, count: written.length, snapshot };
}

/** A cell as a number: undefined when something was typed that is not one, null when it is empty. */
function num(raw: string, locale: Locale): number | null | undefined {
  if (raw === "") return null;
  return parseTypedNumber(raw, locale) ?? undefined;
}

/**
 * The sheet's form for a pasted row: what the month already says about the
 * number (its variant, its label, its notes), or the month before's
 * definition for a new one (§19.2.2), with the row's numbers and source.
 */
function rowDraft(
  shape: MetricShape,
  existing: MetricEntry | undefined,
  state: EngineState,
  source: { choice: SourceChoice; role?: RoleId },
  strings: EngineStrings,
  n: { numerator: number | null; denominator: number | null; value: number | null },
  unit: string,
): SheetDraft | TableRefusal {
  const fresh = withProposals(draftFromEntry(undefined, shape), proposedFromBefore(state, shape.id));
  const base: SheetDraft =
    existing?.status === "measured"
      ? draftFromEntry(existing, shape)
      : {
          ...fresh,
          variant: existing?.variant ?? fresh.variant,
          label: existing?.label ?? fresh.label,
          definitionNote: existing?.definitionNote ?? fresh.definitionNote,
          note: existing?.note ?? fresh.note,
        };
  // The denominator's own source (§19.5.3) holds only while the row keeps the same source.
  const splitSource = base.splitSource && base.source === source.choice;
  const common = { ...base, mode: "have" as const, source: source.choice, sourceRole: source.role ?? base.sourceRole, splitSource };

  if (n.numerator !== null || n.denominator !== null) {
    if (!shape.valueKinds.includes("ratio")) return "sheet";
    return { ...common, kind: "ratio", numerator: n.numerator, denominator: n.denominator };
  }
  const value = n.value!;
  if (shape.unit === "percent") return { ...common, kind: "rate", percent: value };
  if (shape.unit === "money") return shape.valueKinds.includes("amount") ? { ...common, kind: "amount", amount: value } : "incomplete";
  if (shape.unit === "duration") {
    // Hours or days, and the median or the mean: the table carries the first, the sheet the second.
    const before = existing?.status === "measured" && existing.value?.kind === "duration" ? existing.value : null;
    if (!before) return "sheet";
    const typed = normalize(unit);
    const durationUnit = typed === normalize(strings.workbench.hours) ? "hours" : typed === normalize(strings.workbench.days) ? "days" : before.unit;
    return { ...common, kind: "duration", durationValue: value, durationUnit, statistic: before.statistic };
  }
  // K: two counts, never one value.
  return "incomplete";
}

/**
 * The source column: a tool by its name or its id, a role by its name (a
 * person gave it), « Autre »; empty, the spreadsheet itself (§19.6). A name
 * the engine does not know is « Autre », never dropped.
 */
function sourceOf(raw: string, strings: EngineStrings): { choice: SourceChoice; role?: RoleId } {
  const typed = normalize(raw);
  if (typed === "") return { choice: "tool:spreadsheet" };
  const tool = ALL_TOOLS.find((t) => typed === t || typed === normalize(strings.tools[t]) || typed === normalize(strings.tools[t].replace(/\s*\(.*\)$/, "")));
  if (tool) return { choice: `tool:${tool as ToolId}` };
  const role = (Object.keys(strings.role) as RoleId[]).find((r) => typed === r || typed === normalize(strings.role[r]));
  if (role) return { choice: "person", role };
  if (typed === normalize(strings.source.someoneTold)) return { choice: "person" };
  return { choice: "other" };
}

/** Where each column is: by the header's words when the first row is the template's header, else in the template's order. */
function columnsOf(first: readonly string[], strings: EngineStrings): { header: boolean; at: Record<TableColumn, number> } {
  const words = first.map(normalize);
  const at = Object.fromEntries(TABLE_COLUMNS.map((c) => [c, words.indexOf(normalize(strings.table.columns[c]))])) as Record<TableColumn, number>;
  const named = Object.values(at).filter((i) => i >= 0).length;
  const header = words[0] === "id" || named >= 3;
  // No header, or the template's header in the other language (the page reads one language's words only):
  // the template's order, which is the same in both.
  if (named < 3) return { header, at: Object.fromEntries(TABLE_COLUMNS.map((c, i) => [c, i])) as Record<TableColumn, number> };
  return { header, at };
}

/** Case, accents' spacing and no-break spaces do not make two names different. */
function normalize(s: string): string {
  return s.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/** The same number as stored: its value and where it came from. A row that says exactly that writes nothing. */
function sameStored(a: MetricEntry, b: MetricEntry): boolean {
  return a.status === b.status && stable(a.value) === stable(b.value) && stable(a.source) === stable(b.source);
}

/** Key order is not meaning: a file read back has its keys sorted (`io.ts`), a row's entry has the sheet's order. */
function stable(value: unknown): string {
  return JSON.stringify(value ?? null, (_key, v: unknown) =>
    typeof v === "object" && v !== null && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([x], [y]) => (x < y ? -1 : 1))) : v,
  );
}
