import { describe, expect, it } from "vitest";

import { ALL_METRIC_SHAPES, shapesOf } from "../catalog-shape";
import { knownSharedCount, offBase, propagateFrom, SHARED_COUNTS, settingsSharedCounts, sharedCountAt, sharedWith, WHOLE_SHARED_COUNTS, withSettingsNumbers, withSharedCount } from "../shared-counts";
import type { MetricId } from "../types";
import { validateEngine } from "../validate";
import { ENGINE_CATALOG } from "@/content/engine-catalog";
import { ENGINE_CATALOG_CONSUMER, type ConsumerPlgMetricId } from "@/content/engine-catalog-consumer";
import { emptyState, exampleState, measured, ratio } from "./fixtures";

// Antoine, 2026-09-25: « il y a des chiffres qui sont demandés plusieurs fois
// dans plusieurs catégories ». The cohort's sign-ups were typed five times.

describe("SHARED_COUNTS — which numbers share a count", () => {
  it("groups exactly the count labels the catalogue writes identically, and no other", () => {
    // The catalogue is the source of truth for what a count IS: if two
    // labels read the same, they are one population and belong together.
    const label = (id: string, side: "numerator" | "denominator", locale: "fr" | "en" = "fr") =>
      ENGINE_CATALOG[id as keyof typeof ENGINE_CATALOG].inputs?.[side]?.[locale] ?? null;
    // Every group, the three sales-assisted ones included since their prose (A7.3.c S2), in both languages.
    expect(Object.keys(SHARED_COUNTS)).toEqual(expect.arrayContaining(["slgOppsCreated", "slgDealsWon", "slgCustomers"]));
    for (const all of Object.values(SHARED_COUNTS)) {
      // The app's own places read the app's catalogue (« Installations en {month} »): catalogue de l'app : APP-2, which
      // compares them in a second block. A group left with no place here (`appActives`) is skipped: no label to compare.
      const slots = all.filter((s) => !s.metric.startsWith("app."));
      if (slots.length === 0) continue;
      for (const locale of ["fr", "en"] as const) {
        const labels = new Set(slots.map((s) => label(s.metric, s.side, locale)));
        expect(labels.size, `${locale} ${JSON.stringify(slots)}`).toBe(1);
        expect([...labels][0], `${locale} ${JSON.stringify(slots)}`).not.toBeNull();
      }
    }
    // And every repeated label across the catalogue, every motion's, is covered by a group.
    const seen = new Map<string, string[]>();
    for (const shape of ALL_METRIC_SHAPES) {
      for (const side of ["numerator", "denominator"] as const) {
        const l = label(shape.id, side);
        if (l) seen.set(l, [...(seen.get(l) ?? []), `${shape.id}:${side}`]);
      }
    }
    for (const [l, slots] of seen) {
      if (slots.length < 2) continue;
      const covered = slots.every((s) => {
        const [id, side] = s.split(":") as [string, "numerator" | "denominator"];
        return sharedCountAt(id as never, side) !== null;
      });
      expect(covered, `« ${l} » appears in ${slots.join(", ")} but is not shared`).toBe(true);
    }
  });
});

// The groups an app's numbers sit in (§21.2.4, A22 APP-2): the first block above skips the app's own places, whose prose is
// the app's, not the SaaS's. Here they are read where they are written — the app's catalogue for the fifteen self-serve
// numbers (`ENGINE_CATALOG_CONSUMER`), the main one for the six of its own — and must say the same population, in both languages.
// Non-vacuity, measured on 2026-10-05: « Inscrits en {month} » put back in the install rate's label falls the French case.
describe("SHARED_COUNTS — the groups that hold an app number, read in the app's catalogue", () => {
  const appLabel = (id: MetricId, side: "numerator" | "denominator", locale: "fr" | "en"): string | null => {
    const entry = id.startsWith("app.") ? ENGINE_CATALOG[id] : ENGINE_CATALOG_CONSUMER[id as ConsumerPlgMetricId];
    return entry?.inputs?.[side]?.[locale] ?? null;
  };
  const groups = Object.entries(SHARED_COUNTS).filter(([, slots]) => slots.some((s) => s.metric.startsWith("app.")));

  it("holds two groups: the installs of the month (three places) and the month's actives (two)", () => {
    expect(groups.map(([count, slots]) => [count, slots.length])).toEqual([
      ["monthSignups", 3],
      ["appActives", 2],
    ]);
  });

  it.each(["fr", "en"] as const)("labels every place of such a group alike (%s) — « Installations en {month} » three times, « Actifs en {month} » twice", (locale) => {
    const read = Object.fromEntries(
      groups.map(([count, slots]) => {
        const labels = slots.map((s) => appLabel(s.metric, s.side, locale));
        expect(new Set(labels).size, `${locale} ${count}: ${JSON.stringify(labels)}`).toBe(1);
        expect(labels[0], `${locale} ${count}`).not.toBeNull();
        return [count, labels[0]];
      }),
    );
    expect(read).toEqual(locale === "fr" ? { monthSignups: "Installations en {month}", appActives: "Actifs en {month}" } : { monthSignups: "Installs in {month}", appActives: "Actives in {month}" });
  });
});

describe("knownSharedCount", () => {
  it("reads the base first, then the first entry that carries the count (a file from before the base)", () => {
    const snap = exampleState().snapshots[0]!;
    expect(knownSharedCount(snap, "cohortSignups")).toEqual({ value: 800, from: "act.rate" });
    expect(knownSharedCount({ ...snap, base: { cohortSignups: 810 } }, "cohortSignups")).toEqual({ value: 810, from: "base" });
    expect(knownSharedCount(emptyState().snapshots[0]!, "cohortSignups")).toBeNull();
  });
});

describe("withSharedCount / propagateFrom", () => {
  it("writes the count into the base and into every entry that carries it as counts", () => {
    const snap = withSharedCount(exampleState().snapshots[0]!, "cohortSignups", 820);
    expect(snap.base?.cohortSignups).toBe(820);
    expect(snap.metrics["act.rate"]?.value).toEqual(ratio(144, 820));
    expect(snap.metrics["ref.referred-share"]?.value).toEqual(ratio(48, 820));
    // An estimate carries no count: untouched.
    expect(snap.metrics["rev.paid-conversion"]).toEqual(exampleState().snapshots[0]!.metrics["rev.paid-conversion"]);
    expect(offBase(snap, "cohortSignups")).toEqual([]);
  });

  it("never makes a bounded number impossible: that entry keeps its own base, and is listed as off it", () => {
    const snap = withSharedCount(exampleState().snapshots[0]!, "cohortSignups", 100);
    expect(snap.metrics["act.rate"]?.value).toEqual(ratio(144, 800));
    expect(offBase(snap, "cohortSignups")).toContain("act.rate");
  });

  it("saving one entry propagates its counts to the others, both groups", () => {
    const start = exampleState().snapshots[0]!;
    const snap = propagateFrom({ ...start, metrics: { ...start.metrics, "acq.top-channel-share": measured(ratio(410, 830)) } }, "acq.top-channel-share");
    expect(snap.base?.monthSignups).toBe(830);
    expect(snap.metrics["acq.signup-rate"]?.value).toEqual(ratio(830, 26_000));
  });

  it("a state with a base passes validation; a nonsense base does not", () => {
    const state = exampleState();
    state.snapshots[0]!.base = { cohortSignups: 800, monthSignups: 820 };
    expect(validateEngine(state)).toEqual([]);
    (state.snapshots[0]!.base as Record<string, number>).cohortSignups = 0;
    expect(validateEngine(state).join()).toContain("base.cohortSignups");
  });
});

describe("the sales-assisted counts (engine spec §18.2, S6)", () => {
  it("opportunities, deals won and customers are each typed once, and reach every entry that carries them", () => {
    const at = "2026-09-30T10:00:00.000Z";
    const tool = { kind: "tool" as const, tool: "hubspot" as const };
    const snap = {
      ...emptyState().snapshots[0]!,
      metrics: {
        "slg.rev.win-rate": { status: "measured" as const, value: ratio(18, 75), source: tool, updatedAt: at },
        "slg.rev.acv": { status: "measured" as const, value: ratio(432_000, 17), source: tool, updatedAt: at },
        "slg.ref.referred-share": { status: "measured" as const, value: ratio(26, 130), source: tool, updatedAt: at },
      },
    };
    // The win rate's 18 deals won is the ACV's count of contracts: saving one writes the other.
    const next = propagateFrom(snap, "slg.rev.win-rate");
    expect(next.base?.slgDealsWon).toBe(18);
    expect(next.metrics["slg.rev.acv"]?.value).toEqual(ratio(432_000, 18));
    expect(sharedCountAt("link.pql-handoff", "denominator")).toBe("slgOppsCreated");
    expect(sharedCountAt("slg.ref.referenceable", "denominator")).toBe("slgCustomers");
    expect(sharedCountAt("slg.acq.cac", "denominator")).toBe("slgDealsWon");
    // The self-serve counts never reach a sales-assisted number, and the reverse.
    for (const count of ["cohortSignups", "monthSignups", "mrrEnd", "mrrStart"] as const)
      expect(SHARED_COUNTS[count].every((s) => !s.metric.startsWith("slg.") && !s.metric.startsWith("link."))).toBe(true);
  });

  it("a sales-assisted count is a whole number: 12.5 deals is refused", () => {
    const state = exampleState();
    state.snapshots[0]!.base = { slgOppsCreated: 130, slgDealsWon: 18, slgCustomers: 100 };
    expect(validateEngine(state)).toEqual([]);
    state.snapshots[0]!.base.slgDealsWon = 12.5;
    expect(validateEngine(state)).toEqual(["snapshots[0].base.slgDealsWon: not a whole number > 0"]);
  });
});

describe("the MRR counts (2026-09-26)", () => {
  it("the MRR typed for ARPA is the gross margin's base, and the 1st-of-month MRR is shared by expansion and contraction", () => {
    const snapshot = exampleState().snapshots[0]!;
    // Gross margin: typed later, its revenue already there.
    expect(knownSharedCount(snapshot, "mrrEnd")).toEqual({ value: 48_000, from: "rev.arpa" });
    expect(knownSharedCount(snapshot, "mrrStart")).toEqual({ value: 46_800, from: "rev.expansion" });
    const withMargin = {
      ...snapshot,
      metrics: { ...snapshot.metrics, "rev.gross-margin": { status: "measured" as const, value: { kind: "ratio" as const, numerator: 36_000, denominator: 40_000 }, source: { kind: "other" as const }, updatedAt: "2026-09-26T10:00:00.000Z" } },
    };
    const next = propagateFrom(withMargin, "rev.gross-margin");
    expect(next.base?.mrrEnd).toBe(40_000);
    expect(next.metrics["rev.arpa"]?.value).toEqual({ kind: "ratio", numerator: 40_000, denominator: 400 });
  });
});

describe("the Settings' shared counts (A18 T3.d)", () => {
  const shown = (plg: boolean, slg: boolean) => shapesOf({ type: "b2b-saas", motions: { plg, slg } }).map((shape) => shape.id);
  const offered = (plg: boolean, slg: boolean) =>
    settingsSharedCounts(shown(plg, slg)).map(({ count, slots }) => [count, slots.map((slot) => slot.metric)]);

  it("self-serve: the cohort's and the month's sign-ups, each with the numbers that carry it, in the catalogue's order", () => {
    expect(offered(true, false)).toEqual([
      ["cohortSignups", ["act.rate", "ret.d30", "ref.referred-share", "ref.k-factor", "rev.paid-conversion"]],
      ["monthSignups", ["acq.signup-rate", "acq.top-channel-share"]],
    ]);
  });

  it("sales-assisted alone: two counts, the opportunities left out — without the hybrid's link, one number carries them", () => {
    expect(offered(false, true)).toEqual([
      ["slgDealsWon", ["slg.rev.win-rate", "slg.rev.acv", "slg.acq.cac"]],
      ["slgCustomers", ["slg.rev.arpa", "slg.ref.referenceable"]],
    ]);
    expect(offered(true, true).map(([count]) => count)).toEqual(["cohortSignups", "monthSignups", "slgOppsCreated", "slgDealsWon", "slgCustomers"]);
    expect(offered(true, true)[2]).toEqual(["slgOppsCreated", ["slg.ref.referred-share", "link.pql-handoff"]]);
  });

  it("never the MRRs: an amount is typed with the figure it belongs to", () => {
    const counts = settingsSharedCounts(ALL_METRIC_SHAPES.map((shape) => shape.id)).map(({ count }) => count);
    expect(counts).not.toContain("mrrEnd");
    expect(counts).not.toContain("mrrStart");
  });

  it("writes the targets typed (null takes one away) and the counts changed, into the base and the entries, in one snapshot", () => {
    const start = exampleState().snapshots[0]!;
    const before = JSON.stringify(start);
    // The example's team has two targets, activation's among them.
    expect(start.targets["act.rate"]).toBeDefined();
    const next = withSettingsNumbers(start, { targets: { "acq.signup-rate": 4, "act.rate": null }, base: { cohortSignups: 820 } });
    expect(next.targets["acq.signup-rate"]).toBe(4);
    expect(next.targets).not.toHaveProperty("act.rate");
    expect(next.base?.cohortSignups).toBe(820);
    expect(next.metrics["act.rate"]?.value).toEqual(ratio(144, 820));
    // The other targets are kept, and the snapshot given is not touched.
    const others = Object.keys(start.targets).filter((id) => id !== "act.rate");
    expect(others.length).toBeGreaterThan(0);
    for (const id of others) expect(next.targets[id as never]).toBe(start.targets[id as never]);
    expect(JSON.stringify(start)).toBe(before);
    expect(withSettingsNumbers(start, {})).toEqual(start);
  });
});

// Engine spec §21.2.4, A22 APP-1. Non-vacuity, measured on 2026-10-05 (each sabotage alone, the engine's unit tests
// run, then put back): the `app.acq.cpi` slot taken out of `monthSignups` fails 3 (the two first tests below and the
// Settings one); the `appActives` group emptied, 4 (those three, and the existing « repeated label is a group » guard
// of the first describe, which sees « Actifs en {month} » twice with no group); the ads' revenue made the group's
// numerator instead of its denominator, 3; `appActives` taken out of `WHOLE_SHARED_COUNTS`, 3 (the group test, the
// « whole number » one and the Settings one).
describe("the consumer app's counts (engine spec §21.2.4, A22 APP-1)", () => {
  const at = "2026-10-05T10:00:00.000Z";
  const store = { kind: "tool" as const, tool: "revenuecat" as const };
  const entry = (numerator: number, denominator: number) => ({ status: "measured" as const, value: ratio(numerator, denominator), source: store, updatedAt: at });
  const ALL_THREE = { subscriptions: true, purchases: true, ads: true };

  it("the month's installs are the cost per install's base too; the month's actives are the two per-active revenues' base", () => {
    expect(SHARED_COUNTS.monthSignups).toEqual([
      { metric: "acq.signup-rate", side: "numerator" },
      { metric: "acq.top-channel-share", side: "denominator" },
      { metric: "app.acq.cpi", side: "denominator" },
    ]);
    expect(SHARED_COUNTS.appActives).toEqual([
      { metric: "app.rev.purchases-per-active", side: "denominator" },
      { metric: "app.rev.ads-per-active", side: "denominator" },
    ]);
    expect(sharedCountAt("app.acq.cpi", "denominator")).toBe("monthSignups");
    expect(sharedCountAt("app.rev.purchases-per-active", "denominator")).toBe("appActives");
    expect(sharedCountAt("app.rev.ads-per-active", "denominator")).toBe("appActives");
    // Nothing else is shared: the actives' retention reads last month's actives, a count of its own.
    for (const id of ["app.ret.active-retention", "app.rev.commission", "app.rev.gross-margin"] as const) {
      expect(sharedCountAt(id, "numerator"), `${id} numerator`).toBeNull();
      expect(sharedCountAt(id, "denominator"), `${id} denominator`).toBeNull();
    }
    expect(WHOLE_SHARED_COUNTS).toContain("appActives");
  });

  it("typing the month's actives on one per-active revenue writes them into the other, and into the base", () => {
    const snap = { ...emptyState().snapshots[0]!, metrics: { "app.rev.purchases-per-active": entry(30_000, 12_000), "app.rev.ads-per-active": entry(9_000, 15_000) } };
    const next = propagateFrom(snap, "app.rev.purchases-per-active");
    expect(next.base?.appActives).toBe(12_000);
    expect(next.metrics["app.rev.ads-per-active"]?.value).toEqual(ratio(9_000, 12_000));
    expect(next.metrics["app.rev.purchases-per-active"]?.value).toEqual(ratio(30_000, 12_000));
    expect(knownSharedCount(snap, "appActives")).toEqual({ value: 12_000, from: "app.rev.purchases-per-active" });
    // Installs: the cost per install and the sign-up rate share the month's count.
    const installs = propagateFrom({ ...snap, metrics: { "acq.signup-rate": entry(2_000, 60_000), "app.acq.cpi": entry(8_000, 2_400) } }, "app.acq.cpi");
    expect(installs.base?.monthSignups).toBe(2_400);
    expect(installs.metrics["acq.signup-rate"]?.value).toEqual(ratio(2_400, 60_000));
  });

  it("an appActives count is a whole number: 12.5 people is refused", () => {
    const state = exampleState();
    state.snapshots[0]!.base = { appActives: 12_000 };
    expect(validateEngine(state)).toEqual([]);
    state.snapshots[0]!.base.appActives = 12.5;
    expect(validateEngine(state)).toEqual(["snapshots[0].base.appActives: not a whole number > 0"]);
  });

  it("the Settings offer an app's installs and actives, the numbers that carry each said under them; a SaaS is offered what it was", () => {
    const app = shapesOf({ type: "consumer-app", motions: { plg: true, slg: false }, monetization: ALL_THREE }).map((s) => s.id);
    expect(settingsSharedCounts(app).map(({ count, slots }) => [count, slots.map((slot) => slot.metric)])).toEqual([
      ["cohortSignups", ["act.rate", "ret.d30", "ref.referred-share", "ref.k-factor", "rev.paid-conversion"]],
      ["monthSignups", ["acq.signup-rate", "acq.top-channel-share", "app.acq.cpi"]],
      ["appActives", ["app.rev.purchases-per-active", "app.rev.ads-per-active"]],
    ]);
    // One of the two per-active revenues alone (purchases or ads ticked, not both): a count one number carries is not shared.
    const purchasesOnly = shapesOf({ type: "consumer-app", motions: { plg: true, slg: false }, monetization: { subscriptions: false, purchases: true, ads: false } }).map((s) => s.id);
    expect(settingsSharedCounts(purchasesOnly).map(({ count }) => count)).not.toContain("appActives");
    const saas = shapesOf({ type: "b2b-saas", motions: { plg: true, slg: false } }).map((s) => s.id);
    expect(settingsSharedCounts(saas).map(({ count, slots }) => [count, slots.length])).toEqual([["cohortSignups", 5], ["monthSignups", 2]]);
  });
});

// Engine spec §21.2.4, A22 APP-1 (the line under a number's boxes names the other numbers of its count, among the ones
// the view can name). Non-vacuity, measured on 2026-10-05 (each sabotage alone on `sharedWith`, the engine's unit tests
// run, then put back; failures counted over this file and engine-props.test.ts): `named` ignored, 5 (the SaaS view and
// « never itself » here, three there); a filter on `shapesOf` of a self-serve SaaS, which takes the link out, 6 (this
// file's app, link and order tests, three there); the same on an assisted-only one, 9; the number itself kept, 9; the
// places sorted instead of in the group's order, 3 (the order test, two there); a side with no group answering the
// view's numbers, 3 (the empty-side test, two there).
describe("sharedWith — the numbers a view can name on a shared count (engine spec §21.2.4, A22 APP-1)", () => {
  const ALL = new Set<MetricId>(ALL_METRIC_SHAPES.map((shape) => shape.id));
  const without = (...ids: MetricId[]) => new Set<MetricId>([...ALL].filter((id) => !ids.includes(id)));

  it("an app's view names the cost per install on the month's installs, the other places of the group around it", () => {
    expect(sharedWith("acq.signup-rate", "numerator", ALL)).toEqual(["acq.top-channel-share", "app.acq.cpi"]);
    expect(sharedWith("acq.top-channel-share", "denominator", ALL)).toEqual(["acq.signup-rate", "app.acq.cpi"]);
    expect(sharedWith("app.acq.cpi", "denominator", ALL)).toEqual(["acq.signup-rate", "acq.top-channel-share"]);
    expect(sharedWith("app.rev.purchases-per-active", "denominator", ALL)).toEqual(["app.rev.ads-per-active"]);
    expect(sharedWith("app.rev.ads-per-active", "denominator", ALL)).toEqual(["app.rev.purchases-per-active"]);
  });

  it("a SaaS view does not carry the cost per install: its line names the one other number, as it always did", () => {
    const saas = without("app.acq.cpi");
    expect(sharedWith("acq.signup-rate", "numerator", saas)).toEqual(["acq.top-channel-share"]);
    expect(sharedWith("acq.top-channel-share", "denominator", saas)).toEqual(["acq.signup-rate"]);
  });

  it("keeps the link in a SaaS view that carries it: a filter on the setup's shown numbers would take it out", () => {
    // The link is shown in the hybrid only; its props always travel (§21.2.4).
    expect(sharedWith("slg.ref.referred-share", "denominator", without("app.acq.cpi"))).toEqual(["link.pql-handoff"]);
    expect(sharedWith("link.pql-handoff", "denominator", without("app.acq.cpi"))).toEqual(["slg.ref.referred-share"]);
  });

  it("never returns the number itself, nor a place the view cannot name, whatever the view holds", () => {
    expect(sharedWith("act.rate", "denominator", ALL)).not.toContain("act.rate");
    expect(sharedWith("act.rate", "denominator", new Set<MetricId>(["act.rate", "ret.d30", "rev.paid-conversion"]))).toEqual(["ret.d30", "rev.paid-conversion"]);
    expect(sharedWith("act.rate", "denominator", new Set<MetricId>(["act.rate"]))).toEqual([]);
    expect(sharedWith("act.rate", "denominator", new Set<MetricId>())).toEqual([]);
  });

  it("is empty for a side with no group: a number without shared counts, and the side of a shared number that has none", () => {
    expect(sharedWith("act.event", "numerator", ALL)).toEqual([]);
    expect(sharedWith("act.event", "denominator", ALL)).toEqual([]);
    expect(sharedWith("app.ret.active-retention", "numerator", ALL)).toEqual([]);
    expect(sharedWith("app.ret.active-retention", "denominator", ALL)).toEqual([]);
    // ARPA's numerator is the end-of-month MRR; its denominator, the customers, is typed with it alone.
    expect(sharedWith("rev.arpa", "numerator", ALL)).toEqual(["rev.gross-margin"]);
    expect(sharedWith("rev.arpa", "denominator", ALL)).toEqual([]);
  });

  it("lists the places in SHARED_COUNTS' order, whatever the order the view holds its numbers in", () => {
    const backwards = new Set<MetricId>([...ALL].reverse());
    expect(sharedWith("act.rate", "denominator", backwards)).toEqual(["ret.d30", "ref.referred-share", "ref.k-factor", "rev.paid-conversion"]);
    for (const count of Object.keys(SHARED_COUNTS) as (keyof typeof SHARED_COUNTS)[]) {
      const places = SHARED_COUNTS[count].map((slot) => slot.metric);
      const first = SHARED_COUNTS[count][0]!;
      expect(sharedWith(first.metric, first.side, backwards), count).toEqual(places.slice(1));
    }
  });
});
