import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectPlan } from "@/app/[locale]/aarrr-funnel-template/_engine/collect";
import { stageTabs } from "@/app/[locale]/aarrr-funnel-template/_engine/stage-tabs";
import { resumePosition } from "@/app/[locale]/aarrr-funnel-template/_engine/steps-model";
import type { StoredResult } from "@/lib/quiz/storage";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { migrateToV3 } from "../migrate";
import { buildScenario } from "../scenario";
import type { DeckModel, EngineDerived, EngineState, MetricEntry } from "../types";
import { currentSnapshot } from "../values";
import { EXAMPLE_TODAY, emptyState, exampleState, tourResult, withEntry, withoutTargets } from "./fixtures";
import { asBeforeT3 } from "./golden-projection";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { fullState } from "./storage-fixtures";

/**
 * The golden v1 — engine spec §18.3.5, test 1 (A7.3.c, S0).
 *
 * The B2B sales-assisted motion changes the file (schemaVersion 2, `setup.type`
 * + `setup.motions`) and every module learns a `motion`. The promise that goes
 * with it: **a v1 engine (100 % self-serve) opens without loss and gives, to
 * the character, the same board and the same slides.** This test holds it.
 *
 * `golden-v1-inputs.json` holds seven v1 states, as a v1 build wrote them;
 * `golden-v1.json` what the v1 build derived from them, in French and in
 * English: the derived board (coverage, peloton, diagnosis, unit economics,
 * checks, findings, mirror), the deck (every slide's title, lines and notes,
 * the checks, the data pill), its text export, the what-if scenario, the
 * stage tabs, where the steps resume and the collection plan.
 *
 * **Both files were written ONCE, by the v1 code, before the first line of
 * the migration** (`ENGINE_GOLDEN_V1_WRITE=1`, at commit « golden v1 figé »).
 * Never regenerate them to make this test pass: a difference here is a v1
 * engine that no longer reads the same, which is exactly the regression the
 * test exists to catch. Only the PROJECTION below may follow a change of
 * shape (a field that moves, a field that is added): what the v1 build
 * printed may not.
 */

const DIR = join(process.cwd(), "src/lib/engine/__tests__");
const INPUTS = join(DIR, "golden-v1-inputs.json");
const OUTPUTS = join(DIR, "golden-v1.json");
const WRITE = process.env.ENGINE_GOLDEN_V1_WRITE === "1";

interface GoldenInput {
  state: EngineState;
  tour: StoredResult | null;
}

/** The seven v1 states, built by the v1 fixtures. Only called when writing. */
function buildInputs(): Record<string, GoldenInput> {
  const example = exampleState();
  const conflicting: MetricEntry = {
    status: "conflicting",
    conflict: {
      a: { value: { kind: "rate", percent: 18 }, source: { kind: "tool", tool: "amplitude" } },
      b: { value: { kind: "rate", percent: 24 }, source: { kind: "person", role: "product" } },
    },
    updatedAt: "2026-09-20T10:00:00.000Z",
  };
  const half = exampleState();
  for (const id of Object.keys(half.snapshots[0]!.metrics)) {
    if (!id.startsWith("acq.") && !id.startsWith("act.")) delete half.snapshots[0]!.metrics[id as keyof typeof half.snapshots[0]["metrics"]];
  }
  const tour = tourResult({ "acq-1": 0, "acq-3": 1, "act-1": 0, "act-2": 2, "ret-1": 1, "ret-3": 0, "ref-3": 2, "rev-2": 1 });
  const linked = exampleState();
  linked.whatIf = { "act.rate": 24, "rev.arpa": 140 };
  linked.tourLink = { resultId: tour.id, linkedAt: "2026-09-21T10:00:00.000Z" };
  linked.deck.include.mirror = true;
  return {
    example: { state: example, tour: null },
    "example-no-targets": { state: withoutTargets(exampleState()), tour: null },
    "example-whatif-tour": { state: linked, tour },
    "storage-full": { state: fullState(), tour: null },
    empty: { state: emptyState(), tour: null },
    half: { state: half, tour: null },
    conflict: { state: withEntry(exampleState(), "act.rate", conflicting), tour: null },
  };
}

/**
 * What the v1 board and deck showed, field by field. A field added later to
 * `EngineDerived` or `DeckModel` is left out on purpose; a v1 field that
 * moves (the peloton into a motion's column, say) is read from its new place
 * HERE, and nowhere else.
 *
 * Added in S1 and left out: `motions` and `total` on the derived object, and
 * the `motion` each diagnosis, check, finding and mirror row now carries
 * (§18.2.1) — a v1 engine's are all "plg", and the v1 build printed none.
 */
function withoutMotion<T extends { motion?: unknown }>({ motion: _motion, ...rest }: T): Omit<T, "motion"> {
  return rest;
}

function projectDerived(d: EngineDerived) {
  return {
    coverage: d.coverage,
    peloton: d.peloton,
    diagnosis: withoutMotion(d.diagnosis),
    unit: d.unit,
    sanity: d.sanity.map(withoutMotion),
    findings: d.findings.map(withoutMotion),
    mirror: d.mirror && { ...d.mirror, rows: d.mirror.rows.map(withoutMotion) },
  };
}

function projectDeck(m: DeckModel) {
  return {
    slides: m.slides.map((s) => ({ id: s.id, present: s.present, included: s.included, index: s.index, title: s.title, lines: s.lines, notes: s.notes })),
    checks: m.checks.map(withoutMotion),
    dataPill: m.dataPill,
    kicker: m.kicker,
    footer: m.footer,
  };
}

function outputsOf(state: EngineState, tour: StoredResult | null) {
  const out: Record<string, unknown> = {};
  for (const [locale, p, ctx] of [["fr", FR, CTX_FR], ["en", EN, CTX_EN]] as const) {
    const derived = deriveEngine(state, ctx, tour, p.bridges, p.strings.units);
    const deck = buildDeck(state, derived, p.strings, p.metrics, ctx, { derived: p.derived, bridges: p.bridges });
    const snapshot = currentSnapshot(state);
    out[locale] = {
      derived: projectDerived(derived),
      deck: projectDeck(deck),
      markdown: deckMarkdown(deck, p.strings),
      scenario: buildScenario(state, state.whatIf ?? {}, ctx),
      tabs: stageTabs(snapshot, derived.diagnosis),
      resume: resumePosition(snapshot),
      collect: collectPlan(snapshot, EXAMPLE_TODAY),
    };
  }
  // A round trip through JSON: `undefined` fields drop out exactly as they do in the file.
  const json = JSON.parse(JSON.stringify(out)) as Record<string, Record<string, unknown>>;
  // The levers A14 T3 adds to « Et si », and only them (golden-projection.ts): a field added, not a change.
  for (const o of Object.values(json)) {
    asBeforeT3(o.scenario, false);
  }
  return json as unknown;
}

/**
 * The state a v1 file gives today: the v1 state goes through the migration
 * a v1 file (`io.ts`) or a v1 store (`storage.ts`) goes through when this
 * build opens it — `migrateToV2` from S0, `migrateToV3` (v1 → v2 → v3) from
 * A14 T0. Identity until S0, when the golden was written.
 */
function openV1(v1: EngineState): EngineState {
  const migrated = migrateToV3(v1);
  if (!migrated || migrated.from !== 1) throw new Error("A golden input is not a v1 engine");
  return migrated.state;
}

describe("golden v1 — a self-serve engine reads the same after the change", () => {
  if (WRITE) {
    it("writes the golden files (v1 build only, never to make a test pass)", () => {
      const inputs = buildInputs();
      const outputs = Object.fromEntries(Object.entries(inputs).map(([name, i]) => [name, outputsOf(i.state, i.tour)]));
      writeFileSync(INPUTS, `${JSON.stringify(inputs, null, 2)}\n`);
      writeFileSync(OUTPUTS, `${JSON.stringify(outputs, null, 2)}\n`);
    });
    return;
  }

  const inputs = JSON.parse(readFileSync(INPUTS, "utf8")) as Record<string, GoldenInput>;
  const outputs = JSON.parse(readFileSync(OUTPUTS, "utf8")) as Record<string, unknown>;

  it("covers the seven v1 states, each with a French and an English reading", () => {
    expect(existsSync(INPUTS) && existsSync(OUTPUTS)).toBe(true);
    expect(Object.keys(inputs).sort()).toEqual(Object.keys(outputs).sort());
    expect(Object.keys(inputs)).toHaveLength(7);
    // Non-vacuity of the fixture set itself: the golden must hold a named stage, an
    // empty engine, a conflict and a linked Tour, or it guards less than it claims.
    const example = outputs.example as { fr: { derived: { diagnosis: { state: string } } } };
    expect(example.fr.derived.diagnosis.state).toBe("clear");
    expect(inputs["example-whatif-tour"]!.tour).not.toBeNull();
    for (const i of Object.values(inputs)) expect(i.state.schemaVersion as number).toBe(1);
  });

  for (const name of Object.keys(inputs)) {
    it(`${name}: same board, same slides, same text, to the character`, () => {
      const { state, tour } = inputs[name]!;
      expect(outputsOf(openV1(state), tour)).toEqual(outputs[name]);
    });
  }
});
