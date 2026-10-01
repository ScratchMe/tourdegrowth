import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectPlan } from "@/app/[locale]/aarrr-funnel-template/_engine/collect";
import { stageTabs } from "@/app/[locale]/aarrr-funnel-template/_engine/stage-tabs";
import { resumePosition } from "@/app/[locale]/aarrr-funnel-template/_engine/steps-model";
import type { StoredResult } from "@/lib/quiz/storage";
import { QUESTIONS } from "../../../content/copy-library";
import { motionShapes } from "../catalog-shape";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { buildScenario } from "../scenario";
import { buildSlgScenario } from "../slg-scenario";
import type { EngineState, MetricId } from "../types";
import { currentSnapshot } from "../values";
import { EXAMPLE_TODAY, exampleState, hybridState, salesAssistedState, tourResult } from "./fixtures";
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
 * resume and the collection plan.
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
      deck,
      markdown: deckMarkdown(deck, p.strings),
      scenario: motions.plg ? buildScenario(state, state.whatIf ?? {}, ctx) : null,
      slgScenario: motions.slg ? buildSlgScenario(state, state.whatIf ?? {}, ctx) : null,
      tabs: Object.fromEntries(derived.motions.map((m) => [m.motion, stageTabs(snapshot, m.diagnosis, m.motion)])),
      resume: resumePosition(snapshot, motions),
      collect: collectPlan(snapshot, EXAMPLE_TODAY, motionShapes(motions)),
    };
  }
  // A round trip through JSON: `undefined` fields drop out exactly as they do in the file.
  return JSON.parse(JSON.stringify(out)) as unknown;
}

/**
 * The state a v2 file gives today. Identity until T0 — when the golden was
 * written; from T0 on, the v2 state goes through the migration a v3 build
 * applies to a v2 file or a v2 store.
 */
function openV2(v2: EngineState): EngineState {
  return v2;
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

  it("covers the six v2 states, each with a French and an English reading", () => {
    expect(existsSync(INPUTS) && existsSync(OUTPUTS)).toBe(true);
    expect(Object.keys(inputs).sort()).toEqual(Object.keys(outputs).sort());
    expect(Object.keys(inputs)).toHaveLength(6);
    // Non-vacuity of the fixture set itself: both motions, a total, a linked Tour and an empty motion.
    for (const i of Object.values(inputs)) expect(i.state.schemaVersion).toBe(2);
    expect(inputs["hybrid-whatif-tour"]!.tour).not.toBeNull();
    const hybrid = outputs.hybrid as { fr: { derived: { total?: unknown; motions: { motion: string }[] } } };
    expect(hybrid.fr.derived.total).toBeTruthy();
    expect(hybrid.fr.derived.motions.map((m) => m.motion)).toEqual(["plg", "slg"]);
  });

  for (const name of Object.keys(inputs)) {
    it(`${name}: same board, same slides, same text, to the character`, () => {
      const { state, tour } = inputs[name]!;
      expect(outputsOf(openV2(state), tour)).toEqual(outputs[name]);
    });
  }
});
