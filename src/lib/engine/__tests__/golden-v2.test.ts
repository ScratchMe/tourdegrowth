import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectPlan } from "@/app/[locale]/aarrr-funnel-template/_engine/collect";
import { listStages } from "@/app/[locale]/aarrr-funnel-template/_engine/number-list";
import type { StoredResult } from "@/lib/quiz/storage";
import { QUESTIONS } from "../../../content/copy-library";
import { motionShapes } from "../catalog-shape";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { migrateToV3 } from "../migrate";
import { buildScenario } from "../scenario";
import { buildSlgScenario } from "../slg-scenario";
import type { EngineState, MetricId } from "../types";
import { currentSnapshot } from "../values";
import { EXAMPLE_TODAY, exampleState, hybridState, salesAssistedState, tourResult } from "./fixtures";
import { asBeforeA20, asBeforeT3, asTabs, deckBeforeA20, withDecidedWords, withoutResume, withoutRetiredWhatIfRows } from "./golden-projection";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * The golden v2 — engine spec §19.13 (A14, T0).
 *
 * The complete engine changes the file again (schemaVersion 3, several
 * engines per device, the monthly series). The promise that goes with it, as
 * with the golden v1 before the sales-assisted motion: **a v2 engine —
 * self-serve, sales-assisted or hybrid — opens without loss and gives, to the
 * character, the same board and the same slides.** This test holds it.
 *
 * `golden-v2-inputs.json` holds six v2 states as a v2 build writes them;
 * `golden-v2.json` what the v2 build derived from them, in French and in
 * English: the whole derived board (both motions and the total), the whole
 * deck (every slide with its motion, the chrome of each motion), its text
 * export, both what-if scenarios, each motion's stage tabs, where the steps
 * resumed (retired with the step-by-step, A18 T3.b: `withoutResume`) and the
 * collection plan.
 *
 * **Both files were written ONCE, by the v2 code, before the first line of
 * T0** (`ENGINE_GOLDEN_V2_WRITE=1`, at commit « golden v2 figé »). Never
 * regenerate them to make this test pass: a difference here is a v2 engine
 * that no longer reads the same. Only `openV2` below may follow the file's
 * next version; what the v2 build printed may not change.
 */

const DIR = join(process.cwd(), "src/lib/engine/__tests__");
const INPUTS = join(DIR, "golden-v2-inputs.json");
const OUTPUTS = join(DIR, "golden-v2.json");
const WRITE = process.env.ENGINE_GOLDEN_V2_WRITE === "1";

interface GoldenInput {
  state: EngineState;
  tour: StoredResult | null;
}

/** The six v2 states, built by the v2 fixtures. Only called when writing. */
function buildInputs(): Record<string, GoldenInput> {
  const tour = tourResult(Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 3) as 0 | 1 | 2])));
  const linked = hybridState();
  linked.whatIf = { "act.rate": 24, "slg.rev.win-rate": 30, "link.pql-handoff": 40 };
  linked.tourLink = { resultId: tour.id, linkedAt: "2026-09-24T09:00:00.000Z" };
  linked.deck.include.mirror = true;
  const selfServeOnly = hybridState();
  const snapshot = selfServeOnly.snapshots[0]!;
  for (const id of Object.keys(snapshot.metrics) as MetricId[]) if (id.startsWith("slg.") || id.startsWith("link.")) delete snapshot.metrics[id];
  delete snapshot.base;
  const slgEmpty = salesAssistedState();
  slgEmpty.snapshots[0]!.metrics = {};
  slgEmpty.snapshots[0]!.targets = {};
  delete slgEmpty.snapshots[0]!.base;
  return {
    "plg-example": { state: exampleState(), tour: null },
    hybrid: { state: hybridState(), tour: null },
    "hybrid-whatif-tour": { state: linked, tour },
    "hybrid-slg-empty": { state: selfServeOnly, tour: null },
    slg: { state: salesAssistedState(), tour: null },
    "slg-empty": { state: slgEmpty, tour: null },
  };
}

function outputsOf(state: EngineState, tour: StoredResult | null) {
  const out: Record<string, unknown> = {};
  for (const [locale, p, ctx] of [["fr", FR, CTX_FR], ["en", EN, CTX_EN]] as const) {
    const derived = deriveEngine(state, ctx, tour, p.bridges, p.strings.units);
    const deck = buildDeck(state, derived, p.strings, p.metrics, ctx, { derived: p.derived, bridges: p.bridges });
    const snapshot = currentSnapshot(state);
    const motions = state.setup.motions;
    out[locale] = {
      derived,
      // The what-if slides' drawings and three rows A20.d T4.b adds, dropped; their markdown written from what remains.
      deck: deckBeforeA20(deck),
      markdown: deckMarkdown(deckBeforeA20(deck), p.strings),
      scenario: motions.plg ? buildScenario(state, state.whatIf ?? {}, ctx) : null,
      slgScenario: motions.slg ? buildSlgScenario(state, state.whatIf ?? {}, ctx) : null,
      tabs: Object.fromEntries(derived.motions.map((m) => [m.motion, asTabs(listStages(snapshot, m.diagnosis, m.motion))])),
      collect: collectPlan(snapshot, EXAMPLE_TODAY, motionShapes(state.setup)),
    };
  }
  // A round trip through JSON: `undefined` fields drop out exactly as they do in the file.
  const json = JSON.parse(JSON.stringify(out)) as Record<string, Record<string, unknown>>;
  // The levers A14 T3 adds to « Et si », and only them, then the money A20 adds (golden-projection.ts): fields added, not a change.
  for (const o of Object.values(json)) {
    asBeforeT3(o.scenario, false);
    asBeforeA20(o.scenario);
    asBeforeT3(o.slgScenario, true);
    asBeforeA20(o.slgScenario);
  }
  return json as unknown;
}

/**
 * The state a v2 file gives today: the v2 state goes through the migration
 * a v3 build applies to a v2 file (`io.ts`) or a v2 store (`storage.ts`).
 * Identity until T0, when the golden was written.
 */
function openV2(v2: EngineState): EngineState {
  const migrated = migrateToV3(v2);
  if (!migrated || migrated.from !== 2) throw new Error("A golden input is not a v2 engine");
  return migrated.state;
}

describe("golden v2 — a v2 engine reads the same after the change", () => {
  if (WRITE) {
    it("writes the golden files (v2 build only, never to make a test pass)", () => {
      const inputs = buildInputs();
      const outputs = Object.fromEntries(Object.entries(inputs).map(([name, i]) => [name, outputsOf(i.state, i.tour)]));
      writeFileSync(INPUTS, `${JSON.stringify(inputs, null, 2)}\n`);
      writeFileSync(OUTPUTS, `${JSON.stringify(outputs, null, 2)}\n`);
    });
    return;
  }

  const inputs = JSON.parse(readFileSync(INPUTS, "utf8")) as Record<string, GoldenInput>;
  const outputs = JSON.parse(readFileSync(OUTPUTS, "utf8")) as Record<string, unknown>;

  it("the projection drops what A14 T3 adds to « Et si », and nothing else: the two levers are there to drop", () => {
    const state = openV2(inputs.hybrid!.state);
    const scenario = JSON.parse(JSON.stringify(buildScenario(state, {}, CTX_FR))) as unknown;
    const slg = JSON.parse(JSON.stringify(buildSlgScenario(state, {}, CTX_FR))) as { today: { opps?: unknown } };
    expect(slg.today.opps).toBeDefined();
    // Day 30 (no value in the hybrid: a lever without a slider), then the referred share of opportunities.
    expect(asBeforeT3(scenario, false) + asBeforeT3(slg, true)).toBe(2);
    expect(slg.today.opps).toBeUndefined();
  });

  it("the projection drops what A20 adds to each motion's figures, and the MRR in twelve months it keeps is the curve's last point", () => {
    const state = openV2(inputs.hybrid!.state);
    const plg = buildScenario(state, {}, CTX_FR);
    const slg = buildSlgScenario(state, {}, CTX_FR);
    // The two curves exist on the hybrid: the projection has something to drop, eleven fields a side (the warning since T1, the spend since T2, the monthly margin since T4.c), today and projected.
    expect(plg.today.kpis.mrrPath?.[12]).toEqual(plg.today.kpis.mrr12);
    expect(slg.today.mrrPath?.[12]).toEqual(slg.today.mrr12);
    const copies = [JSON.parse(JSON.stringify(plg)) as unknown, JSON.parse(JSON.stringify(slg)) as unknown];
    expect(copies.map(asBeforeA20)).toEqual([22, 22]);
    expect(copies.map(asBeforeA20)).toEqual([0, 0]);
  });

  it("the what-if slides' projection (A20.d T4.b): the golden had the two retired rows to drop, a build now has the three added ones", () => {
    type Reading = { deck: { slides: { id: string; lines: Record<string, string>[] }[] }; markdown: string };
    const golden = outputs["hybrid-whatif-tour"] as Record<string, Reading>;
    const projected = withoutRetiredWhatIfRows(golden) as Record<string, Reading>;
    for (const locale of ["fr", "en"]) {
      const whatIf = (r: Reading) => r.deck.slides.filter((x) => x.id.startsWith("whatif:") || x.id.endsWith("scenario"));
      const kpis = (r: Reading) => whatIf(r).flatMap((x) => x.lines.filter((l) => l.row === "kpi").map((l) => l.id));
      // Non-vacuity: the v2 build printed the new MRR and the GRR on its what-if slides, and their markdown lines.
      expect(kpis(golden[locale]!)).toContain("newMrr");
      expect(kpis(projected[locale]!)).not.toContain("newMrr");
      expect(kpis(projected[locale]!)).not.toContain("grr");
      expect(projected[locale]!.markdown.split("\n").length).toBeLessThan(golden[locale]!.markdown.split("\n").length);
    }
    const state = openV2(inputs["hybrid-whatif-tour"]!.state);
    const p = FR;
    const deck = buildDeck(state, deriveEngine(state, CTX_FR, null, p.bridges, p.strings.units), p.strings, p.metrics, CTX_FR, { derived: p.derived, bridges: p.bridges });
    const added = (d: typeof deck) => d.slides.filter((x) => x.id.startsWith("whatif:")).flatMap((x) => x.lines.filter((l) => ["arr12", "ltvCac", "cash"].includes(l.id ?? "")));
    expect(added(deck).length).toBeGreaterThan(0);
    expect(added(deckBeforeA20(deck))).toEqual([]);
    expect(deckBeforeA20(deck).slides.some((x) => "curve" in x || "leverSum" in x)).toBe(false);
  });

  it("the unit economics' projection (A20.d T4.c): the golden had GRR and NRR tiles to drop, a build now has the money rows and the picture", () => {
    type Reading = { deck: { slides: { id: string; lines: Record<string, string>[] }[] }; markdown: string };
    const golden = outputs["plg-example"] as Record<string, Reading>;
    const projected = withoutRetiredWhatIfRows(golden) as Record<string, Reading>;
    const unitRows = (r: Reading) => r.deck.slides.find((x) => x.id === "unit-economics")?.lines.map((l) => l.row) ?? [];
    for (const locale of ["fr", "en"]) {
      // Non-vacuity: the v2 build printed GRR and NRR as two tiles, with their markdown lines.
      expect(unitRows(golden[locale]!)).toEqual(expect.arrayContaining(["grr", "nrr"]));
      expect(unitRows(projected[locale]!)).not.toContain("grr");
      expect(unitRows(projected[locale]!)).not.toContain("nrr");
    }
    for (const name of ["plg-example", "slg"]) {
      const state = openV2(inputs[name]!.state);
      const p = FR;
      const deck = buildDeck(state, deriveEngine(state, CTX_FR, null, p.bridges, p.strings.units), p.strings, p.metrics, CTX_FR, { derived: p.derived, bridges: p.bridges });
      const unit = (d: typeof deck) => d.slides.find((x) => x.id === "unit-economics")!;
      expect(unit(deck).lines.map((l) => l.row)).toEqual(expect.arrayContaining(["after", "cash"]));
      expect(unit(deck).paybackChart).toBeDefined();
      const ratio = unit(deck).lines.find((l) => l.row === "ltvCac")!;
      // The context line only under a known multiple; an unknown one keeps saying what it lacks.
      if (ratio.value) expect(ratio.note).toMatch(/3\u00a0pour 1|3 pour 1/);
      else expect(ratio.note).toMatch(/il manque/);
      const before = unit(deckBeforeA20(deck));
      expect(before.lines.map((l) => l.row)).not.toEqual(expect.arrayContaining(["after"]));
      expect(before.lines.some((l) => ["after", "cash", "retention", "warning", "assume"].includes(l.row ?? ""))).toBe(false);
      expect("paybackChart" in before).toBe(false);
    }
  });

  it("the hybrid's unit economics (A20.d T4.d): the golden had five rows of two cells to drop, a build now has two columns and their pictures", () => {
    type Reading = { deck: { slides: { id: string; lines: Record<string, string>[] }[] }; markdown: string };
    const golden = outputs.hybrid as Record<string, Reading>;
    const projected = withoutRetiredWhatIfRows(golden) as Record<string, Reading>;
    const rows = (r: Reading) => r.deck.slides.find((x) => x.id === "unit-economics")?.lines.map((l) => l.row) ?? [];
    for (const locale of ["fr", "en"]) {
      // Non-vacuity: the v2 build printed the five unitRow rows, and their markdown lines.
      expect(rows(golden[locale]!).filter((r) => r === "unitRow")).toHaveLength(5);
      expect(rows(projected[locale]!)).toEqual(["footer"]);
      expect(projected[locale]!.markdown.split("\n").length).toBe(golden[locale]!.markdown.split("\n").length - 5);
    }
    const state = openV2(inputs.hybrid!.state);
    const p = FR;
    const deck = buildDeck(state, deriveEngine(state, CTX_FR, null, p.bridges, p.strings.units), p.strings, p.metrics, CTX_FR, { derived: p.derived, bridges: p.bridges });
    const unit = (d: typeof deck) => d.slides.find((x) => x.id === "unit-economics")!;
    expect(unit(deck).lines.filter((l) => l.motion).length).toBe(10);
    expect(Object.keys(unit(deck).paybackCharts ?? {})).toEqual(["plg", "slg"]);
    expect(unit(deckBeforeA20(deck)).lines.map((l) => l.row)).toEqual(["footer"]);
    expect("paybackCharts" in unit(deckBeforeA20(deck))).toBe(false);
  });

  it("the decided words (A18.d) rewrite the v2 hybrid's slides, and only where the old words were", () => {
    const before = JSON.stringify(outputs.hybrid);
    const after = JSON.stringify(withDecidedWords(outputs.hybrid));
    // Non-vacuity: the v2 build printed « motion » and the old link sentence, in both languages.
    for (const old of ["Deux motions, deux segments", "Two motions, two segments", "opportunités assistées viennent de comptes", "sales-assisted opportunities come from"]) {
      expect(before).toContain(old);
      expect(after).not.toContain(old);
    }
    expect(after).toContain("Deux moteurs, deux segments");
    expect(after).toContain("opportunités sont venues du libre-service");
    // No word of « motion » is left as a word in what a v2 hybrid now reads (the `motion` keys of the JSON aside).
    expect(after.replace(/"motions?":/g, "").match(/\bmotions?\b/gi) ?? []).toEqual([]);
  });

  it("covers the six v2 states, each with a French and an English reading", () => {
    expect(existsSync(INPUTS) && existsSync(OUTPUTS)).toBe(true);
    expect(Object.keys(inputs).sort()).toEqual(Object.keys(outputs).sort());
    expect(Object.keys(inputs)).toHaveLength(6);
    // Non-vacuity of the fixture set itself: both motions, a total, a linked Tour and an empty motion.
    for (const i of Object.values(inputs)) expect(i.state.schemaVersion as number).toBe(2);
    expect(inputs["hybrid-whatif-tour"]!.tour).not.toBeNull();
    const hybrid = outputs.hybrid as { fr: { derived: { total?: unknown; motions: { motion: string }[] } } };
    expect(hybrid.fr.derived.total).toBeTruthy();
    expect(hybrid.fr.derived.motions.map((m) => m.motion)).toEqual(["plg", "slg"]);
  });

  for (const name of Object.keys(inputs)) {
    it(`${name}: same board, same slides, same text, to the character`, () => {
      const { state, tour } = inputs[name]!;
      // The step-by-step's resume position retired with it (A18 T3.b): dropped from the expected side, the file untouched;
      // and the words Antoine decided at bon à tirer nº9 (A18.d) replace the old ones there (`withDecidedWords`).
      // And the two rows the what-if slides retired for them (A20.d T4.b), dropped from the expected side too.
      expect(outputsOf(openV2(state), tour)).toEqual(withoutRetiredWhatIfRows(withDecidedWords(withoutResume(outputs[name]))));
    });
  }
});
