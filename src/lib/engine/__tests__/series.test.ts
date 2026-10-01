import { afterEach, describe, expect, it, vi } from "vitest";
import { shapeOf } from "../catalog-shape";
import { periodRangeOf } from "../cohort";
import {
  calendarDay,
  comparable,
  delta,
  deriveSeries,
  monthView,
  nextMonthOf,
  proposedFromBefore,
  startNextMonth,
  towardTarget,
  windowsOf,
} from "../series";
import { MAX_MONTHS, type EngineState, type MetricEntry } from "../types";
import { validateEngine } from "../validate";
import { currentSnapshot, knownOf } from "../values";
import { EXAMPLE_TODAY, estimated, exampleState, hybridState, measured, missing, ratio, salesAssistedState, withMonthBefore } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * The monthly series (engine spec §19.2, §19.13, A14 T1): a closed month
 * read as it was seen, the next month started, two months compared, and the
 * leak of the month before. Everything here is pure and reads no clock.
 *
 * Non-vacuity: see the journal's T1 entry for each sabotage and the tests it
 * failed.
 */

const at = "2026-09-20T10:00:00.000Z";
const amplitude = { kind: "tool", tool: "amplitude" } as const;
const counter = () => {
  let n = 0;
  return () => `id-${++n}`;
};
const CTX = CTX_FR;

/** The example with July closed before August: July's activation at 15 %, its churn at 3 %. */
function twoMonths(): EngineState {
  return withMonthBefore(exampleState(), (july) => {
    july.metrics["act.rate"] = measured(ratio(120, 800), amplitude);
    july.metrics["ret.logo-churn"] = measured(ratio(12, 400), { kind: "tool", tool: "stripe" });
  });
}

describe("a closed month is read as it was seen (§19.2.3)", () => {
  it("the open month is the state itself, on the day given", () => {
    const s = twoMonths();
    const view = monthView(s, 1, EXAMPLE_TODAY);
    expect(view.state).toBe(s);
    expect(view.today).toBe(EXAMPLE_TODAY);
  });

  it("a closed month: the months up to it, its windows, and the day it was closed for « today »", () => {
    const s = twoMonths();
    s.setup.activationWindowDays = 14;
    const view = monthView(s, 0, EXAMPLE_TODAY);
    expect(view.state.snapshots).toEqual([s.snapshots[0]]);
    expect(currentSnapshot(view.state).referenceMonth).toBe("2026-07");
    // Closed with a 7-day window: it is read with 7, whatever the setup says now.
    expect(view.state.setup.activationWindowDays).toBe(7);
    expect(view.today).toEqual(new Date(2026, 7, 3));
    // The state passed in is never changed.
    expect(s.setup.activationWindowDays).toBe(14);
  });

  it("closed in August, read again in November: the same period and the same confidence", () => {
    // July's paid conversion on the July cohort: 30 days not over on 3 August, so « approximate » — and it must stay so.
    const s = withMonthBefore(exampleState(), (july) => {
      july.metrics["rev.paid-conversion"] = measured(ratio(56, 800), amplitude, { cohortMonth: "2026-07" });
      july.metrics["slg.acq.lead-to-opp"] = measured(ratio(70, 480), { kind: "tool", tool: "hubspot" }, { variant: "mql" });
    });
    const read = (today: Date) => {
      const view = monthView(s, 0, today);
      const snapshot = currentSnapshot(view.state);
      const known = knownOf(snapshot.metrics["rev.paid-conversion"], shapeOf("rev.paid-conversion"), { ...CTX, today: view.today }, { setup: view.state.setup, snapshot });
      const range = periodRangeOf(shapeOf("slg.acq.lead-to-opp"), snapshot.metrics["slg.acq.lead-to-opp"], snapshot, view.state.setup, view.today);
      return { confidence: known.kind === "known" ? known.confidence : null, range };
    };
    const august = read(new Date(2026, 7, 10));
    const november = read(new Date(2026, 10, 15));
    expect(august).toEqual({ confidence: "approximate", range: { from: "2026-04", to: "2026-06" } });
    expect(november).toEqual(august);
    // Without the closing date, November would read it differently: the test above is not vacuous.
    const snapshot = s.snapshots[0]!;
    const naive = knownOf(snapshot.metrics["rev.paid-conversion"], shapeOf("rev.paid-conversion"), { ...CTX, today: new Date(2026, 10, 15) }, { setup: s.setup, snapshot });
    expect(naive.kind === "known" && naive.confidence).toBe("solid");
  });

  it("the calendar day of an ISO instant, as a local date", () => {
    expect(calendarDay("2026-08-03T09:00:00.000Z")).toEqual(new Date(2026, 7, 3));
  });
});

describe("starting the next month (§19.2.1, §19.2.2)", () => {
  it("waits until the flows' month is over, then offers the month that just closed", () => {
    expect(nextMonthOf(exampleState(), EXAMPLE_TODAY)).toEqual({ kind: "not-yet" });
    expect(nextMonthOf(exampleState(), new Date(2026, 9, 2))).toEqual({ kind: "ready", referenceMonth: "2026-09", cohortMonth: "2026-08" });
  });

  it("after a gap, the latest closed month — and the cohort moves by as many months as the flows", () => {
    expect(nextMonthOf(exampleState(), new Date(2026, 11, 5))).toEqual({ kind: "ready", referenceMonth: "2026-11", cohortMonth: "2026-10" });
  });

  it(`refuses a month past ${MAX_MONTHS}`, () => {
    const s = exampleState();
    s.snapshots = Array.from({ length: MAX_MONTHS }, (_, i) => ({ ...structuredClone(s.snapshots[0]!), id: `m-${i}` }));
    expect(nextMonthOf(s, new Date(2026, 9, 2))).toEqual({ kind: "full" });
  });

  it("closes the month with its date and windows, opens the next with the targets only", () => {
    const s = exampleState();
    const next = startNextMonth(s, new Date(2026, 9, 2), "2026-10-02T08:00:00.000Z", counter())!;
    const [august, september] = next.snapshots;
    expect(august).toEqual({ ...s.snapshots[0], closedAt: "2026-10-02T08:00:00.000Z", windows: windowsOf(s.setup) });
    expect(september).toEqual({
      id: "id-1",
      referenceMonth: "2026-09",
      cohortMonth: "2026-08",
      createdAt: "2026-10-02T08:00:00.000Z",
      metrics: {},
      targets: s.snapshots[0]!.targets,
    });
    // A copy of the targets, not the same object: changing September's never changes August's.
    expect(september!.targets).not.toBe(s.snapshots[0]!.targets);
    expect(next.updatedAt).toBe("2026-10-02T08:00:00.000Z");
    expect(validateEngine(next)).toEqual([]);
    // The engine-level settings stay where they are.
    expect(next.setup).toEqual(s.setup);
    expect(next.deck).toEqual(s.deck);
  });

  it("never carries the month's own things over: values, shared counts, requests", () => {
    const s = hybridState();
    s.snapshots[0]!.metrics["ref.k-factor"] = { status: "requested", request: { role: "data", requestedAt: at }, updatedAt: at };
    const september = startNextMonth(s, new Date(2026, 9, 2), "2026-10-02T08:00:00.000Z", counter())!.snapshots[1]!;
    expect(september.metrics).toEqual({});
    expect(september.base).toBeUndefined();
  });

  it("is null before the month is over, and leaves the state as it was", () => {
    const s = exampleState();
    const before = JSON.stringify(s);
    expect(startNextMonth(s, EXAMPLE_TODAY, "2026-09-24T09:00:00.000Z")).toBeNull();
    expect(startNextMonth(s, new Date(2026, 9, 2), "2026-10-02T08:00:00.000Z", counter())).not.toBeNull();
    expect(JSON.stringify(s)).toBe(before);
  });

  it("the sheet offers the month before's definition, never its value", () => {
    const s = startNextMonth(exampleState(), new Date(2026, 9, 2), "2026-10-02T08:00:00.000Z", counter())!;
    expect(proposedFromBefore(s, "acq.cac")).toEqual({ variant: "media-only", source: { kind: "person", role: "finance" } });
    expect(proposedFromBefore(s, "acq.top-channel-share")).toMatchObject({ label: expect.any(String), source: { kind: "tool", tool: "ga4" } });
    expect(proposedFromBefore(s, "ret.d30")).toBeNull();
    expect(proposedFromBefore(exampleState(), "acq.cac")).toBeNull();
  });
});

describe("comparing two months (§19.2.5)", () => {
  const setup = exampleState().setup;
  const act = shapeOf("act.rate");
  const m = (entry: MetricEntry | undefined, s = setup) => ({ entry, setup: s });
  const a = measured(ratio(120, 800), amplitude);
  const b = measured(ratio(144, 800), amplitude);

  it("two measured counts of the same definition compare, in the display unit", () => {
    expect(comparable(m(a), m(b), act)).toEqual({ comparable: true, before: 15, now: 18 });
  });

  it("a number that isn't a number has nothing to compare", () => {
    const event = measured({ kind: "text", text: "a" }, { kind: "other" });
    expect(comparable(m(event), m(event), shapeOf("act.event"))).toBeNull();
    const choice = measured({ kind: "choice", choice: "product" }, { kind: "other" });
    expect(comparable(m(choice), m(choice), shapeOf("ref.mechanism"))).toBeNull();
  });

  it("the month being filled first: not measured, estimated or two readings this month", () => {
    expect(comparable(m(a), m(undefined), act)).toEqual({ comparable: false, why: "not-measured", month: "now" });
    expect(comparable(m(a), m(estimated(15, 20)), act)).toEqual({ comparable: false, why: "estimated", month: "now" });
    const twice: MetricEntry = { status: "conflicting", conflict: { a: { value: ratio(1, 2), source: amplitude }, b: { value: ratio(1, 3), source: amplitude } }, updatedAt: at };
    expect(comparable(m(a), m(twice), act)).toEqual({ comparable: false, why: "conflicting", month: "now" });
  });

  it("then the month before: « pas mesuré en août », « estimé en août »", () => {
    expect(comparable(m(undefined), m(b), act)).toEqual({ comparable: false, why: "not-measured", month: "before" });
    expect(comparable(m(missing("not-tracked", "sprint")), m(b), act)).toEqual({ comparable: false, why: "not-measured", month: "before" });
    expect(comparable(m(estimated(15, 20)), m(b), act)).toEqual({ comparable: false, why: "estimated", month: "before" });
  });

  it("counts one month and a rate typed directly the other don't compare", () => {
    expect(comparable(m(measured({ kind: "rate", percent: 15 }, amplitude)), m(b), act)).toEqual({ comparable: false, why: "entered-differently" });
  });

  it("a changed variant, definition note or window is a changed definition", () => {
    const cac = shapeOf("acq.cac");
    const media = measured(ratio(21_000, 42), { kind: "person", role: "finance" }, { variant: "media-only" });
    expect(comparable(m(media), m({ ...media, variant: "fully-loaded" }), cac)).toEqual({ comparable: false, why: "definition-changed" });
    expect(comparable(m(a), m({ ...b, definitionNote: "un projet créé" }), act)).toEqual({ comparable: false, why: "definition-changed" });
    expect(comparable(m(a, { ...setup, activationWindowDays: 14 }), m(b), act)).toEqual({ comparable: false, why: "definition-changed" });
    // A window that isn't part of this number's definition changes nothing for it.
    const signup = shapeOf("acq.signup-rate");
    const x = measured(ratio(820, 26_000));
    expect(comparable(m(x, { ...setup, activationWindowDays: 14 }), m(x), signup)).toMatchObject({ comparable: true });
  });

  it("the difference in its own kind: points, value and percent, value", () => {
    expect(delta(15, 18, act)).toEqual({ kind: "points", change: 3 });
    expect(delta(500, 550, shapeOf("acq.cac"))).toEqual({ kind: "relative", change: 50, percent: 10 });
    expect(delta(0, 40, shapeOf("act.ttv"))).toEqual({ kind: "relative", change: 40, percent: null });
    expect(delta(0.2, 0.25, shapeOf("ref.k-factor")).kind).toBe("value");
  });

  it("« vers la cible »: behind the target the month before, and moved the right way", () => {
    const higher = { lo: 20, hi: 20, direction: "higher" } as const;
    const lower = { lo: 2, hi: 2, direction: "lower" } as const;
    expect(towardTarget(15, 18, higher)).toBe(true);
    expect(towardTarget(15, 12, higher)).toBe(false);
    // Above the target already, then down past it: closer to 20, and no progress.
    expect(towardTarget(25, 18, higher)).toBe(false);
    // Already past the target and further still: better, but not « toward » a target it had met.
    expect(towardTarget(25, 30, higher)).toBe(false);
    expect(towardTarget(1.5, 1, lower)).toBe(false);
    expect(towardTarget(4, 2.5, lower)).toBe(true);
    expect(towardTarget(4, 5, lower)).toBe(false);
    expect(towardTarget(15, 18, undefined)).toBe(false);
  });
});

describe("deriveSeries — the last two months side by side", () => {
  afterEach(() => vi.useRealTimers());

  it("is null with one month: a v1 or v2 engine has no series", () => {
    expect(deriveSeries(exampleState(), CTX)).toBeNull();
  });

  it("compares the ticked motion's numbers, in catalogue order, never sorted by how far they moved", () => {
    const series = deriveSeries(twoMonths(), CTX)!;
    expect(series).toMatchObject({ previousMonth: "2026-07", month: "2026-08", months: 2 });
    expect(series.motions.map((m) => m.motion)).toEqual(["plg"]);
    const rows = series.motions[0]!.rows;
    const ids = rows.map((r) => r.metric);
    expect(ids.indexOf("acq.signup-rate")).toBeLessThan(ids.indexOf("act.rate"));
    expect(ids.indexOf("act.rate")).toBeLessThan(ids.indexOf("ret.logo-churn"));
    // No text or choice number: there is nothing to subtract.
    expect(ids).not.toContain("act.event");
    expect(rows.find((r) => r.metric === "act.rate")).toEqual({
      metric: "act.rate",
      comparison: { comparable: true, before: 15, now: 18 },
      delta: { kind: "points", change: 3 },
      towardTarget: true,
    });
    expect(rows.find((r) => r.metric === "ret.d30")?.comparison).toEqual({ comparable: false, why: "not-measured", month: "now" });
  });

  it("names the month before's leak, and says when the leak changed stage", () => {
    // July: activation 15 % and churn 3 % both behind their targets; activation is worth more, as in August.
    expect(deriveSeries(twoMonths(), CTX)!.motions[0]).toMatchObject({ previousLeak: ["act.rate"], leakChanged: false });
    // July: activation above its target, churn behind — July's leak was churn, August's is activation.
    const changed = withMonthBefore(exampleState(), (july) => {
      july.metrics["act.rate"] = measured(ratio(200, 800), amplitude);
      july.metrics["ret.logo-churn"] = measured(ratio(16, 400), { kind: "tool", tool: "stripe" });
    });
    const plg = deriveSeries(changed, CTX)!.motions[0]!;
    expect(plg.previousLeak).toEqual(["ret.logo-churn"]);
    expect(plg.leakChanged).toBe(true);
    const same = deriveSeries(withMonthBefore(exampleState()), CTX)!.motions[0]!;
    expect(same).toMatchObject({ previousLeak: ["act.rate"], leakChanged: false });
  });

  it("each motion on its own numbers in the hybrid; sales-assisted alone has only its own", () => {
    const hybrid = deriveSeries(withMonthBefore(hybridState()), CTX)!;
    expect(hybrid.motions.map((m) => m.motion)).toEqual(["plg", "slg"]);
    expect(hybrid.motions[1]!.rows.every((r) => r.metric.startsWith("slg."))).toBe(true);
    expect(hybrid.motions[0]!.rows.every((r) => !r.metric.startsWith("slg.") && !r.metric.startsWith("link."))).toBe(true);
    const slg = deriveSeries(withMonthBefore(salesAssistedState()), CTX)!;
    expect(slg.motions.map((m) => m.motion)).toEqual(["slg"]);
  });

  it("reads no clock: the same series whatever the machine's date", () => {
    const s = twoMonths();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    const january = deriveSeries(s, CTX);
    vi.setSystemTime(new Date(2031, 6, 14));
    expect(deriveSeries(s, CTX)).toEqual(january);
  });
});
