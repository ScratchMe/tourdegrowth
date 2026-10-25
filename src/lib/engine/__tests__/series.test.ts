import { afterEach, describe, expect, it, vi } from "vitest";
import { MKT_METRIC_SHAPES, shapeOf } from "../catalog-shape";
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
  withMonth,
} from "../series";
import { MAX_MONTHS, SNAPSHOT_WINDOW_KEYS, type EngineState, type MetricEntry } from "../types";
import { validateEngine } from "../validate";
import { currentSnapshot, knownOf } from "../values";
import {
  EXAMPLE_TODAY,
  estimated,
  exampleState,
  hybridState,
  marketplaceNoSubscriptionsState,
  marketplaceState,
  measured,
  missing,
  ratio,
  salesAssistedState,
  withMonthBefore,
  withTarget,
} from "./fixtures";
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

describe("a past month corrected goes back in its place (§19.2.4)", () => {
  it("its months replace the engine's up to it, the later ones follow, the engine-level fields stay the engine's", () => {
    const s = twoMonths();
    s.setup.activationWindowDays = 14;
    s.whatIf = { "act.rate": 24 };
    const lens = monthView(s, 0, EXAMPLE_TODAY).state;
    const edited: EngineState = {
      ...lens,
      updatedAt: "2026-10-05T09:00:00.000Z",
      snapshots: [{ ...lens.snapshots[0]!, metrics: { ...lens.snapshots[0]!.metrics, "act.rate": measured(ratio(130, 800), amplitude) } }],
    };
    const merged = withMonth(s, 0, edited);
    expect(merged.snapshots[0]!.metrics["act.rate"]).toEqual(measured(ratio(130, 800), amplitude));
    expect(merged.snapshots[1]).toBe(s.snapshots[1]);
    // The closed month's 7-day window stays on the month; the setup keeps its 14.
    expect(merged.setup.activationWindowDays).toBe(14);
    expect(merged.whatIf).toEqual({ "act.rate": 24 });
    expect(merged.updatedAt).toBe("2026-10-05T09:00:00.000Z");
    expect(validateEngine(merged)).toEqual([]);
    // With the setup's window changed since July, the two months no longer compare: the definition moved.
    expect(deriveSeries(merged, CTX)!.motions[0]!.rows.find((r) => r.metric === "act.rate")?.comparison).toEqual({ comparable: false, why: "definition-changed" });
  });

  it("the next month's change recomputes from the corrected one", () => {
    const s = twoMonths();
    const lens = monthView(s, 0, EXAMPLE_TODAY).state;
    const july = { ...lens.snapshots[0]!, metrics: { ...lens.snapshots[0]!.metrics, "act.rate": measured(ratio(130, 800), amplitude) } };
    const merged = withMonth(s, 0, { ...lens, snapshots: [july] });
    const row = deriveSeries(merged, CTX)!.motions[0]!.rows.find((r) => r.metric === "act.rate");
    expect(row?.comparison).toEqual({ comparable: true, before: 16.25, now: 18 });
  });

  it("refuses a state that isn't that month's view", () => {
    const s = twoMonths();
    expect(() => withMonth(s, 0, s)).toThrow();
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

/**
 * A marketplace's windows (engine spec §22.3, A23 MKT-0): its three are part of its numbers' definitions, so a closed
 * month keeps them with the four every setup has — for that type only: the SaaS goldens and the app's see no new key.
 *
 * Non-vacuity, measured on 2026-10-18 (each sabotage applied alone, the whole of `src/lib/engine` run, the file
 * restored; the count is the tests that fall): `windowsOf` writing the three for every type falls « a SaaS and an app
 * write the four » and « a SaaS's closed month carries no key » (2) — and no golden: they do not read a month's
 * windows, so this block is the only guard of « no new key »; writing none falls « a marketplace writes the four and
 * its three », « the next month closes the month » and `merge.test.ts`'s closing test (3).
 */
describe("windowsOf and a closed month — the marketplace's three windows (§22.3)", () => {
  const FOUR = ["activationWindowDays", "goLiveWindowDays", "paidWindowDays", "qualificationWindowDays"];
  const market = (extra: Partial<EngineState["setup"]> = {}): EngineState => {
    const s = exampleState();
    return { ...s, setup: { ...s.setup, type: "marketplace", motions: { plg: false, slg: false }, ...extra } };
  };
  const OCTOBER = new Date(2026, 9, 3);

  it("a SaaS and an app write the four windows they always did and no other key — even one that carries a marketplace's field", () => {
    const saas = exampleState().setup;
    expect(Object.keys(windowsOf(saas)).sort()).toEqual(FOUR);
    expect(Object.keys(windowsOf({ ...saas, repeatWindowDays: 180, firstOrderWindowDays: 7, firstSaleWindowDays: 90 })).sort()).toEqual(FOUR);
    const app: EngineState["setup"] = { ...saas, type: "consumer-app", motions: { plg: true, slg: false }, monetization: { subscriptions: true, purchases: false, ads: false } };
    expect(Object.keys(windowsOf(app)).sort()).toEqual(FOUR);
  });

  it("a marketplace writes the four and its three: the defaults when the setup says nothing, its own values otherwise", () => {
    expect(windowsOf(market().setup)).toEqual({
      activationWindowDays: 7,
      paidWindowDays: 30,
      qualificationWindowDays: 30,
      goLiveWindowDays: 90,
      firstOrderWindowDays: 30,
      repeatWindowDays: 90,
      firstSaleWindowDays: 60,
    });
    expect(windowsOf(market({ firstOrderWindowDays: 7, repeatWindowDays: 180, firstSaleWindowDays: 90 }).setup)).toMatchObject({
      firstOrderWindowDays: 7,
      repeatWindowDays: 180,
      firstSaleWindowDays: 90,
    });
  });

  it("the next month closes the month that ends with the three, and the closed month is read back with them", () => {
    const s = market({ repeatWindowDays: 180 });
    const next = startNextMonth(s, OCTOBER, "2026-10-03T09:00:00.000Z", counter())!;
    expect(next.snapshots[0]!.windows).toEqual(windowsOf(s.setup));
    expect(next.snapshots[0]!.windows).toMatchObject({ firstOrderWindowDays: 30, repeatWindowDays: 180, firstSaleWindowDays: 60 });
    expect(next.snapshots[1]!.windows).toBeUndefined();
    expect(validateEngine(next)).toEqual([]);
    // The setup changes its window afterwards: the closed month is read with the one it was closed with.
    const later = { ...next, setup: { ...next.setup, repeatWindowDays: 60 as const, firstOrderWindowDays: 7 as const } };
    const view = monthView(later, 0, OCTOBER);
    expect(view.state.setup).toMatchObject({ repeatWindowDays: 180, firstOrderWindowDays: 30, firstSaleWindowDays: 60 });
    expect(later.setup.repeatWindowDays).toBe(60);
    // The open month is read with the setup as it stands.
    expect(monthView(later, 1, OCTOBER).state.setup).toMatchObject({ repeatWindowDays: 60, firstOrderWindowDays: 7 });
  });

  it("a SaaS's closed month carries no key of the marketplace, whatever its setup holds", () => {
    const next = startNextMonth({ ...exampleState(), setup: { ...exampleState().setup, repeatWindowDays: 180 } }, OCTOBER, "2026-10-03T09:00:00.000Z", counter())!;
    expect(Object.keys(next.snapshots[0]!.windows!).sort()).toEqual(FOUR);
  });
});

/**
 * A closed month never rewrites the setup (the security review of A23 MKT-0, 2026-10-18): `monthView` copies the seven
 * keys of `SnapshotWindows` and no other, so a forged file whose closed month carries `type: "marketplace"` (or a
 * currency, the motions, the tools…) is still read as the SaaS it is — the barrier `MARKETPLACE_SCREENS_READY` cannot
 * be walked round through a past month.
 *
 * Non-vacuity, measured on 2026-10-18 (each sabotage applied alone, the whole of `src/lib/engine` run, the file
 * restored; the count is the tests that fall): the old spread of `snapshot.windows` into the setup falls the first
 * three tests here (3); copying the four windows only falls « a window the month holds is copied » and the
 * marketplace test above (2); copying a key whose value is undefined falls « a window the month does not hold » (1);
 * the list without `firstSaleWindowDays` falls the list test, « a window the month holds », the marketplace test
 * above, `merge.test.ts`'s closing test and two tests of `validate.test.ts` (6).
 */
describe("monthView — a closed month copies its windows and nothing else", () => {
  const OCTOBER = new Date(2026, 9, 3);
  const FORGED = {
    type: "marketplace",
    currency: "USD",
    motions: { plg: false, slg: false },
    tools: ["stripe"],
    companyLabel: "Forged Inc.",
    offering: "services",
    sellerSubscriptions: true,
  };
  /** The example, with the two optional fields the forged month tries to rewrite actually set. */
  const saas = (): EngineState => {
    const s = exampleState();
    return { ...s, setup: { ...s.setup, companyLabel: "Acme", tools: ["amplitude"] } };
  };
  const forgedMonth = (extra: Record<string, unknown>): EngineState => {
    const s = saas();
    const next = startNextMonth(s, OCTOBER, "2026-10-03T09:00:00.000Z", counter())!;
    next.snapshots[0]!.windows = { ...windowsOf(s.setup), ...extra } as never;
    return next;
  };

  it("a closed month that carries a type, a currency, the motions, the tools or a label keeps the setup's own — the SaaS stays a SaaS", () => {
    const s = saas();
    const next = forgedMonth(FORGED);
    const { setup } = monthView(next, 0, OCTOBER).state;
    expect(setup.type).toBe("b2b-saas");
    expect(setup.currency).toBe(s.setup.currency);
    expect(setup.currency).not.toBe("USD");
    expect(setup.motions).toEqual(s.setup.motions);
    expect(setup.tools).toEqual(["amplitude"]);
    expect(setup.companyLabel).toBe("Acme");
    expect(setup.offering).toBeUndefined();
    expect(setup.sellerSubscriptions).toBeUndefined();
    // Not one field of the setup moved: the windows the forged month carries are the setup's own, so the view IS the setup.
    expect(setup).toEqual(next.setup);
  });

  it("a window the month holds is copied, over the setup's: the four, and a marketplace's three", () => {
    const next = forgedMonth({ ...FORGED, activationWindowDays: 14, goLiveWindowDays: 60 });
    expect(monthView(next, 0, OCTOBER).state.setup).toMatchObject({ activationWindowDays: 14, goLiveWindowDays: 60, type: "b2b-saas" });
    const s = exampleState();
    const market: EngineState = { ...s, setup: { ...s.setup, type: "marketplace", motions: { plg: false, slg: false }, repeatWindowDays: 180 } };
    const closed = startNextMonth(market, OCTOBER, "2026-10-03T09:00:00.000Z", counter())!;
    const later = { ...closed, setup: { ...closed.setup, repeatWindowDays: 60 as const, firstOrderWindowDays: 7 as const, firstSaleWindowDays: 90 as const } };
    expect(monthView(later, 0, OCTOBER).state.setup).toMatchObject({ type: "marketplace", repeatWindowDays: 180, firstOrderWindowDays: 30, firstSaleWindowDays: 60 });
  });

  it("a window the month does not hold leaves the setup's alone — a SaaS's closed month has no marketplace window to copy", () => {
    const s = exampleState();
    const saas = { ...s, setup: { ...s.setup, repeatWindowDays: 180 as const } };
    const closed = startNextMonth(saas, OCTOBER, "2026-10-03T09:00:00.000Z", counter())!;
    expect(monthView(closed, 0, OCTOBER).state.setup.repeatWindowDays).toBe(180);
    const { activationWindowDays: _kept, ...fewer } = closed.snapshots[0]!.windows!;
    closed.snapshots[0]!.windows = { ...fewer, paidWindowDays: undefined } as never;
    expect(monthView({ ...closed, setup: { ...closed.setup, activationWindowDays: 14 } }, 0, OCTOBER).state.setup).toMatchObject({ activationWindowDays: 14, paidWindowDays: closed.setup.paidWindowDays });
  });

  it("the list of copied keys is the keys `windowsOf` writes for a marketplace: seven, no more", () => {
    const s = exampleState();
    const market = { ...s.setup, type: "marketplace" as const, motions: { plg: false, slg: false } };
    expect([...SNAPSHOT_WINDOW_KEYS].sort()).toEqual(Object.keys(windowsOf(market)).sort());
    expect(SNAPSHOT_WINDOW_KEYS).toHaveLength(7);
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

describe("deriveSeries — a marketplace (§22.5.9, A23 MKT-4)", () => {
  // Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md`.
  const ga4 = { kind: "tool", tool: "ga4" } as const;
  const stripe = { kind: "tool", tool: "stripe" } as const;
  const mkt = (state: EngineState) => deriveSeries(state, CTX)!.motions[0]!;

  it("compares the marketplace's own motion, its nineteen numbers in catalogue order, both sides together", () => {
    const series = deriveSeries(withMonthBefore(marketplaceState()), CTX)!;
    expect(series).toMatchObject({ previousMonth: "2026-07", month: "2026-08", months: 2 });
    expect(series.motions.map((m) => m.motion)).toEqual(["mkt"]);
    expect(series.motions[0]!.rows.map((r) => r.metric)).toEqual(MKT_METRIC_SHAPES.map((s) => s.id));
    // Every number compares with itself but the commissions' margin, which the example only estimates: « estimé en août ».
    const rows = series.motions[0]!.rows;
    expect(rows.filter((r) => !r.comparison.comparable).map((r) => [r.metric, r.comparison])).toEqual([["mkt.rev.gross-margin", { comparable: false, why: "estimated", month: "now" }]]);
    expect(rows.find((r) => r.metric === "mkt.liq.fill-rate")).toMatchObject({ comparison: { comparable: true, before: 9, now: 9 }, delta: { kind: "points", change: 0 } });
    // Without the sellers' subscriptions the five numbers of the subscriptions are not compared: fourteen.
    expect(mkt(withMonthBefore(marketplaceNoSubscriptionsState())).rows).toHaveLength(14);
  });

  it("names each side's leak of the month before, on its own: the same stages in July as in August, nothing changed", () => {
    expect(mkt(withMonthBefore(marketplaceState()))).toMatchObject({
      motion: "mkt",
      previousLeak: [],
      leakChanged: false,
      sides: {
        demand: { previousLeak: ["mkt.liq.fill-rate"], leakChanged: false },
        supply: { previousLeak: ["mkt.sell.paid-conversion"], leakChanged: false },
      },
    });
  });

  it("says when a side's leak changed stage, and only that side's: the demand's in one month, the supply's in another", () => {
    // July: the fill rate met its 12 % target, so the demand's leak was the first order — August's is the fill rate.
    const demand = mkt(withMonthBefore(marketplaceState(), (july) => void (july.metrics["mkt.liq.fill-rate"] = measured(ratio(3_380, 26_000), ga4))));
    expect(demand.sides!.demand).toEqual({ previousLeak: ["mkt.buy.first-order"], leakChanged: true });
    expect(demand.sides!.supply).toEqual({ previousLeak: ["mkt.sell.paid-conversion"], leakChanged: false });
    // July: the conversion to a paid seller met its 20 % target, the paid sellers' churn was the leak — August's is the conversion.
    const supply = mkt(withMonthBefore(marketplaceState(), (july) => void (july.metrics["mkt.sell.paid-conversion"] = measured(ratio(92, 420), stripe))));
    expect(supply.sides!.supply).toEqual({ previousLeak: ["mkt.sell.paid-churn"], leakChanged: true });
    expect(supply.sides!.demand).toEqual({ previousLeak: ["mkt.liq.fill-rate"], leakChanged: false });
    // The motion's own fields say nothing: the screens read `sides`.
    expect(demand.previousLeak).toEqual([]);
    expect(demand.leakChanged).toBe(false);
  });

  it("a side that names nothing the month before has no previous leak: the supply without the subscriptions", () => {
    expect(mkt(withMonthBefore(marketplaceNoSubscriptionsState())).sides).toEqual({
      demand: { previousLeak: ["mkt.liq.fill-rate"], leakChanged: false },
      supply: { previousLeak: [], leakChanged: false },
    });
  });

  it("moves toward a target the right way for the marketplace's churns too: lower is better", () => {
    // The buyers' churn was 5 % in July and is 4 % in August, against a 3,5 % ceiling: closer to it.
    const state = withMonthBefore(withTarget(marketplaceState(), "mkt.buy.churn", 3.5), (july) => void (july.metrics["mkt.buy.churn"] = measured(ratio(700, 14_000), stripe)));
    const row = mkt(state).rows.find((r) => r.metric === "mkt.buy.churn")!;
    expect(row).toEqual({ metric: "mkt.buy.churn", comparison: { comparable: true, before: 5, now: 4 }, delta: { kind: "points", change: -1 }, towardTarget: true });
    // A number that is no candidate has no « toward ».
    expect(mkt(state).rows.find((r) => r.metric === "mkt.rev.aov")?.towardTarget).toBe(false);
  });

  it("a SaaS and an app have no `sides`: only a marketplace's motion holds one", () => {
    expect(mkt(withMonthBefore(exampleState()))).not.toHaveProperty("sides");
    for (const m of deriveSeries(withMonthBefore(hybridState()), CTX)!.motions) expect(m).not.toHaveProperty("sides");
  });
});
