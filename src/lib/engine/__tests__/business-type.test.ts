import { afterEach, describe, expect, it } from "vitest";
import { BY_PATH, reachable, valueImports } from "@/__tests__/helpers/import-graph";
import { openTypesAtBuild, openTypesWith } from "../access";
import { ALWAYS_OPEN_TYPE, BUSINESS_TYPES, DEFAULT_APP_MONETIZATION, isApp, monetizationOf, motionsAllowed } from "../business-type";
import type { AppMonetization } from "../app-model";

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
 * app tick `slg` in `motionsAllowed` falls its own case (and `io.test.ts`'s refusal); dropping the default of
 * `monetizationOf` falls « the subscriptions-only default » alone.
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
