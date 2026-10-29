import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { EXAMPLE_MKT_WHATIF } from "../example";
import { twelveMonthFactor } from "../impact";
import { buildMktScenario, mktLeverAlone, mktTotalPaths } from "../mkt-scenario";
import { marketplaceStrings, type EngineStrings } from "../strings";
import type { EngineState, Interval, LeverId, MktSide } from "../types";
import { marketplaceNoSubscriptionsState, marketplaceState, withoutTargets } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * The golden of the marketplace — engine spec §22.11.2 (A23 MKT-9).
 *
 * The marketplace's example (§22.10) is the one data set the page shows and every test reads. This file freezes what the
 * engine makes of it, as `golden-consumer.test.ts` freezes the app's: `golden-mkt-inputs.json` holds six states,
 * `golden-mkt.json` what the build derived from them, in French and in English — the whole derived board (both sides and
 * their total), the whole deck (every slide), its text export, and the two sides' scenarios with the total's curves, the
 * « Et si » the state carries. The words are the marketplace's (`marketplaceStrings`, §22.8.1): the neutral set for the
 * bar and the band, each side's for its slides, "services" for the sixth state; the catalogue the marketplace's (§22.4.3).
 *
 * **Both files were written ONCE** (`ENGINE_GOLDEN_MKT_WRITE=1`), after every figure of §22.10.2 was checked against what
 * the code prints (the second block below, which keeps checking them in the written file). Never regenerate them to make
 * this test pass: a difference here is a marketplace that no longer reads the same. A change of words decided by Antoine
 * at a bon à tirer is made on the EXPECTED side, as `golden-projection.ts` does for the SaaS's goldens, never by rewriting
 * the file.
 */

const DIR = join(process.cwd(), "src/lib/engine/__tests__");
const INPUTS = join(DIR, "golden-mkt-inputs.json");
const OUTPUTS = join(DIR, "golden-mkt.json");
const WRITE = process.env.ENGINE_GOLDEN_MKT_WRITE === "1";

/** The six states, built by the marketplace's fixtures. Only called when writing. */
function buildInputs(): Record<string, EngineState> {
  const empty = marketplaceState();
  empty.snapshots[0]!.metrics = {};
  empty.snapshots[0]!.targets = {};
  delete empty.snapshots[0]!.base;
  const services = marketplaceState();
  services.setup = { ...services.setup, offering: "services" };
  return {
    example: marketplaceState(),
    "example-no-targets": withoutTargets(marketplaceState()),
    "example-whatif": { ...marketplaceState(), whatIf: { ...EXAMPLE_MKT_WHATIF } },
    "no-subscriptions": marketplaceNoSubscriptionsState(),
    services,
    empty,
  };
}

function outputsOf(state: EngineState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const offering = state.setup.offering ?? "products";
  for (const [locale, p, ctx] of [["fr", FR, CTX_FR], ["en", EN, CTX_EN]] as const) {
    const forSide = (side: MktSide | null): EngineStrings => marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, side);
    const strings = forSide(null);
    const catalog = p.typeCatalogs[offering === "services" ? "marketplace-services" : "marketplace"];
    const derived = deriveEngine(state, ctx, null, p.bridges, strings.units);
    const deck = buildDeck(state, derived, strings, catalog.metrics, ctx, { derived: catalog.derived, bridges: p.bridges, stringsForSide: forSide });
    const targets = state.whatIf ?? {};
    out[locale] = {
      derived,
      deck,
      markdown: deckMarkdown(deck, strings, forSide),
      scenario: {
        demand: buildMktScenario(state, targets, ctx, "demand"),
        supply: buildMktScenario(state, targets, ctx, "supply"),
        total: mktTotalPaths(state, targets, ctx),
      },
    };
  }
  // A round trip through JSON: `undefined` fields drop out exactly as they do in the file.
  return JSON.parse(JSON.stringify(out)) as Record<string, unknown>;
}

describe("golden marketplace — the marketplace reads the same after the change", () => {
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

  it("covers the six states, each with a French and an English reading", () => {
    expect(existsSync(INPUTS) && existsSync(OUTPUTS)).toBe(true);
    expect(Object.keys(inputs)).toEqual(["example", "example-no-targets", "example-whatif", "no-subscriptions", "services", "empty"]);
    expect(Object.keys(outputs)).toEqual(Object.keys(inputs));
    for (const o of Object.values(outputs)) expect(Object.keys(o)).toEqual(["fr", "en"]);
    // Non-vacuity of the fixture set itself: marketplaces, sellers paying then not, "products" then "services", a state carrying « Et si », one with nothing typed.
    for (const s of Object.values(inputs)) expect(s.setup.type).toBe("marketplace");
    expect(inputs.example!.setup).toMatchObject({ offering: "products", sellerSubscriptions: true, motions: { plg: false, slg: false } });
    expect(inputs["no-subscriptions"]!.setup.sellerSubscriptions).toBe(false);
    expect(inputs.services!.setup.offering).toBe("services");
    expect(inputs["example-whatif"]!.whatIf).toEqual(EXAMPLE_MKT_WHATIF);
    expect(inputs.example!.whatIf).toBeUndefined();
    expect(Object.keys(inputs.empty!.snapshots[0]!.metrics)).toEqual([]);
  });

  for (const name of Object.keys(inputs)) {
    it(`${name}: same board, same slides, same text, to the character`, () => {
      expect(outputsOf(inputs[name]!)).toEqual(outputs[name]);
    });
  }

  it("is not a table of empty things: the example's deck has its slides, a marketplace with nothing typed says it cannot say", () => {
    for (const locale of ["fr", "en"]) {
      const shown = (name: string) => outputs[name]![locale]!.deck.slides.filter((s) => s.present).map((s) => s.id);
      expect(shown("example-whatif")).toEqual([
        "mktTotal",
        "mktFunnelDemand",
        "mktLeakDemand",
        "whatif:mkt.buy.first-order",
        "whatif:mkt.liq.fill-rate",
        "whatif:mkt.rev.take-rate",
        "mktScenarioDemand",
        "mktUnitDemand",
        "mktFunnelSupply",
        "mktLeakSupply",
        "whatif:mkt.sell.paid-conversion",
        "mktUnitSupply",
        "visibility",
        "annex",
        "annex:2",
        "annex:3",
      ]);
      // Without « Et si »: the total, the buyers' three slides, the sellers' three, then the slides every type shares.
      expect(shown("example")).toEqual(["mktTotal", "mktFunnelDemand", "mktLeakDemand", "mktUnitDemand", "mktFunnelSupply", "mktLeakSupply", "mktUnitSupply", "visibility", "annex", "annex:2", "annex:3"]);
      // The sellers pay nothing: no total, and the supply has its funnel alone.
      expect(shown("no-subscriptions").slice(0, 5)).toEqual(["mktFunnelDemand", "mktLeakDemand", "mktUnitDemand", "mktFunnelSupply", "visibility"]);
      const empty = outputs.empty![locale]!.deck.slides.find((s) => s.id === "mktFunnelDemand")!;
      expect(empty.title.key).toBe("mktFunnelEmpty");
    }
  });

  it("reads the words of its offering: « clients » and « prestataires » in the services reading, « acheteurs » and « vendeurs » in the products one", () => {
    const products = outputs.example!.fr!.markdown;
    const services = outputs.services!.fr!.markdown;
    expect(products).toMatch(/acheteurs/);
    expect(services).toMatch(/clients/);
    expect(services).toMatch(/prestataires/);
    expect(services).not.toMatch(/acheteurs/);
    expect(outputs.services!.en!.markdown).toMatch(/providers/);
    expect(outputs.services!.en!.markdown).not.toMatch(/buyers/);
  });
});

/**
 * §22.10.2, row by row, in the written file (MKT-9, before it was written: a figure that did not come out stopped the
 * unit). Everything is measured but the buyers' margin, which is an estimate: its figures are ranges (the buyer's margin,
 * lifetime value, payback and LTV:CAC), every other interval is a point. The pure model's figures are pinned by
 * `mkt-model.test.ts`, the wiring's by `mkt-scenario.test.ts`, `mkt-economics.test.ts`, `diagnose-mkt.test.ts` and
 * `mkt-impact.test.ts`; here, that each figure of the table is in the golden.
 */
interface Reading {
  derived: Derived;
  deck: { slides: { id: string; present: boolean; title: { key: string; values: Record<string, string> }; lines: { row: string; key?: string; text?: string }[] }[] };
  markdown: string;
  scenario: { demand: Scenario; supply: Scenario; total: { today: Interval[] | null; projected: Interval[] | null } };
}
interface Diag {
  state: string;
  basis: string;
  named: string[];
  belowUnpriced: string[];
  positions: Record<string, { position: string; impact?: { mrrPerMonth: Interval } }>;
}
interface Side {
  diagnosis: Diag;
  unit: Record<string, { kind: string; value?: Interval; missing?: string[] }>;
}
type Part = { kind: string; value?: Interval; confidence?: string } | null;
interface Row {
  demand: Part;
  supply: Part;
  total: Part;
}
interface Column {
  metric: string;
  perHundred: Interval | null;
}
interface SideFunnel {
  visitorsPerHundred: Interval | null;
  columns: Column[];
  chain: string;
}
interface Derived {
  coverage: Record<string, number>;
  findings: { kind: string; side?: string; metrics: string[] }[];
  sanity: unknown[];
  motions: [
    {
      motion: string;
      coverage: Record<string, number>;
      funnel: {
        demand: SideFunnel & { referredPerHundred: Interval | null; fill: { kind: string; value?: Interval }; fillVariant: string | null };
        supply: SideFunnel & { churn: { value?: Interval }; paidChurn: { value?: Interval } | null };
      };
      sides: { demand: Side; supply: Side };
      total: { now: Row; newPerMonth: Row; in12Months: Row };
    },
  ];
}
interface Kpis {
  mrr: Interval;
  newMrr: Interval;
  mrr12: Interval;
  revenuePerUnit: Interval;
  gmv: Interval | null;
  cac: Interval;
  ltv: Interval;
  payback: Interval;
  arr: Interval;
  arr12: Interval;
  mrrPath: Interval[];
  ltvCac: Interval;
  lifetime: Interval;
  monthlyMargin: Interval;
  afterPayback: Interval;
  loss: { verdict: string };
  spend: Interval;
  cash: { spend: Interval; tiedUp: Interval; floor: boolean } | null;
  warning: unknown;
}
interface Scenario {
  side: string;
  moved: string[];
  assumptions: string[];
  today: { funnel: { visitors: Interval; signups: Interval; referred: Interval | null; newUnits: Interval }; kpis: Kpis };
  projected: { funnel: { newUnits: Interval }; kpis: Kpis };
}

const point = (i: Interval | null | undefined): number => {
  expect(i, "a known figure").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
};
/** Both bounds of a range, rounded as the spec prints them (to the cent). */
const range = (i: Interval | null | undefined): [number, number] => {
  expect(i, "a known figure").toBeTruthy();
  return [cents(i!.lo), cents(i!.hi)];
};
const cents = (x: number): number => Math.round(x * 100) / 100;
const money = (i: Interval | null | undefined): number => cents(point(i));
const curve = (path: Interval[] | null | undefined): number[] => {
  expect(path, "a 13-point curve").toBeTruthy();
  expect(path).toHaveLength(13);
  return path!.map((p) => Math.round(point(p)));
};
/** The French text with its non-breaking spaces made ordinary: what the spec writes. */
const plain = (text: string | undefined): string => (text ?? "").replace(/[  ]/g, " ");

describe("golden marketplace — every figure of §22.10.2 is in the written file", () => {
  const outputs = WRITE ? null : (JSON.parse(readFileSync(OUTPUTS, "utf8")) as Record<string, Record<string, Reading>>);
  if (!outputs) return;
  const inputs = JSON.parse(readFileSync(INPUTS, "utf8")) as Record<string, EngineState>;
  const example = outputs["example-whatif"]!.fr!;
  const exampleEn = outputs["example-whatif"]!.en!;
  const plainExample = outputs.example!.fr!;
  const motion = example.derived.motions[0];
  const demand = example.scenario.demand;
  const supply = example.scenario.supply;
  const slide = (r: Reading, id: string) => r.deck.slides.find((s) => s.id === id)!;
  /** What one lever alone is worth in twelve months, on the written input (the sliders of the spec's « Chaque levier seul »). */
  const alone = (id: LeverId, value: number): { gain: number; month1: number } => {
    const state = { ...inputs.example!, whatIf: { [id]: value } };
    const s = mktLeverAlone(state, id, CTX_FR)!;
    return { gain: cents(point(s.projected.kpis.mrr12) - point(s.today.kpis.mrr12)), month1: Math.round(point(s.projected.kpis.mrrPath![1])) };
  };

  // --- the demand ------------------------------------------------------------------------------------------------

  it("the buyers' funnel: 2 000 visitors for 100 sign-ups, 8 referred, 20 first orders and 5 second orders, the chain complete, a fill rate of 9 % on searches", () => {
    const f = motion.funnel.demand;
    expect(point(f.visitorsPerHundred)).toBe(2000);
    expect(point(f.referredPerHundred)).toBe(8);
    expect(f.columns.map((c) => [c.metric, point(c.perHundred)])).toEqual([["mkt.buy.first-order", 20], ["mkt.buy.repeat", 5]]);
    expect(f.chain).toBe("complete");
    expect(point(f.fill.value)).toBe(9);
    expect(f.fillVariant).toBe("searches");
    expect(example.deck.slides.find((s) => s.id === "mktFunnelDemand")!.title.key).toBe("mktFunnelComplete");
  });

  it("the money: a = 2,34 € (0,3 × 65 € × 12 %), 32 853,60 € of net revenue a month (394 243,20 € a year), GMV 273 780 € (3 285 360 € a year), 600 new buyers for 1 404 € of new net revenue", () => {
    const t = plainExample.scenario.demand.today;
    const k = t.kpis;
    expect(point(k.revenuePerUnit)).toBeCloseTo(0.3 * 65 * 0.12, 9);
    expect(point(k.revenuePerUnit)).toBeCloseTo(2.34, 9);
    expect(money(k.mrr)).toBe(32_853.6);
    expect(money(k.arr)).toBe(394_243.2);
    expect(point(k.gmv)).toBe(273_780);
    expect(point(k.gmv) * 12).toBe(3_285_360);
    expect(point(t.funnel.newUnits)).toBe(600);
    expect(money(k.newMrr)).toBe(1_404);
    expect(point(t.funnel.newUnits) * point(k.revenuePerUnit)).toBeCloseTo(1_404, 9);
  });

  it("the diagnosis: clear, the fill rate named, in money; 468 € against 351 € (600 × (12/9 − 1) × 2,34 and 600 × (25/20 − 1) × 2,34), the first order outside the group, nothing unpriced", () => {
    const d = motion.sides.demand.diagnosis;
    expect([d.state, d.basis, d.named, d.belowUnpriced]).toEqual(["clear", "mrr", ["mkt.liq.fill-rate"], []]);
    const price = (id: string) => point(d.positions[id]!.impact!.mrrPerMonth);
    expect(price("mkt.liq.fill-rate")).toBeCloseTo(468, 9);
    expect(price("mkt.buy.first-order")).toBeCloseTo(351, 9);
    expect(600 * (12 / 9 - 1) * 2.34).toBeCloseTo(468, 9);
    expect(600 * (25 / 20 - 1) * 2.34).toBeCloseTo(351, 9);
    expect(351 * 1.25).toBe(438.75);
    expect(468).toBeGreaterThan(438.75);
  });

  it("a buyer: 1,287 to 1,521 € of margin a month, 25 months of life, LTV 32,17 to 38,03 € (approximate), payback 19,72 to 23,31 months, LTV:CAC 1,07 to 1,27, 1,69 to 5,28 months of margin after the payback, no loss, no warning", () => {
    const k = plainExample.scenario.demand.today.kpis;
    expect([k.monthlyMargin.lo, k.monthlyMargin.hi].map((x) => Math.round(x * 1000) / 1000)).toEqual([1.287, 1.521]);
    expect(point(k.lifetime)).toBe(25);
    expect(k.ltv.lo).toBeCloseTo(32.175, 9);
    expect(k.ltv.hi).toBeCloseTo(38.025, 9);
    expect(range(k.payback)).toEqual([19.72, 23.31]);
    expect(range(k.ltvCac)).toEqual([1.07, 1.27]);
    expect(range(k.afterPayback)).toEqual([1.69, 5.28]);
    expect(k.loss.verdict).toBe("none");
    expect(k.warning).toBeNull();
    // The derived economics say the same, and say it is approximate (the margin is an estimate of 55 to 65 %).
    const u = motion.sides.demand.unit;
    expect(u.ltv!.value!.lo).toBeCloseTo(32.175, 9);
    expect(range(u.payback!.value)).toEqual([19.72, 23.31]);
    expect(range(u.ltvCac!.value)).toEqual([1.07, 1.27]);
    expect(motion.sides.demand.unit.ltv).toMatchObject({ kind: "known", confidence: "approximate" });
    // 18 000 € ÷ 600 new buyers: the buyer's cost, 30 €, against a margin of 1,287 to 1,521 € a month.
    expect(point(k.cac)).toBe(30);
    expect(30 / 1.521).toBeCloseTo(19.7239, 3);
    expect(30 / 1.287).toBeCloseTo(23.3100, 3);
  });

  it("the cash: 18 000 € spent a month, 177 514,79 to 209 790,21 € tied up, a floor", () => {
    const k = plainExample.scenario.demand.today.kpis;
    expect(point(k.spend)).toBe(18_000);
    expect(point(k.cash!.spend)).toBe(18_000);
    expect(range(k.cash!.tiedUp)).toEqual([177_514.79, 209_790.21]);
    expect(k.cash!.floor).toBe(true);
  });

  it("in twelve months: 33 723,61 € of net revenue (404 683,31 € a year), and the 13-point curve", () => {
    const k = plainExample.scenario.demand.today.kpis;
    expect(money(k.mrr12)).toBe(33_723.61);
    expect(money(k.arr12)).toBe(404_683.31);
    expect(curve(k.mrrPath)).toEqual([32_854, 32_943, 33_030, 33_113, 33_192, 33_268, 33_342, 33_412, 33_479, 33_544, 33_607, 33_666, 33_724]);
  });

  it("the chain of the leak: 600 new buyers a month; at 12 %, 800 (600 × 12/9): +200; × 2,34 € = 468 € of net revenue a month; over a year × 9,68 = 4 531,30 €", () => {
    const lines = slide(plainExample, "mktLeakDemand").lines.filter((l) => l.row === "calc").map((l) => plain(l.text));
    expect(lines[0]).toBe("9 %, soit 600 nouveaux acheteurs par mois");
    expect(lines[2]).toBe("600 × 12/9 = 800 (+200)");
    expect(lines[3]).toMatch(/^2,34 € par acheteur, soit ~470 € de revenu net ajouté chaque mois$/);
    // The page rounds to two figures (C97, ~470 and ~4 500 €); the golden keeps the exact ones: 468 × `twelveMonthFactor(4)`.
    expect(lines[4]).toMatch(/~4 500 €/);
    expect(twelveMonthFactor(4)).toBeCloseTo(9.6823, 4);
    expect(468 * twelveMonthFactor(4)).toBeCloseTo(4_531.3, 1);
    const title = slide(plainExample, "mktLeakDemand").title;
    expect([title.key, title.values.stage, plain(title.values.amount)]).toEqual(["leakClearMrrNew", "le taux de service", "~470 €"]);
  });

  it("the « Et si » (fill rate 12 %, first order 25 %, take rate 13 %): 1 000 new buyers, a' = 2,535 €, 2 535 € new, 46 351,72 € in twelve months (556 220,61 € a year), +12 628,11 €; same spend, so a buyer costs 18 €; LTV 34,86 to 41,19 €, payback 10,92 to 12,91 months, LTV:CAC 1,94 to 2,29", () => {
    const { today, projected, moved } = demand;
    expect(moved).toEqual(["mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.rev.take-rate"]);
    const k = projected.kpis;
    expect(point(projected.funnel.newUnits)).toBeCloseTo(1_000, 9);
    expect(point(k.revenuePerUnit)).toBeCloseTo(2.535, 9);
    expect(money(k.newMrr)).toBe(2_535);
    expect(money(k.mrr12)).toBe(46_351.72);
    expect(money(k.arr12)).toBe(556_220.61);
    expect(cents(point(k.mrr12) - point(today.kpis.mrr12))).toBe(12_628.11);
    expect(point(k.mrr)).toBe(point(today.kpis.mrr));
    expect(point(k.cac)).toBeCloseTo(18, 9);
    expect(range(k.ltv)).toEqual([34.86, 41.19]);
    expect(range(k.payback)).toEqual([10.92, 12.91]);
    expect(range(k.ltvCac)).toEqual([1.94, 2.29]);
  });

  it("the « Et si » curve of the buyers, rounded", () => {
    expect(curve(demand.projected.kpis.mrrPath)).toEqual([32_854, 36_703, 37_770, 38_794, 39_777, 40_721, 41_627, 42_497, 43_332, 44_134, 44_904, 45_642, 46_352]);
  });

  it("each lever on its own: fill rate 4 531,30 €, first order 3 398,47 €, take rate 2 810,30 €; the sum 10 740,07 €, the compound effect +1 888,04 €", () => {
    const state = inputs["example-whatif"]!;
    const gain = (id: LeverId) => {
      const s = mktLeverAlone(state, id, CTX_FR)!;
      return cents(point(s.projected.kpis.mrr12) - point(s.today.kpis.mrr12));
    };
    const fill = gain("mkt.liq.fill-rate");
    const first = gain("mkt.buy.first-order");
    const take = gain("mkt.rev.take-rate");
    expect([fill, first, take]).toEqual([4_531.3, 3_398.47, 2_810.3]);
    expect(cents(fill + first + take)).toBe(10_740.07);
    expect(cents(point(demand.projected.kpis.mrr12) - point(demand.today.kpis.mrr12) - (fill + first + take))).toBe(1_888.04);
    // The fill rate alone is the last line of its chain: the same N, the same a, the same churn (a test of `mkt-impact.test.ts` keeps it).
    expect(fill).toBeCloseTo(468 * twelveMonthFactor(4), 1);
  });

  it("the assumptions the buyers' « Et si » prints, in order", () => {
    expect(demand.assumptions).toEqual(["fill-new-buyers-only", "new-buyer-spends-average", "money-levers-all-buyers", "same-spend", "active-twelve-months", "twelve-months"]);
  });

  // --- the supply ------------------------------------------------------------------------------------------------

  it("the sellers' funnel: 2 000 visitors of the sellers' page for 100 seller sign-ups, 30 first sales and 15 subscribers, the chain complete, churn 3 % (3 % for the paid ones)", () => {
    const f = motion.funnel.supply;
    expect(point(f.visitorsPerHundred)).toBe(2000);
    expect(f.columns.map((c) => [c.metric, point(c.perHundred)])).toEqual([["mkt.sell.first-sale", 30], ["mkt.sell.paid-conversion", 15]]);
    expect(f.chain).toBe("complete");
    expect(point(f.churn.value)).toBe(3);
    expect(point(f.paidChurn!.value)).toBe(3);
  });

  it("the money: 26 100 € of subscriptions a month (313 200 € a year), 60 new paid sellers for 1 740 € of new MRR", () => {
    const t = plainExample.scenario.supply.today;
    expect(money(t.kpis.mrr)).toBe(26_100);
    expect(money(t.kpis.arr)).toBe(313_200);
    expect(point(t.funnel.newUnits)).toBe(60);
    expect(point(t.funnel.visitors)).toBe(8_000);
    expect(money(t.kpis.newMrr)).toBe(1_740);
    expect(point(t.kpis.revenuePerUnit)).toBe(29);
    expect(60 * 29).toBe(1_740);
  });

  it("the diagnosis: clear, the conversion to a paid seller named, in money; 580 € against 130,50 € (60 × (20/15 − 1) × 29 and 900 × 0,5 % × 29), the first sale unpriced (30 % for 40 %)", () => {
    const d = motion.sides.supply.diagnosis;
    expect([d.state, d.basis, d.named, d.belowUnpriced]).toEqual(["clear", "mrr", ["mkt.sell.paid-conversion"], ["mkt.sell.first-sale"]]);
    const price = (id: string) => point(d.positions[id]!.impact!.mrrPerMonth);
    expect(price("mkt.sell.paid-conversion")).toBeCloseTo(580, 9);
    expect(price("mkt.sell.paid-churn")).toBeCloseTo(130.5, 9);
    expect(d.positions["mkt.sell.first-sale"]!.impact).toBeUndefined();
    expect(60 * (20 / 15 - 1) * 29).toBeCloseTo(580, 9);
    expect(900 * 0.005 * 29).toBeCloseTo(130.5, 9);
    expect(130.5 * 1.25).toBe(163.125);
    expect(580).toBeGreaterThan(163.125);
  });

  it("a paid seller: 200 € (100 × 30 ÷ 15), 24,65 € of margin a month, 33,33 months of life, LTV 821,67 €, payback 8,11 months, LTV:CAC 4,11, 25,22 months of margin after the payback, no loss, no warning", () => {
    const k = plainExample.scenario.supply.today.kpis;
    expect(point(k.cac)).toBe(200);
    expect(100 * 30 / 15).toBe(200);
    expect(money(k.monthlyMargin)).toBe(24.65);
    expect(money(k.lifetime)).toBe(33.33);
    expect(money(k.ltv)).toBe(821.67);
    expect(money(k.payback)).toBe(8.11);
    expect(money(k.ltvCac)).toBe(4.11);
    expect(money(k.afterPayback)).toBe(25.22);
    expect(k.loss.verdict).toBe("none");
    expect(k.warning).toBeNull();
    const u = motion.sides.supply.unit;
    expect(money(u.cac!.value)).toBe(200);
    expect(money(u.ltv!.value)).toBe(821.67);
    expect(motion.sides.supply.unit.ltv).toMatchObject({ kind: "known", confidence: "solid" });
  });

  it("the cash: 12 000 € spent a month, 48 681,54 € tied up, a floor", () => {
    const k = plainExample.scenario.supply.today.kpis;
    expect(point(k.spend)).toBe(12_000);
    expect(money(k.cash!.tiedUp)).toBe(48_681.54);
    expect(k.cash!.floor).toBe(true);
  });

  it("in twelve months: 35 866,43 € of subscriptions (430 397,14 € a year), and the 13-point curve", () => {
    const k = plainExample.scenario.supply.today.kpis;
    expect(money(k.mrr12)).toBe(35_866.43);
    expect(money(k.arr12)).toBe(430_397.14);
    expect(curve(k.mrrPath)).toEqual([26_100, 27_057, 27_985, 28_886, 29_759, 30_606, 31_428, 32_225, 32_999, 33_749, 34_476, 35_182, 35_866]);
  });

  it("the chain of the leak: 60 new paid sellers a month; at 20 %, 80 (60 × 20/15): +20; × 29 € = 580 € of new MRR a month; over a year × 10,21 = 5 919,05 €", () => {
    const lines = slide(plainExample, "mktLeakSupply").lines.filter((l) => l.row === "calc").map((l) => plain(l.text));
    expect(lines[0]).toBe("15 %, soit 60 nouveaux vendeurs abonnés par mois");
    expect(lines[2]).toBe("60 × 20/15 = 80 (+20)");
    expect(lines[3]).toMatch(/^29 € par vendeur abonné, soit ~580 € de MRR des abonnements ajouté chaque mois$/);
    expect(lines[4]).toMatch(/~5 900 €/);
    expect(twelveMonthFactor(3)).toBeCloseTo(10.2053, 4);
    expect(580 * twelveMonthFactor(3)).toBeCloseTo(5_919.05, 1);
    const title = slide(plainExample, "mktLeakSupply").title;
    expect([title.key, plain(title.values.amount)]).toEqual(["leakClearMrrNew", "~580 €"]);
  });

  it("the « Et si » (conversion 20 %): 41 785,48 € in twelve months (+5 919,05 €), 2 320 € of new MRR, a paid seller costs 150 €, payback 6,09 months, LTV:CAC 5,48", () => {
    const { today, projected, moved } = supply;
    expect(moved).toEqual(["mkt.sell.paid-conversion"]);
    const k = projected.kpis;
    expect(money(k.mrr12)).toBe(41_785.48);
    expect(cents(point(k.mrr12) - point(today.kpis.mrr12))).toBe(5_919.05);
    expect(money(k.newMrr)).toBe(2_320);
    expect(point(projected.funnel.newUnits)).toBe(80);
    expect(point(k.cac)).toBe(150);
    expect(money(k.payback)).toBe(6.09);
    expect(money(k.ltvCac)).toBe(5.48);
  });

  it("the « Et si » curve of the sellers, rounded", () => {
    expect(curve(supply.projected.kpis.mrrPath)).toEqual([26_100, 27_637, 29_128, 30_574, 31_977, 33_338, 34_657, 35_938, 37_180, 38_384, 39_553, 40_686, 41_785]);
  });

  it("each lever on its own: conversion at 20 % 5 919,05 €, the paid sellers' churn at 2,5 % 1 630,64 €, the price at 35 € 7 420,64 € (32 655 € the first month)", () => {
    expect(alone("mkt.sell.paid-conversion", 20).gain).toBe(5_919.05);
    expect(alone("mkt.sell.paid-churn", 2.5).gain).toBe(1_630.64);
    expect(alone("mkt.sell.arpa", 35)).toEqual({ gain: 7_420.64, month1: 32_655 });
  });

  it("the assumptions the sellers' « Et si » prints, in order", () => {
    expect(supply.assumptions).toEqual(["same-spend", "supply-priced-by-subscriptions", "twelve-months"]);
  });

  // --- the total, the coverage, the checks -----------------------------------------------------------------------

  it("the total: 58 953,60 € this month (32 853,60 € + 26 100 €), 707 443,20 € a year, 3 144 € new a month (1 404 € + 1 740 €), 69 590,04 € in twelve months", () => {
    const t = motion.total;
    expect([money(t.now.demand!.value), money(t.now.supply!.value), money(t.now.total!.value)]).toEqual([32_853.6, 26_100, 58_953.6]);
    expect(cents(point(t.now.total!.value) * 12)).toBe(707_443.2);
    expect([money(t.newPerMonth.demand!.value), money(t.newPerMonth.supply!.value), money(t.newPerMonth.total!.value)]).toEqual([1_404, 1_740, 3_144]);
    expect([money(t.in12Months.demand!.value), money(t.in12Months.supply!.value), money(t.in12Months.total!.value)]).toEqual([33_723.61, 35_866.43, 69_590.04]);
  });

  it("the total with the « Et si » of both sides: 4 855 € new a month (2 535 € + 2 320 €), 88 137,19 € in twelve months", () => {
    expect(money(demand.projected.kpis.newMrr) + money(supply.projected.kpis.newMrr)).toBe(4_855);
    expect(cents(point(demand.projected.kpis.mrr12) + point(supply.projected.kpis.mrr12))).toBe(88_137.19);
    expect(cents(example.scenario.total.projected![12]!.lo)).toBe(88_137.19);
  });

  it("the total's two curves, rounded: today's, and with the « Et si » of both sides", () => {
    expect(curve(example.scenario.total.today)).toEqual([58_954, 60_000, 61_015, 61_998, 62_951, 63_875, 64_770, 65_637, 66_478, 67_293, 68_083, 68_848, 69_590]);
    expect(curve(example.scenario.total.projected)).toEqual([58_954, 64_340, 66_898, 69_368, 71_754, 74_059, 76_285, 78_435, 80_512, 82_518, 84_456, 86_328, 88_137]);
  });

  it("the coverage: 19 numbers, 18 found, 1 approximate (the commissions' margin), none missing, none in progress", () => {
    for (const r of [example, exampleEn]) {
      expect(r.derived.coverage).toMatchObject({ denominator: 19, found: 18, approximate: 1, missing: 0, inProgress: 0 });
      expect(r.derived.motions[0].coverage).toMatchObject({ denominator: 19, found: 18, approximate: 1, missing: 0, inProgress: 0 });
    }
  });

  it("the findings: one below-comparator per side (the fill rate, the conversion to a paid seller), no loss; no sanity check", () => {
    expect(example.derived.findings.map((f) => [f.kind, f.side, f.metrics])).toEqual([
      ["below-comparator", "demand", ["mkt.liq.fill-rate"]],
      ["below-comparator", "supply", ["mkt.sell.paid-conversion"]],
    ]);
    expect(example.derived.sanity).toEqual([]);
  });

  it("an example without targets names no stage on either side", () => {
    const r = outputs["example-no-targets"]!.fr!.derived.motions[0];
    expect(r.sides.demand.diagnosis.named).toEqual([]);
    expect(r.sides.supply.diagnosis.named).toEqual([]);
    expect(outputs["example-no-targets"]!.fr!.derived.findings).toEqual([]);
  });

  // --- the sellers who pay nothing -------------------------------------------------------------------------------

  it("without the subscriptions: 14 numbers (13 found, 1 approximate), the demand as it was, the sellers' funnel in one column without visitors, nothing named on the supply, no cost of a paid seller, the total the net revenue alone", () => {
    const r = outputs["no-subscriptions"]!.fr!;
    const m = r.derived.motions[0];
    expect(r.derived.coverage).toMatchObject({ denominator: 14, found: 13, approximate: 1, missing: 0, inProgress: 0 });
    // The demand does not move: its funnel, its diagnosis and its economics are the example's, to the digit.
    expect(m.sides.demand).toEqual(motion.sides.demand);
    expect(m.funnel.demand).toEqual(motion.funnel.demand);
    expect(money(r.scenario.demand.today.kpis.mrr)).toBe(32_853.6);
    // The supply: the first sale alone, no visitors; one stage has a target, so there is nothing to name; nothing computed on subscriptions.
    expect(m.funnel.supply.visitorsPerHundred).toBeNull();
    expect(m.funnel.supply.columns.map((c) => [c.metric, point(c.perHundred)])).toEqual([["mkt.sell.first-sale", 30]]);
    expect(m.sides.supply.diagnosis).toMatchObject({ state: "not-enough", named: [] });
    for (const id of ["revenuePerMonth", "ltv", "payback", "ltvCac", "cac"]) expect(m.sides.supply.unit[id]).toEqual({ kind: "uncomputable", missing: [] });
    expect(m.funnel.supply.paidChurn).toBeNull();
    // The total is the net revenue alone: 32 853,60 € now, 33 723,61 € in twelve months, and no supply share.
    expect(m.total.now.supply).toBeNull();
    expect([money(m.total.now.total!.value), money(m.total.in12Months.total!.value)]).toEqual([32_853.6, 33_723.61]);
    expect(r.scenario.supply.today.kpis.mrr).toBeNull();
  });
});
