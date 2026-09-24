import { TEXT_LIMITS, WIDE_RANGE_FACTOR, type MetricShape } from "@/lib/engine/catalog-shape";
import type {
  EstimateBasis,
  MetricEntry,
  MetricValue,
  MissingCause,
  Reading,
  RepairScale,
  RoleId,
  SourceRef,
  ToolId,
} from "@/lib/engine/types";

/**
 * The metric sheet's form state and the ONE function that turns it into a
 * stored `MetricEntry` — pure, so the rules the spec puts on a save (§7 E3,
 * §6.9, §4.1) are unit-tested rather than trusted to a component.
 *
 * The four answers to "where are you with this number?" are modes of the
 * form, not statuses: "I have it" writes `measured`, "I can estimate it"
 * `estimated`, "I'll ask for it" `requested`, and "I can't find it" opens the
 * triage whose answer decides between `missing`, `conflicting` and
 * `not-applicable` (E3bis). Nothing is chosen by default — a number nobody
 * has looked at is "to fill in", never "found".
 */
export type SheetMode = "have" | "estimate" | "ask" | "cantFind";
export type TriageAnswer = MissingCause | "conflicting" | "not-applicable";

/** "" = not chosen yet; a tool, "a person gave it to me" (then a role), or "other". */
export type SourceChoice = "" | `tool:${ToolId}` | "person" | "other";

export interface ReadingDraft {
  kind: "ratio" | "rate" | "amount";
  numerator: number | null;
  denominator: number | null;
  percent: number | null;
  amount: number | null;
  source: SourceChoice;
  sourceRole: RoleId;
}

export interface SheetDraft {
  mode: SheetMode | null;
  /** The value kind under "I have it" — the shape's first kind, or the shortcut the person switched to. */
  kind: MetricValue["kind"];
  numerator: number | null;
  denominator: number | null;
  percent: number | null;
  amount: number | null;
  durationValue: number | null;
  durationUnit: "hours" | "days";
  statistic: "median" | "mean";
  text: string;
  choice: string;
  source: SourceChoice;
  sourceRole: RoleId;
  variant: string;
  label: string;
  evidence: "" | "data" | "interviews" | "hunch";
  definitionNote: string;
  low: number | null;
  high: number | null;
  basis: EstimateBasis | "";
  requestRole: RoleId;
  triage: TriageAnswer | null;
  repair: RepairScale;
  repairComment: string;
  ownerRole: RoleId | "";
  naReason: string;
  readingA: ReadingDraft;
  readingB: ReadingDraft;
  note: string;
}

/** What blocks a save, by field — the sheet shows each one next to its control and lists them by the button. */
export type DraftProblem =
  | "mode"
  | "numerator"
  | "denominator"
  | "denominator-zero"
  | "num-gt-den"
  | "percent"
  | "percent-range"
  | "amount"
  | "duration"
  | "text"
  | "text-too-long"
  | "choice"
  | "source"
  | "variant"
  | "label-too-long"
  | "evidence"
  | "low"
  | "high"
  | "low-above-high"
  | "basis"
  | "triage"
  | "na-reason"
  | "reading-a"
  | "reading-b"
  | "definition-too-long"
  | "note-too-long"
  | "comment-too-long";

/** The repair cost proposed for each triage answer (E3bis table) — editable, on the closed scale. */
export function proposedRepair(answer: TriageAnswer, shape: MetricShape): RepairScale {
  if (answer === "not-tracked") return shape.defaultRepair;
  if (answer === "not-computed" || answer === "conflicting") return "afternoon";
  return "meeting";
}

function emptyReading(shape: MetricShape): ReadingDraft {
  return {
    kind: shape.valueKinds.includes("ratio") ? "ratio" : "rate",
    numerator: null,
    denominator: null,
    percent: null,
    amount: null,
    source: "",
    sourceRole: shape.defaultRole,
  };
}

function sourceChoiceOf(source: SourceRef | undefined): { source: SourceChoice; role: RoleId | null } {
  if (!source) return { source: "", role: null };
  if (source.kind === "tool") return { source: `tool:${source.tool}`, role: null };
  if (source.kind === "person") return { source: "person", role: source.role };
  return { source: "other", role: null };
}

function readingDraftOf(reading: Reading | undefined, shape: MetricShape): ReadingDraft {
  const base = emptyReading(shape);
  if (!reading) return base;
  const { source, role } = sourceChoiceOf(reading.source);
  const v = reading.value;
  return {
    ...base,
    kind: v.kind === "ratio" || v.kind === "rate" || v.kind === "amount" ? v.kind : base.kind,
    numerator: v.kind === "ratio" ? v.numerator : null,
    denominator: v.kind === "ratio" ? v.denominator : null,
    percent: v.kind === "rate" ? v.percent : null,
    amount: v.kind === "amount" ? v.amount : null,
    source,
    sourceRole: role ?? base.sourceRole,
  };
}

/** Seeds the form from what is stored — or from nothing, with nothing pre-selected. */
export function draftFromEntry(entry: MetricEntry | undefined, shape: MetricShape): SheetDraft {
  const firstKind = shape.valueKinds[0]!;
  const draft: SheetDraft = {
    mode: null,
    kind: firstKind,
    numerator: null,
    denominator: null,
    percent: null,
    amount: null,
    durationValue: null,
    durationUnit: "days",
    statistic: "median",
    text: "",
    choice: "",
    source: "",
    sourceRole: shape.defaultRole,
    variant: "",
    label: "",
    evidence: "",
    definitionNote: entry?.definitionNote ?? "",
    low: null,
    high: null,
    basis: "",
    requestRole: shape.defaultRole,
    triage: null,
    repair: shape.defaultRepair,
    repairComment: "",
    ownerRole: "",
    naReason: "",
    readingA: emptyReading(shape),
    readingB: emptyReading(shape),
    note: entry?.note ?? "",
  };
  if (!entry || entry.status === "todo") return draft;

  switch (entry.status) {
    case "measured": {
      const v = entry.value;
      const { source, role } = sourceChoiceOf(entry.source);
      Object.assign(draft, {
        mode: "have",
        source,
        sourceRole: role ?? draft.sourceRole,
        variant: entry.variant ?? "",
        label: entry.label ?? "",
        evidence: entry.evidence ?? "",
      });
      if (v) {
        draft.kind = v.kind;
        if (v.kind === "ratio") Object.assign(draft, { numerator: v.numerator, denominator: v.denominator });
        if (v.kind === "rate") draft.percent = v.percent;
        if (v.kind === "amount") draft.amount = v.amount;
        if (v.kind === "duration") Object.assign(draft, { durationValue: v.value, durationUnit: v.unit, statistic: v.statistic });
        if (v.kind === "text") draft.text = v.text;
        if (v.kind === "choice") draft.choice = v.choice;
      }
      return draft;
    }
    case "estimated":
      return { ...draft, mode: "estimate", low: entry.estimate?.low ?? null, high: entry.estimate?.high ?? null, basis: entry.estimate?.basis ?? "" };
    case "requested":
      return { ...draft, mode: "ask", requestRole: entry.request?.role ?? draft.requestRole };
    case "missing":
      return {
        ...draft,
        mode: "cantFind",
        triage: entry.missing?.cause ?? null,
        repair: entry.missing?.repair ?? draft.repair,
        repairComment: entry.missing?.repairComment ?? "",
        ownerRole: entry.missing?.ownerRole ?? "",
      };
    case "conflicting":
      return {
        ...draft,
        mode: "cantFind",
        triage: "conflicting",
        readingA: readingDraftOf(entry.conflict?.a, shape),
        readingB: readingDraftOf(entry.conflict?.b, shape),
      };
    case "not-applicable":
      return { ...draft, mode: "cantFind", triage: "not-applicable", naReason: entry.naReason ?? "" };
  }
}

function sourceRefOf(choice: SourceChoice, role: RoleId): SourceRef | null {
  if (choice === "") return null;
  if (choice === "person") return { kind: "person", role };
  if (choice === "other") return { kind: "other" };
  return { kind: "tool", tool: choice.slice("tool:".length) as ToolId };
}

/** A count-based value: both counts, a non-zero denominator, and — for a share — no more of the part than of the whole. */
function ratioProblems(num: number | null, den: number | null, bounded: boolean): DraftProblem[] {
  const problems: DraftProblem[] = [];
  if (num === null) problems.push("numerator");
  if (den === null) problems.push("denominator");
  else if (den === 0) problems.push("denominator-zero");
  if (bounded && num !== null && den !== null && den > 0 && num > den) problems.push("num-gt-den");
  return problems;
}

function readingValue(r: ReadingDraft, shape: MetricShape): MetricValue | null {
  if (r.kind === "ratio") {
    if (ratioProblems(r.numerator, r.denominator, shape.bounded).length) return null;
    return { kind: "ratio", numerator: r.numerator!, denominator: r.denominator! };
  }
  if (r.kind === "rate") return r.percent === null || r.percent < 0 || r.percent > 100 ? null : { kind: "rate", percent: r.percent };
  return r.amount === null || r.amount < 0 ? null : { kind: "amount", amount: r.amount };
}

/** True when a range is so wide it says almost nothing — shown, never blocking (E3). */
export function isWideRange(low: number | null, high: number | null): boolean {
  return low !== null && high !== null && low > 0 && high / low > WIDE_RANGE_FACTOR;
}

/**
 * The form → a `MetricEntry`, or the list of what is missing. A save is only
 * ever refused for something the entry cannot mean (§6.9, D11): no status,
 * a required piece absent, more of the part than of the whole, bounds the
 * wrong way round, a text over its limit. Everything merely odd is saved and
 * shown "to check" elsewhere.
 */
export function entryFromDraft(
  draft: SheetDraft,
  shape: MetricShape,
  nowIso: string,
  options: { hasVariants: boolean; hasChoices: boolean; hasNaReasons: boolean },
): { entry: MetricEntry | null; problems: DraftProblem[] } {
  const problems: DraftProblem[] = [];
  const common: Partial<MetricEntry> = {};
  if (draft.definitionNote.trim()) {
    if (draft.definitionNote.length > TEXT_LIMITS.definitionNote) problems.push("definition-too-long");
    common.definitionNote = draft.definitionNote.trim();
  }
  if (draft.note.trim()) {
    if (draft.note.length > TEXT_LIMITS.note) problems.push("note-too-long");
    common.note = draft.note.trim();
  }

  if (draft.mode === null) return { entry: null, problems: ["mode", ...problems] };

  let entry: MetricEntry | null = null;
  switch (draft.mode) {
    case "have": {
      let value: MetricValue | null = null;
      switch (draft.kind) {
        case "ratio":
          problems.push(...ratioProblems(draft.numerator, draft.denominator, shape.bounded));
          if (draft.numerator !== null && draft.denominator !== null && draft.denominator !== 0)
            value = { kind: "ratio", numerator: draft.numerator, denominator: draft.denominator };
          break;
        case "rate":
          if (draft.percent === null) problems.push("percent");
          else if (draft.percent < 0 || draft.percent > 100) problems.push("percent-range");
          else value = { kind: "rate", percent: draft.percent };
          break;
        case "amount":
          if (draft.amount === null || draft.amount < 0) problems.push("amount");
          else value = { kind: "amount", amount: draft.amount };
          break;
        case "duration":
          if (draft.durationValue === null || draft.durationValue < 0) problems.push("duration");
          else value = { kind: "duration", value: draft.durationValue, unit: draft.durationUnit, statistic: draft.statistic };
          break;
        case "text":
          if (!draft.text.trim()) problems.push("text");
          else if (draft.text.length > TEXT_LIMITS.value) problems.push("text-too-long");
          else value = { kind: "text", text: draft.text.trim() };
          break;
        case "choice":
          if (!draft.choice) problems.push("choice");
          else value = { kind: "choice", choice: draft.choice };
          break;
      }
      // A decision (the event's name, the mechanism) has no tool behind it;
      // a figure always does — "where does it come from?" is half of what
      // makes it re-explicable in ten seconds.
      const needsSource = draft.kind !== "text" && draft.kind !== "choice";
      const source = sourceRefOf(draft.source, draft.sourceRole);
      if (needsSource && !source) problems.push("source");
      if (options.hasVariants && draft.kind !== "duration" && !draft.variant) problems.push("variant");
      if (draft.label.length > TEXT_LIMITS.label) problems.push("label-too-long");
      if (options.hasChoices && draft.kind === "text" && !draft.evidence) problems.push("evidence");
      if (value && problems.length === 0) {
        entry = {
          ...common,
          status: "measured",
          value,
          ...(source ? { source } : {}),
          ...(options.hasVariants && draft.kind !== "duration" && draft.variant ? { variant: draft.variant } : {}),
          ...(draft.label.trim() ? { label: draft.label.trim() } : {}),
          ...(options.hasChoices && draft.kind === "text" && draft.evidence ? { evidence: draft.evidence } : {}),
          updatedAt: nowIso,
        };
      }
      break;
    }
    case "estimate": {
      if (draft.low === null) problems.push("low");
      if (draft.high === null) problems.push("high");
      if (draft.low !== null && draft.high !== null && draft.low > draft.high) problems.push("low-above-high");
      if (!draft.basis) problems.push("basis");
      if (problems.length === 0)
        entry = { ...common, status: "estimated", estimate: { low: draft.low!, high: draft.high!, basis: draft.basis as EstimateBasis }, updatedAt: nowIso };
      break;
    }
    case "ask":
      // Saved by the copy button (it stamps requestedAt); the form alone never writes "requested".
      entry = { ...common, status: "requested", request: { role: draft.requestRole, requestedAt: nowIso }, updatedAt: nowIso };
      break;
    case "cantFind": {
      if (draft.triage === null) {
        problems.push("triage");
        break;
      }
      if (draft.triage === "conflicting") {
        const a = readingValue(draft.readingA, shape);
        const b = readingValue(draft.readingB, shape);
        const sa = sourceRefOf(draft.readingA.source, draft.readingA.sourceRole);
        const sb = sourceRefOf(draft.readingB.source, draft.readingB.sourceRole);
        if (!a || !sa) problems.push("reading-a");
        if (!b || !sb) problems.push("reading-b");
        if (problems.length === 0)
          entry = { ...common, status: "conflicting", conflict: { a: { value: a!, source: sa! }, b: { value: b!, source: sb! } }, updatedAt: nowIso };
        break;
      }
      if (draft.triage === "not-applicable") {
        if (!options.hasNaReasons || !draft.naReason) problems.push("na-reason");
        if (problems.length === 0) entry = { ...common, status: "not-applicable", naReason: draft.naReason, updatedAt: nowIso };
        break;
      }
      if (draft.repairComment.length > TEXT_LIMITS.repairComment) problems.push("comment-too-long");
      if (problems.length === 0)
        entry = {
          ...common,
          status: "missing",
          missing: {
            cause: draft.triage,
            repair: draft.repair,
            ...(draft.repairComment.trim() ? { repairComment: draft.repairComment.trim() } : {}),
            ...(draft.ownerRole ? { ownerRole: draft.ownerRole } : {}),
          },
          updatedAt: nowIso,
        };
      break;
    }
  }
  return { entry: problems.length ? null : entry, problems };
}
