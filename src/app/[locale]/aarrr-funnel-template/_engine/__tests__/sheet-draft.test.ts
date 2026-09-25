import { describe, expect, it } from "vitest";
import { shapeOf, TEXT_LIMITS } from "@/lib/engine/catalog-shape";
import type { MetricEntry, MetricId } from "@/lib/engine/types";
import { draftFromEntry, entryFromDraft, isWideRange, proposedRepair, type SheetDraft } from "../sheet-draft";

/**
 * The sheet's save rules (spec §7 E3, §6.9, D11), pinned where they live:
 * a save is refused ONLY for what an entry cannot mean — no status, a
 * required piece absent, more of the part than of the whole, bounds the
 * wrong way round, a text over its limit — and every saved entry reopens as
 * the same form (the round trip), or a reopened sheet would lie about what
 * is stored.
 */
const NOW = "2026-09-24T10:00:00.000Z";

function draft(id: MetricId, patch: Partial<SheetDraft>): SheetDraft {
  return { ...draftFromEntry(undefined, shapeOf(id)), ...patch };
}

function save(id: MetricId, patch: Partial<SheetDraft>, options: Partial<Parameters<typeof entryFromDraft>[3]> = {}) {
  return entryFromDraft(draft(id, patch), shapeOf(id), NOW, {
    hasVariants: false,
    hasChoices: false,
    hasNaReasons: false,
    ...options,
  });
}

describe("draftFromEntry — nothing chosen for a number nobody has looked at", () => {
  it("starts with no status, no source and the metric's default role", () => {
    const d = draftFromEntry(undefined, shapeOf("act.rate"));
    expect(d.mode).toBeNull();
    expect(d.source).toBe("");
    expect(d.kind).toBe("ratio");
    expect(d.requestRole).toBe(shapeOf("act.rate").defaultRole);
  });

  it("a stored todo entry opens exactly like no entry, keeping its note", () => {
    const d = draftFromEntry({ status: "todo", note: "ask Léa", updatedAt: NOW }, shapeOf("act.rate"));
    expect(d.mode).toBeNull();
    expect(d.note).toBe("ask Léa");
  });
});

describe("entryFromDraft — what refuses a save", () => {
  it("refuses a sheet with no status", () => {
    expect(save("act.rate", {})).toEqual({ entry: null, problems: ["mode"] });
  });

  it("saves counts with their source as a measured ratio", () => {
    const { entry, problems } = save("act.rate", { mode: "have", numerator: 144, denominator: 800, source: "tool:amplitude" });
    expect(problems).toEqual([]);
    expect(entry).toEqual({
      status: "measured",
      value: { kind: "ratio", numerator: 144, denominator: 800 },
      source: { kind: "tool", tool: "amplitude" },
      updatedAt: NOW,
    });
  });

  it("refuses more of the part than of the whole — for a share, never for an unbounded ratio", () => {
    expect(save("act.rate", { mode: "have", numerator: 900, denominator: 800, source: "tool:amplitude" }).problems).toEqual(["num-gt-den"]);
    // CAC = spend ÷ new customers: the spend is naturally larger.
    const cac = save(
      "acq.cac",
      { mode: "have", numerator: 12000, denominator: 30, source: "tool:google-ads", variant: "media-only" },
      { hasVariants: true },
    );
    expect(cac.problems).toEqual([]);
    expect(cac.entry?.variant).toBe("media-only");
  });

  it("refuses a zero denominator and names each missing count", () => {
    expect(save("act.rate", { mode: "have", numerator: 3, denominator: 0, source: "other" }).problems).toEqual(["denominator-zero"]);
    expect(save("act.rate", { mode: "have", source: "other" }).problems).toEqual(["numerator", "denominator"]);
  });

  it("a figure needs a source; a decision (the event's name) does not", () => {
    expect(save("act.rate", { mode: "have", numerator: 1, denominator: 2 }).problems).toEqual(["source"]);
    const event = save("act.event", { mode: "have", kind: "text", text: "  Premier projet partagé  " });
    expect(event.problems).toEqual([]);
    expect(event.entry?.value).toEqual({ kind: "text", text: "Premier projet partagé" });
    expect(event.entry?.source).toBeUndefined();
  });

  it("a closed variant is required when the catalogue has one", () => {
    expect(save("acq.cac", { mode: "have", numerator: 1, denominator: 1, source: "other" }, { hasVariants: true }).problems).toEqual(["variant"]);
  });

  it("a churn cause says how it is known", () => {
    expect(save("ret.churn-cause", { mode: "have", kind: "text", text: "onboarding" }, { hasChoices: true }).problems).toEqual(["evidence"]);
    const ok = save("ret.churn-cause", { mode: "have", kind: "text", text: "onboarding", evidence: "interviews" }, { hasChoices: true });
    expect(ok.entry?.evidence).toBe("interviews");
  });

  it("the rate shortcut must be a rate", () => {
    expect(save("act.rate", { mode: "have", kind: "rate", percent: 140, source: "other" }).problems).toEqual(["percent-range"]);
    expect(save("act.rate", { mode: "have", kind: "rate", percent: 18, source: "other" }).entry?.value).toEqual({ kind: "rate", percent: 18 });
  });

  it("texts over their limit are refused, never cut", () => {
    const long = "x".repeat(TEXT_LIMITS.value + 1);
    expect(save("act.event", { mode: "have", kind: "text", text: long }).problems).toEqual(["text-too-long"]);
    expect(save("act.rate", { mode: "ask", definitionNote: "y".repeat(TEXT_LIMITS.definitionNote + 1) }).problems).toEqual(["definition-too-long"]);
    expect(save("act.rate", { mode: "ask", note: "z".repeat(TEXT_LIMITS.note + 1) }).problems).toEqual(["note-too-long"]);
  });

  it("an estimate needs both bounds the right way round and a basis", () => {
    expect(save("act.rate", { mode: "estimate", low: 30, high: 20, basis: "sample" }).problems).toEqual(["low-above-high"]);
    expect(save("act.rate", { mode: "estimate", low: 10 }).problems).toEqual(["high", "basis"]);
    expect(save("act.rate", { mode: "estimate", low: 10, high: 25, basis: "team-hunch" }).entry).toEqual({
      status: "estimated",
      estimate: { low: 10, high: 25, basis: "team-hunch" },
      updatedAt: NOW,
    });
  });

  it("'I'll ask for it' records the role and when, with the definition that travels in the request", () => {
    const { entry } = save("act.rate", { mode: "ask", requestRole: "data", definitionNote: " actif = un projet " });
    expect(entry).toEqual({
      status: "requested",
      request: { role: "data", requestedAt: NOW },
      definitionNote: "actif = un projet",
      updatedAt: NOW,
    });
  });

  it("'I can't find it' needs a reason, and each reason writes its own status (E3bis)", () => {
    expect(save("act.rate", { mode: "cantFind" }).problems).toEqual(["triage"]);
    expect(save("act.rate", { mode: "cantFind", triage: "no-access", repair: "meeting", ownerRole: "data" }).entry).toEqual({
      status: "missing",
      missing: { cause: "no-access", repair: "meeting", ownerRole: "data" },
      updatedAt: NOW,
    });
    expect(save("act.rate", { mode: "cantFind", triage: "not-tracked", repairComment: "c".repeat(201) }).problems).toEqual(["comment-too-long"]);
  });

  it("two numbers that disagree are both kept, each with its source — never averaged", () => {
    const shape = shapeOf("ret.logo-churn");
    const base = draftFromEntry(undefined, shape);
    const { entry, problems } = save("ret.logo-churn", {
      mode: "cantFind",
      triage: "conflicting",
      readingA: { ...base.readingA, numerator: 12, denominator: 400, source: "tool:stripe" },
      readingB: { ...base.readingB, kind: "rate", percent: 5, source: "person", sourceRole: "finance" },
    });
    expect(problems).toEqual([]);
    expect(entry?.conflict).toEqual({
      a: { value: { kind: "ratio", numerator: 12, denominator: 400 }, source: { kind: "tool", tool: "stripe" } },
      b: { value: { kind: "rate", percent: 5 }, source: { kind: "person", role: "finance" } },
    });
    // A reading without its source is not a reading.
    expect(
      save("ret.logo-churn", {
        mode: "cantFind",
        triage: "conflicting",
        readingA: { ...base.readingA, numerator: 12, denominator: 400 },
        readingB: { ...base.readingB, numerator: 13, denominator: 400, source: "other" },
      }).problems,
    ).toEqual(["reading-a"]);
  });

  it("'doesn't apply' needs one of the catalogue's closed reasons", () => {
    expect(save("ret.logo-churn", { mode: "cantFind", triage: "not-applicable" }, { hasNaReasons: true }).problems).toEqual(["na-reason"]);
    expect(
      save("ret.logo-churn", { mode: "cantFind", triage: "not-applicable", naReason: "not-subscription" }, { hasNaReasons: true }).entry,
    ).toEqual({ status: "not-applicable", naReason: "not-subscription", updatedAt: NOW });
  });
});

describe("the round trip — a saved entry reopens as the same form", () => {
  const entries: [MetricId, MetricEntry, Partial<Parameters<typeof entryFromDraft>[3]>][] = [
    ["act.rate", { status: "measured", value: { kind: "ratio", numerator: 144, denominator: 800 }, source: { kind: "tool", tool: "amplitude" }, updatedAt: NOW }, {}],
    ["acq.cac", { status: "measured", value: { kind: "amount", amount: 420 }, source: { kind: "person", role: "finance" }, variant: "fully-loaded", updatedAt: NOW }, { hasVariants: true }],
    ["act.ttv", { status: "measured", value: { kind: "duration", value: 3, unit: "days", statistic: "median" }, source: { kind: "other" }, updatedAt: NOW }, {}],
    ["ret.d30", { status: "estimated", estimate: { low: 20, high: 30, basis: "old-number" }, updatedAt: NOW }, {}],
    ["ret.d30", { status: "missing", missing: { cause: "not-tracked", repair: "sprint", repairComment: "no events" }, updatedAt: NOW }, {}],
    ["ref.mechanism", { status: "measured", value: { kind: "choice", choice: "product" }, updatedAt: NOW }, { hasChoices: true }],
  ];
  it.each(entries)("%s reopens and re-saves to the identical entry", (id, entry, options) => {
    const reopened = draftFromEntry(entry, shapeOf(id));
    const again = entryFromDraft(reopened, shapeOf(id), NOW, { hasVariants: false, hasChoices: false, hasNaReasons: false, ...options });
    expect(again.problems).toEqual([]);
    expect(again.entry).toEqual(entry);
  });
});

describe("the helpers the sheet shows beside the form", () => {
  it("proposes the E3bis repair cost for each answer", () => {
    const shape = shapeOf("ret.d30");
    expect(proposedRepair("not-tracked", shape)).toBe(shape.defaultRepair);
    expect(proposedRepair("not-computed", shape)).toBe("afternoon");
    expect(proposedRepair("conflicting", shape)).toBe("afternoon");
    expect(proposedRepair("no-access", shape)).toBe("meeting");
    expect(proposedRepair("no-definition", shape)).toBe("meeting");
  });

  it("calls a range 'wide' only past the factor, and never for an open or zero lower bound", () => {
    expect(isWideRange(10, 30)).toBe(false);
    expect(isWideRange(10, 31)).toBe(true);
    expect(isWideRange(0, 50)).toBe(false);
    expect(isWideRange(null, 50)).toBe(false);
  });
});
