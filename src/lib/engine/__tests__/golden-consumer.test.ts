import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appRankingImpact } from "../app";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { EXAMPLE_CONSUMER_WHATIF } from "../example";
import { leverAloneOf, scenarioOf } from "../scenario-of";
import { mergeStrings } from "../strings";
import type { EngineState, Interval } from "../types";
import { consumerState, consumerUsageOnlyState, withoutTargets } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * The golden of the consumer app — engine spec §21.10.2 (A22 APP-10).
 *
 * The app's example (§21.9) is the one data set the page shows and every test reads. This file freezes what the
 * engine makes of it, as `golden-v2.test.ts` freezes the SaaS's: `golden-consumer-inputs.json` holds five states,
 * `golden-consumer.json` what the build derived from them, in French and in English — the whole derived board, the
 * whole deck (every slide), its text export, and the self-serve scenario with the « Et si » the state carries. The
 * words are the app's (`stringsFor`, §21.8.1), the catalogue the app's (§21.4.7).
 *
 * **Both files were written ONCE** (`ENGINE_GOLDEN_CONSUMER_WRITE=1`), after the figures of §21.9.2 were checked
 * against what the code prints (the second block below, which keeps checking them in the written file). Never
 * regenerate them to make this test pass: a difference here is an app that no longer reads the same. A change of
 * words decided by Antoine at a bon à tirer is made on the EXPECTED side, as `golden-projection.ts` does for the
 * SaaS's goldens, never by rewriting the file.
 */

const DIR = join(process.cwd(), "src/lib/engine/__tests__");
const INPUTS = join(DIR, "golden-consumer-inputs.json");
const OUTPUTS = join(DIR, "golden-consumer.json");
const WRITE = process.env.ENGINE_GOLDEN_CONSUMER_WRITE === "1";

/** The five states, built by the app's fixtures. Only called when writing. */
function buildInputs(): Record<string, EngineState> {
  const empty = consumerState();
  empty.snapshots[0]!.metrics = {};
  empty.snapshots[0]!.targets = {};
  delete empty.snapshots[0]!.base;
  return {
    example: consumerState(),
    "example-no-targets": withoutTargets(consumerState()),
    "example-whatif": { ...consumerState(), whatIf: { ...EXAMPLE_CONSUMER_WHATIF } },
    "usage-only": consumerUsageOnlyState(),
    empty,
  };
}

function outputsOf(state: EngineState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [locale, p, ctx] of [["fr", FR, CTX_FR], ["en", EN, CTX_EN]] as const) {
    const strings = mergeStrings(p.strings, p.typeStrings["consumer-app"]);
    const catalog = p.typeCatalogs["consumer-app"];
    const derived = deriveEngine(state, ctx, null, p.bridges, strings.units);
    const deck = buildDeck(state, derived, strings, catalog.metrics, ctx, { derived: catalog.derived, bridges: p.bridges });
    out[locale] = {
      derived,
      deck,
      markdown: deckMarkdown(deck, strings),
      scenario: scenarioOf(state, state.whatIf ?? {}, ctx),
    };
  }
  // A round trip through JSON: `undefined` fields drop out exactly as they do in the file.
  return JSON.parse(JSON.stringify(out)) as Record<string, unknown>;
}

describe("golden consumer — the app reads the same after the change", () => {
  if (WRITE) {
    it("writes the golden files (once, never to make a test pass)", () => {
      const inputs = buildInputs();
      const outputs = Object.fromEntries(Object.entries(inputs).map(([name, state]) => [name, outputsOf(state)]));
      writeFileSync(INPUTS, `${JSON.stringify(inputs, null, 2)}\n`);
      writeFileSync(OUTPUTS, `${JSON.stringify(outputs, null, 2)}\n`);
    });
    return;
  }

  const inputs = JSON.parse(readFileSync(INPUTS, "utf8")) as Record<string, EngineState>;
  const outputs = JSON.parse(readFileSync(OUTPUTS, "utf8")) as Record<string, Record<string, Reading>>;

  it("covers the five states, each with a French and an English reading", () => {
    expect(existsSync(INPUTS) && existsSync(OUTPUTS)).toBe(true);
    expect(Object.keys(inputs)).toEqual(["example", "example-no-targets", "example-whatif", "usage-only", "empty"]);
    expect(Object.keys(outputs)).toEqual(Object.keys(inputs));
    for (const o of Object.values(outputs)) expect(Object.keys(o)).toEqual(["fr", "en"]);
    // Non-vacuity of the fixture set itself: apps, three streams then two, a state carrying « Et si », one with nothing typed.
    for (const s of Object.values(inputs)) expect(s.setup.type).toBe("consumer-app");
    expect(inputs.example!.setup.monetization).toEqual({ subscriptions: true, purchases: true, ads: true });
    expect(inputs["usage-only"]!.setup.monetization).toEqual({ subscriptions: false, purchases: true, ads: true });
    expect(inputs["example-whatif"]!.whatIf).toEqual(EXAMPLE_CONSUMER_WHATIF);
    expect(inputs.example!.whatIf).toBeUndefined();
    expect(Object.keys(inputs.empty!.snapshots[0]!.metrics)).toEqual([]);
  });

  for (const name of Object.keys(inputs)) {
    it(`${name}: same board, same slides, same text, to the character`, () => {
      expect(outputsOf(inputs[name]!)).toEqual(outputs[name]);
    });
  }

  it("is not a table of empty things: the example's deck has its slides, an app with nothing typed says it cannot say", () => {
    for (const locale of ["fr", "en"]) {
      const ids = outputs["example-whatif"]![locale]!.deck.slides.map((s) => s.id);
      expect(ids).toEqual(["peloton", "leak", "whatif:ret.d30", "whatif:app.rev.commission", "scenario", "visibility", "unit-economics", "mirror", "ask", "annex", "annex:2", "annex:3"]);
      const empty = outputs.empty![locale]!.deck.slides;
      expect(empty.find((s) => s.id === "peloton")!.title.key).toBe("pelotonEmpty");
      expect(empty.find((s) => s.id === "unit-economics")!.title.key).toBe("unitEconomicsUnknown");
    }
  });
});

/**
 * §21.9.2, row by row, in the written file (APP-10, before it was written: a figure that did not come out stopped the
 * unit). Everything is measured, so every interval is a point. The pure model's figures are pinned by
 * `app-model.test.ts`, the wiring's by `app.test.ts`; here, that each figure of the table is in the golden.
 */
interface Reading {
  derived: Derived;
  deck: { slides: { id: string; title: { key: string; values: Record<string, string> } }[] };
  markdown: string;
  scenario: Scenario;
}
interface Derived {
  coverage: Record<string, number>;
  peloton: { visitorsPerHundred: Interval; referredPerHundred: Interval; chain: string; columns: { metric: string; perHundred: Interval }[] };
  diagnosis: { state: string; basis: string; named: string[]; belowUnpriced: string[]; positions: Record<string, { position: string; impact?: { mrrPerMonth: Interval } }> };
  findings: { kind: string; metric?: string }[];
  sanity: unknown[];
  unit: { ltv: { value: Interval }; payback: { kind: string; value?: Interval }; ltvCac: { value: Interval }; grr: { value?: Interval }; nrr: { value?: Interval } };
  app: { value12: { value: Interval }; streams: Record<"now" | "newPerMonth" | "in12Months", Record<"subscriptions" | "usage" | "total", { value: Interval } | null>> };
}
interface Kpis {
  mrr: Interval;
  arr: Interval;
  newMrr: Interval;
  mrr12: Interval;
  arr12: Interval;
  mrrPath: Interval[];
  nrr?: Interval;
  grr?: Interval;
  cac: Interval;
  spend: Interval;
  ltv: Interval;
  ltvCac: Interval;
  payback: Interval | null;
  monthlyMargin: Interval;
  loss: { verdict: string };
  cash: unknown;
  warning: unknown;
  app: { value12: Interval; curve: Interval[]; paybackBeyondCap: boolean };
}
interface Scenario {
  moved: string[];
  assumptions: string[];
  today: { kpis: Kpis };
  projected: { kpis: Kpis; funnel: Record<string, Interval> };
}

const point = (i: Interval | null | undefined): number => {
  expect(i, "a known figure").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
};
const money = (i: Interval | null | undefined): number => Math.round(point(i) * 100) / 100;

describe("golden consumer — every figure of §21.9.2 is in the written file", () => {
  const outputs = WRITE ? null : (JSON.parse(readFileSync(OUTPUTS, "utf8")) as Record<string, Record<string, Reading>>);
  if (!outputs) return;
  const inputs = JSON.parse(readFileSync(INPUTS, "utf8")) as Record<string, EngineState>;
  const example = outputs["example-whatif"]!.fr!;
  const exampleEn = outputs["example-whatif"]!.en!;
  const usage = outputs["usage-only"]!.fr!;

  it("coverage: 21 numbers, 20 found, none approximate or missing, one in progress (asked)", () => {
    for (const r of [example, exampleEn]) expect(r.derived.coverage).toMatchObject({ denominator: 21, found: 20, approximate: 0, missing: 0, inProgress: 1 });
  });

  it("the peloton: ~333 store visitors for 100 installs, 5 referred, 35 activated, 12 at day 30, 3 subscribers, the chain complete, three columns", () => {
    const p = example.derived.peloton;
    expect(point(p.visitorsPerHundred)).toBeCloseTo(333.333, 3);
    expect(point(p.referredPerHundred)).toBe(5);
    expect(p.columns.map((c) => [c.metric, point(c.perHundred)])).toEqual([["act.rate", 35], ["ret.d30", 12], ["rev.paid-conversion", 3]]);
    expect(p.chain).toBe("complete");
    expect(example.deck.slides[0]!.title.key).toBe("pelotonComplete");
  });

  it("the diagnosis: shared, in money, day-30 retention then the paid conversion; 828 € (576 + 252), 768 €, and 210 € outside the group", () => {
    const d = example.derived.diagnosis;
    expect([d.state, d.basis, d.named]).toEqual(["shared", "mrr", ["ret.d30", "rev.paid-conversion"]]);
    const price = (id: string) => point(d.positions[id]!.impact!.mrrPerMonth);
    expect(price("ret.d30")).toBeCloseTo(828, 9);
    expect(price("rev.paid-conversion")).toBeCloseTo(768, 9);
    expect(price("app.ret.active-retention")).toBeCloseTo(210, 9);
    expect(d.positions["app.ret.active-retention"]!.position).toBe("below");
    expect(828).toBeLessThan(768 * 1.25);
    expect(768 * 1.25).toBe(960);
    // The 828 € is the subscriptions' 576 € and the usage's 252 €: the ranking's own split, on the written input.
    const split = appRankingImpact(inputs["example-whatif"]!, "ret.d30", 15, CTX_FR);
    expect(point(split.mrr)).toBeCloseTo(90 * 6.4 + 360 * 0.7, 9);
    expect(90 * 6.4).toBeCloseTo(576, 9);
    expect(360 * 0.7).toBeCloseTo(252, 9);
  });

  it("the findings: one below-comparator for each named stage, no loss; no sanity check", () => {
    expect(example.derived.findings.map((f) => f.kind)).toEqual(["below-comparator", "below-comparator"]);
    expect(example.derived.sanity).toEqual([]);
  });

  it("the money: 39 300 € a month (28 800 € + 10 500 €), 471 600 € a year; 3 312 € new (2 304 € + 1 008 €)", () => {
    const k = example.scenario.today.kpis;
    expect(point(k.mrr)).toBe(39_300);
    expect(point(k.arr)).toBe(471_600);
    const s = example.derived.app.streams;
    expect([point(s.now.subscriptions!.value), point(s.now.usage!.value), point(s.now.total!.value)]).toEqual([28_800, 10_500, 39_300]);
    expect([money(s.newPerMonth.subscriptions!.value), money(s.newPerMonth.usage!.value), money(s.newPerMonth.total!.value)]).toEqual([2_304, 1_008, 3_312]);
    expect(money(k.newMrr)).toBe(3_312);
  });

  it("in twelve months: 42 677,83 € (32 479,21 € + 10 198,62 €), 512 133,93 € a year, and the 13-point curve", () => {
    const k = example.scenario.today.kpis;
    const s = example.derived.app.streams.in12Months;
    expect([money(s.subscriptions!.value), money(s.usage!.value), money(s.total!.value)]).toEqual([32_479.21, 10_198.62, 42_677.83]);
    expect(money(k.mrr12)).toBe(42_677.83);
    expect(money(k.arr12)).toBe(512_133.93);
    expect(k.mrrPath.map((p) => Math.round(point(p)))).toEqual([39_300, 39_690, 40_056, 40_400, 40_722, 41_025, 41_309, 41_575, 41_825, 42_059, 42_279, 42_485, 42_678]);
  });

  it("the subscriptions' retention: GRR 92,5 % and NRR 93,5 % a month, approximate", () => {
    const u = example.derived.unit;
    expect([point(u.grr.value), point(u.nrr.value)]).toEqual([92.5, 93.5]);
  });

  it("an install: 1,50 € for 18 000 € a month; 0,119808 € + 0,060864 € in its first month", () => {
    const k = example.scenario.today.kpis;
    expect(point(k.cac)).toBe(1.5);
    expect(point(k.spend)).toBe(18_000);
    expect(point(k.monthlyMargin)).toBeCloseTo(0.119808 + 0.060864, 9);
    expect(0.119808 + 0.060864).toBeCloseTo(0.180672, 9);
  });

  it("an install's value: 1,4318 € over 12 months, 2,1809 € over 36, 0,95 times its cost in a year", () => {
    const k = example.scenario.today.kpis;
    expect(Math.round(point(example.derived.app.value12.value) * 10_000) / 10_000).toBe(1.4318);
    expect(Math.round(point(k.app.value12) * 10_000) / 10_000).toBe(1.4318);
    expect(Math.round(point(k.ltv) * 10_000) / 10_000).toBe(2.1809);
    expect(Math.round(point(example.derived.unit.ltv.value) * 10_000) / 10_000).toBe(2.1809);
    expect(Math.round(point(k.ltvCac) * 100) / 100).toBe(0.95);
  });

  it("the payback: 13,01 months (13,0132), no loss, no warning, nothing tied up (D11)", () => {
    const k = example.scenario.today.kpis;
    expect(point(k.payback)).toBeCloseTo(13.0132, 4);
    expect(Math.round(point(example.derived.unit.payback.value) * 100) / 100).toBe(13.01);
    expect(k.loss.verdict).toBe("none");
    expect(k.warning).toBeNull();
    expect(k.cash).toBeNull();
    expect(example.deck.slides.find((s) => s.id === "unit-economics")!.title.key).toBe("unitEconomics");
  });

  it("the « Et si » (day 30 at 15 %, commission at 15 %): 49 391,72 € (+6 713,89 €) in twelve months, 4 140 € new, 1,50 € per install, value 1,9195 € / 2,9287 €, ratio 1,28, payback 8,20 months", () => {
    const { today, projected, moved } = example.scenario;
    expect(moved).toEqual(["ret.d30", "app.rev.commission"]);
    const k = projected.kpis;
    expect(money(k.mrr12)).toBe(49_391.72);
    expect(money({ lo: point(k.mrr12) - point(today.kpis.mrr12), hi: point(k.mrr12) - point(today.kpis.mrr12) })).toBe(6_713.89);
    expect(money(k.newMrr)).toBe(4_140);
    expect(point(k.mrr)).toBe(39_300);
    expect(point(k.cac)).toBe(1.5);
    expect(Math.round(point(k.app.value12) * 10_000) / 10_000).toBe(1.9195);
    expect(Math.round(point(k.ltv) * 10_000) / 10_000).toBe(2.9287);
    expect(Math.round(point(k.ltvCac) * 100) / 100).toBe(1.28);
    expect(Math.round(point(k.payback) * 100) / 100).toBe(8.2);
    // The installs don't move: day 30 and the commission don't buy installs.
    expect(point(projected.funnel.signups!)).toBe(12_000);
  });

  it("the « Et si » curve, rounded", () => {
    expect(example.scenario.projected.kpis.mrrPath.map((p) => Math.round(point(p)))).toEqual([39_300, 40_518, 41_649, 42_701, 43_678, 44_586, 45_430, 46_215, 46_946, 47_625, 48_257, 48_845, 49_392]);
  });

  it("each lever on its own: day 30 at 15 % is worth 6 713,89 € in twelve months and pays an install back in 9,07 months; the commission, +0 € and 11,55 months", () => {
    const state = inputs["example-whatif"]!;
    const alone = (id: "ret.d30" | "app.rev.commission") => {
      const s = leverAloneOf(state, id, CTX_FR)!;
      return { gain: money({ lo: point(s.projected.kpis.mrr12) - point(s.today.kpis.mrr12), hi: point(s.projected.kpis.mrr12) - point(s.today.kpis.mrr12) }), payback: Math.round(point(s.projected.kpis.payback) * 100) / 100 };
    };
    expect(alone("ret.d30")).toEqual({ gain: 6_713.89, payback: 9.07 });
    expect(alone("app.rev.commission")).toEqual({ gain: 0, payback: 11.55 });
    expect(example.deck.slides.find((s) => s.id === "whatif:app.rev.commission")!.title.key).toBe("whatIfLeverMargin");
    expect(example.deck.slides.find((s) => s.id === "whatif:ret.d30")!.title.key).toBe("whatIfLever");
  });

  it("the assumptions the « Et si » prints, in order", () => {
    expect(example.scenario.assumptions).toEqual(["d30-drives-paying", "churn-as-revenue", "twelve-months", "actives-follow-d30", "commission-margin-only", "install-months", "usage-twelve-months"]);
  });

  it("the app without subscriptions: 16 numbers (15 found, 1 asked), two columns, a loss over 36 months (0,5949 € for 1,50 €), no payback, no warning, 10 500 € a month, shared between day 30 (252 €) and the actives' retention (210 €)", () => {
    expect(usage.derived.coverage).toMatchObject({ denominator: 16, found: 15, inProgress: 1 });
    expect(usage.derived.peloton.columns.map((c) => [c.metric, point(c.perHundred)])).toEqual([["act.rate", 35], ["ret.d30", 12]]);
    expect(usage.deck.slides[0]).toMatchObject({ id: "peloton", title: { key: "pelotonCompleteTwo" } });
    const k = usage.scenario.today.kpis;
    expect(Math.round(point(k.ltv) * 10_000) / 10_000).toBe(0.5949);
    expect(point(k.cac)).toBe(1.5);
    expect(k.loss.verdict).toBe("loss");
    expect(k.payback).toBeNull();
    expect(k.warning).toBeNull();
    expect(point(k.mrr)).toBe(10_500);
    const d = usage.derived.diagnosis;
    expect([d.state, d.named]).toEqual(["shared", ["ret.d30", "app.ret.active-retention"]]);
    expect(point(d.positions["ret.d30"]!.impact!.mrrPerMonth)).toBeCloseTo(252, 9);
    expect(point(d.positions["app.ret.active-retention"]!.impact!.mrrPerMonth)).toBeCloseTo(210, 9);
    expect(252).toBeLessThan(210 * 1.25);
    expect(210 * 1.25).toBe(262.5);
    // A certain loss moves the unit-economics slide to the second place (C48).
    expect(usage.deck.slides.map((s) => s.id).slice(0, 2)).toEqual(["peloton", "unit-economics"]);
  });

  it("an app with nothing typed prints no figure of the money and no named stage", () => {
    const empty = outputs.empty!.fr!;
    expect(empty.derived.diagnosis.named).toEqual([]);
    expect(empty.derived.coverage).toMatchObject({ found: 0 });
    expect(empty.markdown).not.toMatch(/39 300/);
  });
});
