import { describe, expect, it } from "vitest";
import { consumerState, consumerUsageOnlyState, exampleState, filmState, hybridState, measured, ratio, salesAssistedState, tourResult, withEntry, withMonthBefore, withTarget } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { buildDeck } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import { EXAMPLE_CONSUMER_WHATIF } from "@/lib/engine/example";
import { isApp } from "@/lib/engine/setup-type";
import { mergeStrings } from "@/lib/engine/strings";
import type { DeckModel, EngineState } from "@/lib/engine/types";
import { OPTIONAL_FIELDS, ROW_FIELDS, type RowKind } from "../deck-rows";

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
 * lifetime cap is written only when an LTV exists to be capped; dropping
 * `whatIf` fails it naming kpi, funnelStep, lever and together; dropping
 * `hybrid` and `hybridLinked` (2026-10-01) fails it naming totalBlock, link,
 * sum — the hybrid's own rows; its unit tiles since A20.d T4.d are the
 * single engine's kinds, tagged with their motion (`salesAssisted` still writes the
 * relays); dropping `series` and `seriesApart` (A14 T1) fails it naming
 * evolution and apart; dropping `app` and `appWhatIf` (A22 APP-9) fails it naming value12 — the
 * consumer app's twelve-month value, the tile between its cost and its 36-month value.
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

/**
 * Two levers moved (2026-09-26): each writes its own slide of kpi and
 * funnelStep rows, and two or more write the « scenario » slide, the only
 * one with lever and together rows.
 */
function whatIf(): EngineState {
  return { ...exampleState(), whatIf: { "act.rate": 24, "ret.logo-churn": 1.5 } };
}

/**
 * The two motions (A7.3.c S4): the §18.9 hybrid writes the total, the relays,
 * sales-assisted's leak and the side-by-side unit economics; with its levers
 * moved, sales-assisted's what-if slides; sales-assisted alone, its own
 * unit-economics tiles; the hybrid linked to a Tour, a bridge per motion.
 */
function hybrid(): EngineState {
  return { ...hybridState(), whatIf: { "slg.rev.win-rate": 30, "link.pql-handoff": 40 } };
}
function hybridLinked(): EngineState {
  const s = hybridState();
  s.tourLink = { resultId: RESULT.id, linkedAt: "2026-09-24T09:00:00.000Z" };
  s.deck.include.mirror = true;
  return s;
}
function salesAssisted(): EngineState {
  return withEntry(salesAssistedState(), "slg.rev.gross-margin", measured(ratio(75, 100), { kind: "person", role: "finance" }));
}

/**
 * The monthly series (A14 T1): a second month writes « Ce qui a bougé » —
 * evolution rows when numbers compare, apart rows when nothing does.
 */
function series(): EngineState {
  return withMonthBefore(exampleState(), (july) => void (july.metrics["act.rate"] = measured(ratio(120, 800), { kind: "tool", tool: "amplitude" })));
}
function seriesApart(): EngineState {
  return withMonthBefore(exampleState(), (july) => {
    for (const id of Object.keys(july.metrics) as (keyof typeof july.metrics)[]) delete july.metrics[id];
  });
}

/** Pipeline coverage (A14 T3.2, §19.4): sales-assisted with its open pipeline, a target and a threshold, over two months. */
function pipeline(): EngineState {
  const s = withMonthBefore(salesAssisted(), (july) => void (july.pipelineOpen = 420_000));
  s.setup.pipeline = { quarterTarget: 200_000, threshold: 3 };
  s.snapshots[s.snapshots.length - 1]!.pipelineOpen = 520_000;
  return s;
}

/** A payback of 32 months, past the 30-month floor, and no loss (A20.d T4.c): the unit economics write the warning row. */
function late(): EngineState {
  return withEntry(withEntry(filmState(), "ret.logo-churn", measured(ratio(8, 400), { kind: "tool", tool: "stripe" })), "acq.cac", measured({ kind: "amount", amount: 2_900 }));
}

/**
 * A consumer app (A22 APP-9, §21.7): its deck writes `value12`, the usage stream's chain lines, and with its what-ifs
 * the commission lever's slide; without subscriptions, a peloton of two columns and a loss.
 */
function app(): EngineState {
  return consumerState();
}
function appUsage(): EngineState {
  return consumerUsageOnlyState();
}
function appWhatIf(): EngineState {
  return { ...consumerState(), whatIf: EXAMPLE_CONSUMER_WHATIF };
}

const STATES: Record<string, () => EngineState> = { example: exampleState, linked, filledAsk, teamAsk, margin, whatIf, hybrid, hybridLinked, salesAssisted, series, seriesApart, pipeline, late, app, appUsage, appWhatIf };

function model(state: EngineState, locale: "fr" | "en"): DeckModel {
  const p = props[locale];
  const result = state.tourLink ? RESULT : null;
  // An app reads the copy as the island resolves it: the overlay over the engine's strings, its own catalogue prose.
  const consumer = isApp(state.setup);
  const strings = consumer ? mergeStrings(p.strings, p.typeStrings["consumer-app"]) : p.strings;
  const catalog = consumer ? p.typeCatalogs["consumer-app"] : { metrics: p.metrics, derived: p.derived };
  const derived = deriveEngine(state, p.ctx, result, p.bridges, strings.units);
  return buildDeck(state, derived, strings, catalog.metrics, p.ctx, { derived: catalog.derived, bridges: p.bridges });
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
      const optional = OPTIONAL_FIELDS[kind] ?? [];
      const actual = Object.keys(line).filter((k) => k !== "row" && !optional.includes(k)).sort();
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
