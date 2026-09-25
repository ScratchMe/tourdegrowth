import { describe, expect, it } from "vitest";
import { exampleState, measured, ratio, tourResult, withEntry, withTarget } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { buildDeck } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import type { DeckModel, EngineState } from "@/lib/engine/types";
import { ROW_FIELDS, type RowKind } from "../deck-rows";

/**
 * The contract between the model and the slides (deck-rows.ts): every record
 * the REAL `buildDeck` writes must be a row the slides know how to read —
 * a known `row` kind, every field of that kind present, every value a
 * string, and nothing else. A slide skips a malformed record rather than
 * drawing blanks (`rowsOf`), so without this test a renamed field upstream
 * would silently drop a line from a slide instead of failing a build.
 *
 * It runs on states chosen to make the model write every kind of row at
 * least once — and asserts that it did: a contract checked on a subset of
 * the kinds would pass while saying nothing about the others.
 *
 * The model is built the way the slide screen builds it — WITH the prose
 * (the computed figures' names, the Tour bridges' answers): without it the
 * unit-economics tiles and the mirror's rows are written with empty labels,
 * which is the blank this contract exists to catch.
 *
 * Non-vacuity, measured: renaming `repair` to `repairCost` in ROW_FIELDS.missing
 * fails "every record matches its kind" in both languages (2 tests, the
 * other 4 pass); dropping `filledAsk` from `STATES` fails "every kind is
 * exercised" in both languages, naming bullet, know and measure — the rows
 * only a written ask produces; dropping `margin` fails it naming cap — the
 * lifetime cap is written only when an LTV exists to be capped.
 */

const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } } as const;
const RESULT = tourResult({ "ret-1": 0, "acq-1": 0, "act-1": 1, "rev-1": 2 });

function linked(): EngineState {
  const s = exampleState();
  s.tourLink = { resultId: RESULT.id, linkedAt: "2026-09-24T09:00:00.000Z" };
  s.deck.include.mirror = true;
  return s;
}

function filledAsk(): EngineState {
  const s = withTarget(exampleState(), "act.rate", 25);
  s.deck.ask = {
    what: "deux sprints produit",
    cost: { kind: "money", amount: 24000 },
    horizon: { year: 2027, quarter: 1 },
    successMetric: "act.rate",
    successTarget: 25,
    bullets: ["refaire l'onboarding", "instrumenter J30"],
    measureFirst: ["ret.d30", "rev.gross-margin"],
  };
  return s;
}

function teamAsk(): EngineState {
  const s = exampleState();
  s.deck.ask = { what: "un sprint", cost: { kind: "team", weeks: 2, people: 3 }, bullets: [], measureFirst: [] };
  return s;
}

/** A gross margin: the LTV becomes computable, and only then is its 36-month cap written. */
function margin(): EngineState {
  return withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), { kind: "tool", tool: "stripe" }));
}

const STATES: Record<string, () => EngineState> = { example: exampleState, linked, filledAsk, teamAsk, margin };

function model(state: EngineState, locale: "fr" | "en"): DeckModel {
  const p = props[locale];
  const result = state.tourLink ? RESULT : null;
  const derived = deriveEngine(state, p.ctx, result, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
}

const KINDS = Object.keys(ROW_FIELDS) as RowKind[];

describe.each(["fr", "en"] as const)("deck rows — %s", (locale) => {
  const records = Object.entries(STATES).flatMap(([name, make]) =>
    model(make(), locale).slides.flatMap((slide) => slide.lines.map((line) => ({ where: `${name}/${slide.id}`, line }))),
  );

  it("every record matches its kind: all its fields, strings, nothing else", () => {
    const wrong = records.flatMap(({ where, line }) => {
      const kind = line.row as RowKind | undefined;
      if (!kind || !(kind in ROW_FIELDS)) return [`${where}: unknown row kind ${String(line.row)}`];
      const expected = [...ROW_FIELDS[kind]].map(String).sort();
      const actual = Object.keys(line).filter((k) => k !== "row").sort();
      const problems: string[] = [];
      if (JSON.stringify(expected) !== JSON.stringify(actual)) problems.push(`${where}: ${kind} has [${actual}] not [${expected}]`);
      for (const [k, v] of Object.entries(line)) if (typeof v !== "string") problems.push(`${where}: ${kind}.${k} is ${typeof v}`);
      return problems;
    });
    expect(wrong).toEqual([]);
  });

  it("every kind is exercised, so the check above covers the whole table", () => {
    const seen = new Set(records.map(({ line }) => line.row));
    expect(KINDS.filter((kind) => !seen.has(kind))).toEqual([]);
  });

  it("no record carries an unfilled template placeholder", () => {
    const leaks = records.filter(({ line }) => Object.values(line).some((v) => /\{[a-zA-Z]+\}/.test(v)));
    expect(leaks.map(({ where, line }) => `${where}: ${JSON.stringify(line)}`)).toEqual([]);
  });
});
