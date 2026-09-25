import { describe, expect, it } from "vitest";
import { TEXT_LIMITS, shapeOf } from "../catalog-shape";
import type { EngineState, MetricEntry } from "../types";
import { defaultDeck, newEngineState, validateEngine, validateEntry } from "../validate";
import { SETUP, fullState } from "./storage-fixtures";

/**
 * The rules that keep an unknown from being read as a zero (engine spec §4.1).
 * Each rule has a "passes when right" case in `fullState()` (validated clean
 * below) and a "fails when wrong" case here — so a rule that silently stopped
 * checking would turn one of these red.
 *
 * Non-vacuity, measured when these tests were written (one test falls each,
 * the other fifteen pass): removing the `n > d` check fails "a bounded
 * ratio…"; removing the `basis` check fails "an estimate without its basis…";
 * removing the `repair` check fails "a missing number carries…"; loosening
 * `tooLong` by five characters fails "every text limit…".
 */

const at = "2026-09-24T10:00:00.000Z";

function entry(partial: Partial<MetricEntry>): MetricEntry {
  return { status: "todo", updatedAt: at, ...partial } as MetricEntry;
}

describe("validateEngine", () => {
  it("accepts a fresh engine and a fully filled one", () => {
    expect(validateEngine(newEngineState(SETUP, at))).toEqual([]);
    expect(validateEngine(fullState())).toEqual([]);
  });

  it("refuses an empty snapshot list, a bad month and an unknown metric id — without throwing", () => {
    const s = fullState();
    s.snapshots[0]!.referenceMonth = "2026-13";
    (s.snapshots[0]!.metrics as Record<string, unknown>)["acq.made-up"] = { status: "todo", updatedAt: at };
    const errors = validateEngine(s);
    expect(errors).toContain("snapshots[0].referenceMonth: not YYYY-MM");
    expect(errors).toContain("snapshots[0].metrics.acq.made-up: unknown metric");
    expect(validateEngine({ ...fullState(), snapshots: [] })).toContain("snapshots: empty");
  });

  it("reads arbitrary input as unknown: null, a string or a missing deck never throw", () => {
    expect(validateEngine(null as unknown as EngineState)).toEqual(["state: not an object"]);
    const { deck: _deck, ...noDeck } = fullState();
    expect(validateEngine(noDeck as unknown as EngineState)).toContain("deck: missing");
  });

  it("every text limit of TEXT_LIMITS is enforced at the limit + 1, and accepted AT the limit", () => {
    const over = (n: number) => "x".repeat(n + 1);
    const cases: [string, (s: EngineState, text: string) => void, number][] = [
      ["setup.companyLabel", (s, t) => void (s.setup.companyLabel = t), TEXT_LIMITS.companyLabel],
      ["deck.ask.what", (s, t) => void (s.deck.ask.what = t), TEXT_LIMITS.askWhat],
      ["deck.ask.bullets[0]", (s, t) => void (s.deck.ask.bullets = [t]), TEXT_LIMITS.askBullet],
      ["snapshots[0].metrics.acq.signup-rate.label", (s, t) => void (s.snapshots[0]!.metrics["acq.signup-rate"]!.label = t), TEXT_LIMITS.label],
      ["snapshots[0].metrics.acq.signup-rate.definitionNote", (s, t) => void (s.snapshots[0]!.metrics["acq.signup-rate"]!.definitionNote = t), TEXT_LIMITS.definitionNote],
      ["snapshots[0].metrics.acq.signup-rate.note", (s, t) => void (s.snapshots[0]!.metrics["acq.signup-rate"]!.note = t), TEXT_LIMITS.note],
      ["snapshots[0].metrics.ret.d30.missing.repairComment", (s, t) => void (s.snapshots[0]!.metrics["ret.d30"]!.missing!.repairComment = t), TEXT_LIMITS.repairComment],
      [
        "snapshots[0].metrics.act.event.value.text",
        (s, t) => void (s.snapshots[0]!.metrics["act.event"] = { status: "measured", value: { kind: "text", text: t }, source: { kind: "other" }, updatedAt: at }),
        TEXT_LIMITS.value,
      ],
    ];
    for (const [path, set, limit] of cases) {
      const atLimit = fullState();
      set(atLimit, "x".repeat(limit));
      expect(validateEngine(atLimit), `${path} at the limit`).toEqual([]);
      const beyond = fullState();
      set(beyond, over(limit));
      expect(validateEngine(beyond), `${path} over the limit`).toContain(`${path}: longer than ${limit} characters`);
    }
  });

  it("caps the ask's lists by count, not only by length", () => {
    const s = fullState();
    s.deck.ask.bullets = ["a", "b", "c", "d"];
    s.deck.ask.measureFirst = ["acq.cac", "act.rate", "ret.d30", "rev.arpa"];
    const errors = validateEngine(s);
    expect(errors).toContain(`deck.ask.bullets: more than ${TEXT_LIMITS.askBullets}`);
    expect(errors).toContain(`deck.ask.measureFirst: more than ${TEXT_LIMITS.askMeasureFirst}`);
  });
});

describe("validateEntry — a status without the fields that make it true is refused", () => {
  it("a bounded ratio can't have more on top than below (the one blocking check, D11)", () => {
    const e = entry({ status: "measured", value: { kind: "ratio", numerator: 120, denominator: 100 }, source: { kind: "tool", tool: "ga4" } });
    expect(validateEntry(e, shapeOf("act.rate"))).toContain("act.rate.value: numerator > denominator");
    // CAC is a ratio of money to customers: spend above count is the normal case.
    expect(validateEntry(e, shapeOf("acq.cac"))).toEqual([]);
  });

  it("a zero denominator is no rate at all, never a rate of zero", () => {
    const e = entry({ status: "measured", value: { kind: "ratio", numerator: 0, denominator: 0 }, source: { kind: "other" } });
    expect(validateEntry(e, shapeOf("act.rate"))).toContain("act.rate.value.denominator: not a number > 0");
  });

  it("an estimate without its basis, or upside down, is refused", () => {
    expect(validateEntry(entry({ status: "estimated", estimate: { low: 10, high: 20 } as never }), shapeOf("act.rate"))).toContain(
      "act.rate.estimate.basis: missing or unknown",
    );
    expect(validateEntry(entry({ status: "estimated", estimate: { low: 30, high: 20, basis: "sample" } }), shapeOf("act.rate"))).toContain(
      "act.rate.estimate: low > high",
    );
    expect(validateEntry(entry({ status: "estimated", estimate: { low: 30, high: 120, basis: "sample" } }), shapeOf("act.rate"))).toContain(
      "act.rate.estimate: above 100",
    );
  });

  it("a missing number carries its cause AND its repair cost", () => {
    const errors = validateEntry(entry({ status: "missing", missing: { cause: "not-tracked" } as never }), shapeOf("ret.d30"));
    expect(errors).toEqual(["ret.d30.missing.repair: missing or unknown"]);
  });

  it("not-applicable takes a reason from the metric's own closed list — never free text, never another metric's", () => {
    expect(validateEntry(entry({ status: "not-applicable", naReason: "no-free-tier" }), shapeOf("rev.paid-conversion"))).toEqual([]);
    expect(validateEntry(entry({ status: "not-applicable", naReason: "no-free-tier" }), shapeOf("ret.logo-churn"))).toEqual([
      "ret.logo-churn.naReason: not in ret.logo-churn's list",
    ]);
    // A metric with no closed list can't be not-applicable at all.
    expect(validateEntry(entry({ status: "not-applicable", naReason: "anything" }), shapeOf("act.rate"))).toHaveLength(1);
  });

  it("a measured value must be of a kind the metric accepts and carry its source", () => {
    const errors = validateEntry(entry({ status: "measured", value: { kind: "amount", amount: 5 } }), shapeOf("act.rate"));
    expect(errors).toEqual(["act.rate.value.kind: not accepted by act.rate", "act.rate.source: missing"]);
  });

  it("is lenient about leftovers: a value left on a missing entry is inert, not an error", () => {
    const e = entry({
      status: "missing",
      missing: { cause: "no-access", repair: "meeting" },
      value: { kind: "rate", percent: 12 },
    });
    expect(validateEntry(e, shapeOf("act.rate"))).toEqual([]);
  });
});

describe("defaultDeck / newEngineState", () => {
  it("every slide is included by default except the mirror (D13), and the site credit is on (decision 2)", () => {
    const deck = defaultDeck();
    expect(deck.include.mirror).toBe(false);
    expect(Object.entries(deck.include).filter(([id, on]) => id !== "mirror" && !on)).toEqual([]);
    expect(deck.showSiteCredit).toBe(true);
    expect(deck.ask).toEqual({ what: "", bullets: [], measureFirst: [] });
  });

  it("starts with exactly one snapshot, nothing looked at, and snapshots[] ready for the series (D14)", () => {
    const s = newEngineState(SETUP, at);
    expect(s.snapshots).toHaveLength(1);
    expect(s.snapshots[0]!.metrics).toEqual({});
    expect(s.tourLink).toBeNull();
  });

  it("falls back to §E1's months: last closed month for the flows, latest cohort that has had its 30 days", () => {
    // 24 Sept 2026: August ended 24 days ago, too young; July is the mature cohort (spec §E1's own example).
    expect(newEngineState(SETUP, "2026-09-24T10:00:00.000Z").snapshots[0]).toMatchObject({ referenceMonth: "2026-08", cohortMonth: "2026-07" });
    // 31 Oct: September ended 31 days ago — mature.
    expect(newEngineState(SETUP, "2026-10-31T10:00:00.000Z").snapshots[0]).toMatchObject({ referenceMonth: "2026-09", cohortMonth: "2026-09" });
    // Across a year boundary.
    expect(newEngineState(SETUP, "2027-01-15T10:00:00.000Z").snapshots[0]).toMatchObject({ referenceMonth: "2026-12", cohortMonth: "2026-11" });
  });

  it("keeps the months the setup screen chose rather than recomputing them", () => {
    const s = newEngineState(SETUP, at, { referenceMonth: "2026-06", cohortMonth: "2026-05" });
    expect(s.snapshots[0]).toMatchObject({ referenceMonth: "2026-06", cohortMonth: "2026-05" });
  });
});
