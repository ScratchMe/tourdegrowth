import { afterEach, describe, expect, it } from "vitest";
import { BY_PATH, FILES, reachable, stripComments, valueImports } from "@/__tests__/helpers/import-graph";
import { GLOSSARY_TERMS } from "@/content/glossary-terms";
import { openTypesAtBuild, openTypesWith } from "../access";
import {
  ALWAYS_OPEN_TYPE,
  BUSINESS_TYPES,
  DEFAULT_APP_MONETIZATION,
  DERIVED_DISPLAY_OVERRIDES,
  DISPLAY_OVERRIDES,
  displayDerivedShapeOf,
  displayShapeOf,
  isApp,
  monetizationOf,
  motionsAllowed,
  setupToolsFor,
} from "../business-type";
import type { AppMonetization } from "../app-model";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, APP_REPLACED, LEVER_IDS, METRIC_SHAPES, derivedShapeOf, shapeOf } from "../catalog-shape";
import { buildScenario, leverAlone } from "../scenario";
import { leverAloneOf, leverIdsOf, scenarioOf } from "../scenario-of";
import { APP_TOOL_FAMILIES, SETUP_TOOLS } from "../tools";
import type { EngineState, LeverId, MetricEntry, PlgMetricId, ToolId } from "../types";
import { exampleState, hybridState, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * The type of business (engine spec §21.1 D1, D7, D8; §21.2.2, §21.3; A22 APP-0): the list of types, the one
 * the build opens by itself, what each may tick, an app's monetization, and the flag that opens the others.
 *
 * Non-vacuity, measured on 2026-10-04 (each sabotage applied alone, the six test files of this unit run, the file
 * restored; the count is the tests that fall): turning `setup-type.ts`'s `import type` into value imports of
 * `app-model` falls two, the leaf guard and the proxy-bundle one (the plain import reaches the catalogue); having
 * `access.ts` read `BUSINESS_TYPES` from `./business-type` falls the proxy-bundle guard alone; listing
 * `"consumer-app"` before `"b2b-saas"` falls seven, every case that holds both; dropping the `trim()` falls
 * « ignores the spaces » alone; dropping `ALWAYS_OPEN_TYPE` from the filter falls seven; renaming the read of
 * `ENGINE_TYPES` in `access.ts` falls « openTypesAtBuild » (and `engine-boundary`'s one-reader rule); letting an
 * app tick `slg` in `motionsAllowed` falls its own case (and `io.test.ts`'s refusal). `monetizationOf`'s own
 * measures, taken after the security review, are at the head of its block below.
 */

describe("openTypesWith — the types a build opens (§21.3)", () => {
  it("is the B2B SaaS alone when the variable is absent, empty or only names nothing known", () => {
    for (const env of [undefined, "", " ", ",", "unknown-type"]) {
      expect(openTypesWith(env), JSON.stringify(env)).toEqual(["b2b-saas"]);
    }
  });

  it("adds each known type the variable lists, and ignores the names it does not know", () => {
    expect(openTypesWith("consumer-app")).toEqual(["b2b-saas", "consumer-app"]);
    expect(openTypesWith("unknown-type,consumer-app")).toEqual(["b2b-saas", "consumer-app"]);
  });

  it("ignores the spaces around a name", () => {
    expect(openTypesWith(" consumer-app ")).toEqual(["b2b-saas", "consumer-app"]);
    expect(openTypesWith("unknown-type , consumer-app ,")).toEqual(["b2b-saas", "consumer-app"]);
  });

  it("lists a type once, however many times it is named — the B2B SaaS included", () => {
    expect(openTypesWith("consumer-app,consumer-app, consumer-app")).toEqual(["b2b-saas", "consumer-app"]);
    expect(openTypesWith("b2b-saas")).toEqual(["b2b-saas"]);
    expect(openTypesWith("b2b-saas,consumer-app,b2b-saas")).toEqual(["b2b-saas", "consumer-app"]);
  });

  it("keeps BUSINESS_TYPES' order, whatever the variable's", () => {
    expect(openTypesWith("consumer-app,b2b-saas")).toEqual(["b2b-saas", "consumer-app"]);
  });

  it("always opens ALWAYS_OPEN_TYPE, and the list of types holds it first", () => {
    expect(ALWAYS_OPEN_TYPE).toBe("b2b-saas");
    expect(BUSINESS_TYPES).toEqual(["b2b-saas", "consumer-app"]);
    for (const env of [undefined, "", "consumer-app", "unknown-type"]) expect(openTypesWith(env)).toContain(ALWAYS_OPEN_TYPE);
  });

  it("returns a list of its own: changing it changes nothing for the next caller", () => {
    const first = openTypesWith("consumer-app");
    first.length = 0;
    expect(openTypesWith("consumer-app")).toEqual(["b2b-saas", "consumer-app"]);
    expect(BUSINESS_TYPES).toHaveLength(2);
  });
});

describe("openTypesAtBuild — the page's reader", () => {
  const ORIGINAL = process.env.ENGINE_TYPES;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ENGINE_TYPES;
    else process.env.ENGINE_TYPES = ORIGINAL;
  });

  it("follows ENGINE_TYPES, read at call time, and is the B2B SaaS alone without it", () => {
    delete process.env.ENGINE_TYPES;
    expect(openTypesAtBuild()).toEqual(["b2b-saas"]);
    process.env.ENGINE_TYPES = "consumer-app";
    expect(openTypesAtBuild()).toEqual(["b2b-saas", "consumer-app"]);
    process.env.ENGINE_TYPES = "unknown-type";
    expect(openTypesAtBuild()).toEqual(["b2b-saas"]);
  });
});

describe("motionsAllowed — what a type may tick (§21.1 D1)", () => {
  it("lets the B2B SaaS tick both motions, and a consumer app self-serve only", () => {
    expect(motionsAllowed("b2b-saas")).toEqual(["plg", "slg"]);
    expect(motionsAllowed("consumer-app")).toEqual(["plg"]);
  });
});

/*
 * Non-vacuity of `monetizationOf`, measured on 2026-10-04 after the security review (the four files that read a
 * monetization run, business-type, merge, validate and io; the file restored each time; the count is the tests
 * that fall). Restoring the old line, `setup.monetization ?? DEFAULT_APP_MONETIZATION`, falls eight of the nine
 * invalid cases: only `null` passes, which the old `??` already turned into the default. Of the new check taken
 * one at a time: dropping the three `typeof … "boolean"` tests falls two (`"yes"` and the two-box object);
 * dropping « at least one true » falls the all-unticked case alone; dropping the `null` guard falls the `null`
 * case alone; answering the default for every valid one falls the « as it is » test and the `toBe` of the existing
 * « own monetization » test; making both defaults `null` falls ten (the nine invalid and the app without the
 * field). Dropping `Array.isArray` falls nothing: an array carries none of the three keys, so the boolean tests
 * already turn it away; the guard is kept because the rule says « not an array », and `[]` and `[true, false,
 * false]` stay in the cases. No test of merge.test.ts, validate.test.ts or io.test.ts depended on the old line.
 */
describe("monetizationOf and isApp", () => {
  const PURCHASES: AppMonetization = { subscriptions: false, purchases: true, ads: true };

  it("is null for a B2B SaaS — even a stray monetization on it: the validator refuses that, this reads the type", () => {
    expect(monetizationOf({ type: "b2b-saas" })).toBeNull();
    expect(monetizationOf({ type: "b2b-saas", monetization: PURCHASES })).toBeNull();
  });

  it("is an app's own monetization, and the subscriptions-only default for an app that has none yet", () => {
    expect(monetizationOf({ type: "consumer-app", monetization: PURCHASES })).toBe(PURCHASES);
    expect(monetizationOf({ type: "consumer-app" })).toBe(DEFAULT_APP_MONETIZATION);
    expect(DEFAULT_APP_MONETIZATION).toEqual({ subscriptions: true, purchases: false, ads: false });
  });

  it("hands back a valid stored monetization as it is, whichever of the three boxes are ticked", () => {
    for (const stored of [
      { subscriptions: true, purchases: false, ads: false },
      { subscriptions: false, purchases: true, ads: false },
      { subscriptions: false, purchases: false, ads: true },
      { subscriptions: true, purchases: true, ads: true },
    ]) {
      expect(monetizationOf({ type: "consumer-app", monetization: stored }), JSON.stringify(stored)).toBe(stored);
    }
  });

  // What a stored app can really carry where the type says AppMonetization (a file opens with its errors, io.ts):
  // the cast is the point of these cases.
  const INVALID: unknown[] = [
    "x",
    [],
    0,
    null,
    { subscriptions: "yes", purchases: false, ads: false },
    { subscriptions: false, purchases: false, ads: false },
    {},
    { subscriptions: true, purchases: false },
    [true, false, false],
  ];
  for (const stored of INVALID) {
    it(`never hands back the invalid stored monetization ${JSON.stringify(stored)}: the default instead`, () => {
      const setup = { type: "consumer-app" as const, monetization: stored as AppMonetization };
      expect(monetizationOf(setup)).toBe(DEFAULT_APP_MONETIZATION);
    });
  }

  it("tells an app from the other types", () => {
    expect(isApp({ type: "consumer-app" })).toBe(true);
    expect(isApp({ type: "b2b-saas" })).toBe(false);
  });
});

describe("the import graph of the type module (§21.2.2)", () => {
  it("setup-type.ts is a leaf: every import it makes is a type import, erased at build", () => {
    const source = BY_PATH.get("lib/engine/setup-type.ts");
    expect(source, "the module exists where the spec puts it").toBeDefined();
    // The walk looked at something: the file does import, by `import type`.
    expect(source!.match(/^import type /gm)?.length).toBeGreaterThanOrEqual(2);
    expect(valueImports(source!)).toEqual([]);
  });

  it("access.ts, which the Edge proxy imports, reaches neither business-type.ts nor the catalogue of shapes", () => {
    const graph = reachable("lib/engine/access.ts");
    // The walk looked at something: it follows the one value import `access.ts` makes.
    expect(graph.has("lib/engine/setup-type.ts")).toBe(true);
    expect(graph.has("lib/engine/business-type.ts")).toBe(false);
    expect(graph.has("lib/engine/catalog-shape.ts")).toBe(false);
  });
});

/**
 * The display layer (engine spec §21.1 D6, D14; §21.2.2; §21.4.3; A22 APP-2): what a screen or the deck shows of a number's
 * shape depends on the engine's type. The SaaS shape objects are never touched; an app gets `{ ...shape, ...override }`.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, the unit's test files run, then restored; the count
 * is the tests that fall): `displayShapeOf` copying the object for a SaaS (`{ ...shape }`) falls « the same reference »
 * alone (1); dropping `benchmark: undefined` from `ret.logo-churn` falls 3 (the removals, the addition's list of
 * references, and the consumer catalogue's caveat rule); a `ret.d30` override without its benchmark, 3; `displayShapeOf`
 * ignoring the override, 5; a read of `.sources` added to `EngineWorkbench.tsx`, the guard alone (1). The `glossary`
 * column of §21.4.3 is, for all fifteen numbers, the term the SaaS shape already names: reading the SaaS shape's
 * `glossary` instead of the displayed one falls nothing, and no test can tell the two reads apart today.
 */
describe("displayShapeOf / displayDerivedShapeOf — the shape as the type shows it (§21.4.3)", () => {
  /** §21.4.3, line for line: the number, its sources in order, what its reference does, its glossary term. */
  const TABLE: readonly (readonly [PlgMetricId, readonly ToolId[], "removed" | "added" | "kept" | "none", string])[] = [
    ["acq.signup-rate", ["app-store-connect", "play-console", "appsflyer"], "removed", "acquisition"],
    ["acq.top-channel-share", ["app-store-connect", "play-console", "appsflyer", "adjust"], "none", "acquisition"],
    ["act.event", [], "none", "aha-moment"],
    ["act.rate", ["ga4", "amplitude", "mixpanel"], "removed", "activation"],
    ["act.ttv", ["ga4", "amplitude", "mixpanel"], "none", "time-to-value"],
    ["ret.d30", ["ga4", "amplitude", "mixpanel"], "added", "retention"],
    ["ret.logo-churn", ["revenuecat", "stripe"], "removed", "churn"],
    ["ret.churn-cause", ["revenuecat", "product-db"], "none", "churn"],
    ["ref.mechanism", [], "none", "referral"],
    ["ref.referred-share", ["product-db", "appsflyer", "adjust"], "none", "referral"],
    ["ref.k-factor", ["product-db", "amplitude", "mixpanel"], "kept", "viral-coefficient"],
    ["rev.paid-conversion", ["revenuecat", "product-db"], "none", "revenue"],
    ["rev.arpa", ["revenuecat", "stripe"], "none", "arpu"],
    ["rev.expansion", ["revenuecat", "stripe"], "none", "nrr-grr"],
    ["rev.contraction", ["revenuecat", "stripe"], "none", "nrr-grr"],
  ];

  it("pins the table: the fifteen the app keeps, none of the two it replaces", () => {
    expect(TABLE.map(([id]) => id)).toEqual(METRIC_SHAPES.map((s) => s.id).filter((id) => !APP_REPLACED.includes(id)));
    expect(Object.keys(DISPLAY_OVERRIDES["consumer-app"])).toEqual(TABLE.map(([id]) => id));
  });

  it("is the SAME object as shapeOf for a b2b-saas — every number, every figure — and for any app number of the app's own", () => {
    for (const shape of ALL_METRIC_SHAPES) expect(displayShapeOf(shape.id, "b2b-saas"), shape.id).toBe(shapeOf(shape.id));
    for (const shape of ALL_DERIVED_SHAPES) expect(displayDerivedShapeOf(shape.id, "b2b-saas"), shape.id).toBe(derivedShapeOf(shape.id));
    const own = ALL_METRIC_SHAPES.filter((s) => s.id.startsWith("app."));
    expect(own).toHaveLength(6);
    for (const shape of own) expect(displayShapeOf(shape.id, "consumer-app"), shape.id).toBe(shapeOf(shape.id));
  });

  it("shows an app the sources and the glossary term of the table, in the table's order, and changes nothing else", () => {
    for (const [id, sources, , glossary] of TABLE) {
      const shown = displayShapeOf(id, "consumer-app");
      const base = shapeOf(id);
      expect(shown.sources, id).toEqual(sources);
      expect(shown.glossary, id).toBe(glossary);
      expect(shown, id).not.toBe(base);
      // Every other field is the SaaS shape's own value: the calculation reads the same shape either way.
      for (const key of Object.keys(base) as (keyof typeof base)[]) {
        if (key === "sources" || key === "glossary" || key === "benchmark") continue;
        expect(shown[key], `${id}.${key}`).toEqual(base[key]);
      }
    }
  });

  it("removes the three references that hold for a SaaS only, explicitly in the override, and the SaaS shape keeps them", () => {
    const removed = TABLE.filter(([, , reference]) => reference === "removed").map(([id]) => id);
    expect(removed).toEqual(["acq.signup-rate", "act.rate", "ret.logo-churn"]);
    for (const id of removed) {
      expect(shapeOf(id).benchmark, `${id} (SaaS)`).toBeDefined();
      expect(displayShapeOf(id, "consumer-app").benchmark, id).toBeUndefined();
      // « Removed » is written, not forgotten: the key is there, with no value.
      expect("benchmark" in DISPLAY_OVERRIDES["consumer-app"][id]!, id).toBe(true);
    }
  });

  it("adds the retention's 20-30 % to ret.d30 — the only reference an app gains — and keeps the viral coefficient's", () => {
    expect(shapeOf("ret.d30").benchmark).toBeUndefined();
    expect(displayShapeOf("ret.d30", "consumer-app").benchmark).toEqual({ term: "retention", lo: 20, hi: 30, direction: "higher" });
    expect(displayShapeOf("ref.k-factor", "consumer-app").benchmark).toBe(shapeOf("ref.k-factor").benchmark);
    const shown = TABLE.filter(([id]) => displayShapeOf(id, "consumer-app").benchmark).map(([id]) => id);
    expect(shown).toEqual(["ret.d30", "ref.k-factor"]);
    expect(shown).toEqual(TABLE.filter(([, , reference]) => reference === "added" || reference === "kept").map(([id]) => id));
  });

  it("links every number an app shows to a glossary term that exists", () => {
    for (const [id] of TABLE) expect(GLOSSARY_TERMS[displayShapeOf(id, "consumer-app").glossary], id).toBeDefined();
    for (const id of ["rev.grr", "rev.nrr"] as const) expect(GLOSSARY_TERMS[displayDerivedShapeOf(id, "consumer-app").glossary], id).toBeDefined();
  });

  it("changes no computed figure: the override table is empty, and the figures are the same objects whatever the type", () => {
    expect(DERIVED_DISPLAY_OVERRIDES["consumer-app"]).toEqual({});
    for (const shape of ALL_DERIVED_SHAPES) expect(displayDerivedShapeOf(shape.id, "consumer-app"), shape.id).toBe(derivedShapeOf(shape.id));
  });

  it("offers a SaaS the tools it always did, and an app its own families' tools", () => {
    expect(setupToolsFor("b2b-saas")).toEqual(SETUP_TOOLS);
    expect(setupToolsFor("consumer-app")).toEqual(APP_TOOL_FAMILIES.flatMap((f) => f.tools));
    expect(setupToolsFor("consumer-app")).toContain("revenuecat");
    expect(setupToolsFor("b2b-saas")).not.toContain("revenuecat");
    expect(setupToolsFor("consumer-app")).not.toContain("hubspot");
  });
});

/**
 * Who may read a shape's `benchmark`, `sources` or `glossary` (§21.4.3). The calculation never needs them; the screens
 * and the deck must read them through `displayShapeOf`, or an app would show a SaaS's reference. The scope: the engine's
 * own folders (`lib/engine/`, the page's folder, `components/engine/`), tests aside. The permitted files are named, not
 * their lines: a line that moves breaks nothing. The rest of the site (`UI_STRINGS.benchmark`, the glossary, the Tour) is
 * out of scope on purpose.
 */
describe("every read of a shape's display fields goes through displayShapeOf (§21.4.3)", () => {
  const SCOPE = ["lib/engine/", "app/[locale]/aarrr-funnel-template/", "components/engine/"];
  /** The shapes' own modules and the static page, which shows the SaaS catalogue only: free to read what they hold. */
  const EXEMPT = ["lib/engine/business-type.ts", "lib/engine/catalog-shape.ts", "app/[locale]/aarrr-funnel-template/page.tsx"];
  /** The four other points the spec lists (§21.4.3): each reads a field, and each is made to read the DISPLAYED shape. */
  const POINTS = [
    "app/[locale]/aarrr-funnel-template/_engine/sources.ts",
    "app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx",
    "lib/engine/deck-unit.ts",
    "app/[locale]/aarrr-funnel-template/engine-props.ts",
  ];
  const READ = /\.(benchmark|sources|glossary)\b/;

  it("reads none outside the files the spec names — otherwise a screen would show an app a SaaS's reference", () => {
    const scanned = FILES.filter((f) => SCOPE.some((root) => f.path.startsWith(root)) && !f.path.includes("/__tests__/"));
    // The scan looked at something: it covers the island and the library, and it finds the reads the spec lists.
    expect(scanned.length).toBeGreaterThan(80);
    const readers = scanned.filter((f) => READ.test(stripComments(f.source))).map((f) => f.path);
    for (const path of POINTS) expect(readers, `${path} is a reader the spec lists`).toContain(path);
    expect(readers.filter((path) => !POINTS.includes(path) && !EXEMPT.includes(path))).toEqual([]);
  });
});

/**
 * Who may read the engine's type (engine spec §21.1 D4, §21.10.1 guard 3, A22 APP-4). A calculation or a screen asks
 * `isApp(setup)` or `monetizationOf(setup)`; only the modules that are about the type itself compare it: the leaf
 * that defines it, the display layer, the seam that picks a model, and the three that validate, open and merge a file
 * (plus `migrate.ts` and the example, which build a setup). A comparison anywhere else is a model branching on the
 * type behind the seam's back, and the SaaS goldens would be the last to know.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, this file run, then restored; the count is the
 * tests that fall): `setup.type === "consumer-app"` added to `deck.ts` falls the scan (1), as does `.type !==
 * "consumer-app"` added to `app.ts` (1); taking `scenario-of.ts` out of the list of readers falls it too (1) — which
 * is also the proof that the pattern sees the read that module makes.
 */
describe("who reads the type of an engine (§21.10.1, guard 3)", () => {
  const READERS = [
    "lib/engine/setup-type.ts",
    "lib/engine/business-type.ts",
    "lib/engine/scenario-of.ts",
    "lib/engine/validate.ts",
    "lib/engine/io.ts",
    "lib/engine/merge.ts",
    "lib/engine/migrate.ts",
    "lib/engine/example.ts",
  ];
  /** `setup.type ===` (or `!==`, with `state.setup`, `a.setup`…), and `.type === "consumer-app"` on any object. */
  const READS_THE_TYPE = /\bsetup\??\.type\s*[!=]==|\.type\s*[!=]==\s*["']consumer-app["']|["']consumer-app["']\s*[!=]==\s*[\w.?]*\.type\b/;

  it("is read by the eight modules about the type, and by nothing else in src/", () => {
    const scanned = FILES.filter((f) => !f.path.includes("/__tests__/") && !/\.test\.tsx?$/.test(f.path));
    // The scan looked at something: the whole tree, the eight modules, and the pattern finds the reads it exists for.
    expect(scanned.length).toBeGreaterThan(300);
    for (const path of READERS) expect(BY_PATH.get(path), `${path} exists where the spec puts it`).toBeDefined();
    for (const path of ["lib/engine/setup-type.ts", "lib/engine/scenario-of.ts", "lib/engine/validate.ts"]) {
      expect(READS_THE_TYPE.test(stripComments(BY_PATH.get(path)!)), `${path} reads the type, and the pattern sees it`).toBe(true);
    }
    const offenders = scanned.filter((f) => !READERS.includes(f.path) && READS_THE_TYPE.test(stripComments(f.source))).map((f) => f.path);
    expect(offenders, "ask isApp(setup) or monetizationOf(setup) instead").toEqual([]);
  });
});

/**
 * The SaaS does not move by a bit (engine spec §21.10.1, guard 4, A22 APP-4): for the §6.0 example, the §18.9 hybrid
 * and 200 SaaS states drawn at random (a fixed seed: the same 200 on every run), the seam answers exactly what the
 * self-serve engine does — `scenarioOf` is `buildScenario`, `leverAloneOf` is `leverAlone`, `leverIdsOf` is the very
 * `LEVER_IDS` — and never carries the app's key: `toEqual` does not see a key that holds `undefined`, so its absence
 * is asserted with `in`.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, this file, `app.test.ts`, `scenario.test.ts` and
 * the two goldens run, then restored; the count is the tests that fall): `scenarioOf` sending a SaaS to
 * `buildAppScenario` falls the two groups below (2), as does `leverAloneOf` sending it to `appLeverAlone` (2) and
 * `scenarioOf` posting a real `kpis.app` on the SaaS (2); posting `app: undefined` falls them too (2) — through the
 * `in` assertions alone, `toEqual` passing; `leverIdsOf` copying the list (`[...LEVER_IDS]`) falls the two groups and
 * `app.test.ts`'s `toBe` (3). The goldens fall in none of them: nothing calls `scenarioOf` before APP-8 and APP-9
 * move the screens and the deck onto it, so §21.10.4's « golden v2 » column is only reachable from then on. The draw
 * reaches the model: the counts it asserts were 190 states with a lever moved, 108 with a twelve-month projection and
 * 535 single-lever slides on that date.
 */
describe("the SaaS through the seam is the SaaS (§21.10.1, guard 4)", () => {
  /** mulberry32, so the draw is the same on every run. */
  function seeded(seed: number): () => number {
    let a = seed;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const RATES = ["acq.signup-rate", "ref.referred-share", "act.rate", "ret.d30", "rev.paid-conversion", "ret.logo-churn", "rev.contraction", "rev.expansion", "rev.gross-margin"] as const;
  const AT = "2026-09-20T10:00:00.000Z";

  function drawState(rand: () => number): { state: EngineState; targets: Partial<Record<LeverId, number>> } {
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    const ratio = (n: number, d: number): MetricEntry["value"] => ({ kind: "ratio", numerator: n, denominator: d });
    const entry = (value: MetricEntry["value"]): MetricEntry => ({ status: "measured", value, source: { kind: "other" }, updatedAt: AT });
    let state = exampleState();
    const set = (id: PlgMetricId, e: MetricEntry | undefined) => {
      state = withEntry(state, id, e);
    };
    for (const id of RATES) {
      const roll = rand();
      if (roll < 0.15) set(id, undefined);
      else if (roll < 0.25) set(id, { status: "missing", missing: { cause: "not-tracked", repair: "sprint" }, updatedAt: AT });
      else if (roll < 0.5) {
        const low = rand() * 40;
        set(id, { status: "estimated", estimate: { low, high: low + rand() * 20, basis: "team-hunch" }, updatedAt: AT });
      } else if (roll < 0.6) set(id, entry({ kind: "rate", percent: rand() * 50 }));
      else {
        const den = int(100, 40_000);
        set(id, entry(ratio(int(0, Math.floor(den / 2)), den)));
      }
    }
    set("rev.arpa", rand() < 0.2 ? undefined : entry(ratio(int(1_000, 200_000), int(10, 3_000))));
    set("acq.cac", rand() < 0.4 ? undefined : entry(ratio(int(1_000, 100_000), int(5, 500))));
    const targets: Partial<Record<LeverId, number>> = {};
    for (const id of LEVER_IDS) if (rand() < 0.4) targets[id] = id === "rev.arpa" ? Math.round(rand() * 2990 + 10) / 10 : Math.round(rand() * 1000) / 10;
    state.whatIf = { ...targets };
    return { state, targets };
  }

  function expectSame(state: EngineState, targets: Partial<Record<LeverId, number>>) {
    const through = scenarioOf(state, targets, CTX_FR);
    expect(through).toEqual(buildScenario(state, targets, CTX_FR));
    expect("app" in through.today.kpis, "no `app` key on today").toBe(false);
    expect("app" in through.projected.kpis, "no `app` key on the projection").toBe(false);
    for (const id of LEVER_IDS) expect(leverAloneOf(state, id, CTX_FR), id).toEqual(leverAlone(state, id, CTX_FR));
    expect(leverIdsOf(state.setup)).toBe(LEVER_IDS);
    return through;
  }

  it("holds for the §6.0 example and the §18.9 hybrid, with and without what-ifs", () => {
    const targets: Partial<Record<LeverId, number>> = { "act.rate": 24, "ret.logo-churn": 1.5, "rev.arpa": 150, "ret.d30": 40 };
    for (const make of [exampleState, hybridState]) {
      expectSame(make(), {});
      const moved = expectSame({ ...make(), whatIf: targets }, targets);
      expect(moved.moved.length, "the what-ifs move something").toBeGreaterThan(0);
    }
  });

  it("holds for 200 SaaS states drawn at random, and the draw reaches the model", () => {
    const rand = seeded(20_261_005);
    let withMoves = 0;
    let withTwelveMonths = 0;
    let aloneSlides = 0;
    for (let n = 0; n < 200; n++) {
      const { state, targets } = drawState(rand);
      const through = expectSame(state, targets);
      if (through.moved.length > 0) withMoves++;
      if (through.projected.kpis.mrr12 !== null) withTwelveMonths++;
      aloneSlides += LEVER_IDS.filter((id) => leverAloneOf(state, id, CTX_FR) !== null).length;
    }
    // The draw is not a dead letter: many states move a lever, many have the money, and the slides exist.
    expect(withMoves).toBeGreaterThan(150); // 190 on 2026-10-05
    expect(withTwelveMonths).toBeGreaterThan(60); // 108
    expect(aloneSlides).toBeGreaterThan(300); // 535
  });
});
