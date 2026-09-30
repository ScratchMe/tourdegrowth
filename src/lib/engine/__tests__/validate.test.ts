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

describe("validateEngine — the what-if levers and the MRR base (2026-09-26)", () => {
  it("accepts levers under test, an MRR with cents in the base, and the what-if slides in the deck", () => {
    const s = fullState();
    s.whatIf = { "act.rate": 25, "rev.arpa": 129.5, "ret.logo-churn": 1.5 };
    s.snapshots[0]!.base = { cohortSignups: 800, mrrEnd: 48_000.5, mrrStart: 46_800 };
    s.deck.include = { ...s.deck.include, scenario: true, "whatif:act.rate": false };
    expect(validateEngine(s)).toEqual([]);
  });

  it("refuses an unknown lever, a negative target, a bounded rate above 100 and an unknown what-if slide", () => {
    const s = fullState();
    s.whatIf = { "act.rate": 120, "rev.arpa": -1 } as EngineState["whatIf"];
    (s.whatIf as Record<string, number>)["acq.cac"] = 300;
    (s.deck.include as Record<string, boolean>)["whatif:acq.cac"] = true;
    const errors = validateEngine(s);
    expect(errors).toContain("whatIf.act.rate: above 100");
    expect(errors).toContain("whatIf.rev.arpa: not a number >= 0");
    expect(errors).toContain("whatIf.acq.cac: unknown lever");
    expect(errors).toContain("deck.include.whatif:acq.cac: unknown slide");
  });

  it("keeps people whole: sign-ups with a decimal are refused, an MRR with one is not", () => {
    const s = fullState();
    s.snapshots[0]!.base = { cohortSignups: 800.5 };
    expect(validateEngine(s)).toContain("snapshots[0].base.cohortSignups: not a whole number > 0");
  });
});

describe("validateEngine — the v2 setup and the sales-assisted numbers (engine spec §18.3.3, A7.3.c S0)", () => {
  // Non-vacuity, measured on 2026-09-30: keeping « > 100 refused » for every percent fails « a 106 % NRR »
  // (three readings) and nothing else; dropping the company-wide rule fails « the company-wide margin »
  // only; dropping the whole-number rule of the link's lever fails « the link's lever » only.
  const slgEntry = (value: MetricEntry["value"]): MetricEntry => ({ status: "measured", value, source: { kind: "tool", tool: "hubspot" }, updatedAt: at });

  it("the setup: a known type, two booleans with at least one ticked, the two sales-assisted windows", () => {
    const s = fullState();
    expect(validateEngine({ ...s, setup: { ...s.setup, motions: { plg: false, slg: false } } })).toEqual(["setup.motions: none ticked"]);
    expect(validateEngine({ ...s, setup: { ...s.setup, motions: { plg: true } as never } })).toEqual(["setup.motions: not two booleans (plg, slg)"]);
    expect(validateEngine({ ...s, setup: { ...s.setup, type: "marketplace" as never } })).toEqual(["setup.type: unknown type"]);
    expect(validateEngine({ ...s, setup: { ...s.setup, qualificationWindowDays: 45 as never, goLiveWindowDays: 7 as never } })).toEqual([
      "setup.qualificationWindowDays: not 30, 60 or 90",
      "setup.goLiveWindowDays: not 30, 60 or 90",
    ]);
    // Sales-assisted alone, and the hybrid, are both valid setups.
    for (const motions of [{ plg: false, slg: true }, { plg: true, slg: true }]) expect(validateEngine({ ...s, setup: { ...s.setup, motions } })).toEqual([]);
  });

  it("the sales-assisted numbers and the link are accepted whatever is ticked — unticking keeps them (§18.1.2)", () => {
    const s = fullState();
    s.snapshots[0]!.metrics["slg.rev.win-rate"] = slgEntry({ kind: "ratio", numerator: 18, denominator: 75 });
    s.snapshots[0]!.metrics["link.pql-handoff"] = slgEntry({ kind: "ratio", numerator: 31, denominator: 130 });
    s.snapshots[0]!.targets["slg.rev.win-rate"] = 32;
    s.deck.ask.measureFirst = ["slg.act.go-live"];
    expect(s.setup.motions).toEqual({ plg: true, slg: false });
    expect(validateEngine(s)).toEqual([]);
  });

  it("a 106 % NRR is accepted as a rate, an estimate and counts; a 106 % renewal rate is refused (bounded)", () => {
    const nrr = shapeOf("slg.ret.nrr");
    expect(validateEntry(slgEntry({ kind: "rate", percent: 106 }), nrr)).toEqual([]);
    expect(validateEntry(entry({ status: "estimated", estimate: { low: 104, high: 108, basis: "old-number" } }), nrr)).toEqual([]);
    expect(validateEntry(slgEntry({ kind: "ratio", numerator: 212_000, denominator: 200_000 }), nrr)).toEqual([]);
    const renewal = shapeOf("slg.ret.renewal");
    expect(validateEntry(slgEntry({ kind: "rate", percent: 106 }), renewal)).toEqual(["slg.ret.renewal.value.percent: not within 0-100"]);
    expect(validateEntry(entry({ status: "estimated", estimate: { low: 90, high: 106, basis: "old-number" } }), renewal)).toEqual(["slg.ret.renewal.estimate: above 100"]);
    expect(validateEntry(slgEntry({ kind: "ratio", numerator: 26, denominator: 25 }), renewal)).toEqual(["slg.ret.renewal.value: numerator > denominator"]);
  });

  it("the company-wide margin stands in for a gross margin, of either motion, and for nothing else (C25 Q4)", () => {
    const companyWide = entry({ status: "estimated", estimate: { low: 75, high: 75, basis: "company-wide" } });
    expect(validateEntry(companyWide, shapeOf("slg.rev.gross-margin"))).toEqual([]);
    expect(validateEntry(companyWide, shapeOf("rev.gross-margin"))).toEqual([]);
    expect(validateEntry(companyWide, shapeOf("slg.rev.win-rate"))).toEqual(["slg.rev.win-rate.estimate.basis: company-wide is for a gross margin only"]);
  });

  it("the link's lever is a whole number of opportunities per quarter, and may pass 100 (C25 Q7)", () => {
    const s = fullState();
    s.whatIf = { "link.pql-handoff": 140, "slg.rev.win-rate": 32, "slg.rev.acv": 26_000 };
    expect(validateEngine(s)).toEqual([]);
    s.whatIf = { "link.pql-handoff": 40.5 };
    expect(validateEngine(s)).toEqual(["whatIf.link.pql-handoff: not a whole number"]);
  });

  it("the deck accepts the hybrid's « total », the sales-assisted slides and their what-ifs", () => {
    const s = fullState();
    s.deck.include = { ...s.deck.include, total: true, "slg:peloton": true, "slg:leak": false, "slg:scenario": true, "whatif:slg.rev.win-rate": true, "whatif:link.pql-handoff": true };
    expect(validateEngine(s)).toEqual([]);
    s.deck.include = { ...s.deck.include, ["slg:unknown" as never]: true };
    expect(validateEngine(s)).toEqual(["deck.include.slg:unknown: unknown slide"]);
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
