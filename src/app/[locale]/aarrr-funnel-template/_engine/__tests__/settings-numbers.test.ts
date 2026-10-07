import { describe, expect, it } from "vitest";
import { CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { consumerState, consumerUsageOnlyState, exampleState } from "@/lib/engine/__tests__/fixtures";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { mergeStrings } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import { settingsNumbers } from "../settings-numbers";

/**
 * What the Settings show of the numbers (A18 T3.d), now for an app too (§21.6.2, A22 APP-7): the targets of the
 * candidates its setup offers, the shared counts of the numbers it shows. A SaaS keeps what it had.
 *
 * Non-vacuity, measured on 2026-10-07 (each sabotage alone, this file run, 5 tests, then put back): reading
 * `candidatesOf` again for the targets falls 3, the SaaS test staying green; `shapesOf` of the SaaS's setup for the
 * shown numbers falls 4; `settingsSharedCounts` without the actives' exception (`shared-counts.ts`) falls 2 here and in
 * `shared-counts.test.ts` together.
 */
const TODAY = CTX_FR.today;
const fr = (state: EngineState) => {
  const strings = state.setup.type === "consumer-app" ? mergeStrings(FR.strings, FR.typeStrings["consumer-app"]) : FR.strings;
  const metrics = state.setup.type === "consumer-app" ? FR.typeCatalogs["consumer-app"].metrics : FR.metrics;
  return settingsNumbers(state, metrics, strings, "fr", TODAY);
};

describe("settingsNumbers", () => {
  it("a SaaS: the candidates of its motion, the shared counts it had", () => {
    const view = fr(exampleState());
    expect(view.targets).toHaveLength(1);
    expect(view.targets[0]!.boxes.map((b) => b.id)).toEqual([...candidatesOf("plg")]);
    expect(view.shared.map((c) => c.count)).toEqual(["cohortSignups", "monthSignups"]);
  });

  it("an app with the three ways: the active retention's target after the six, the installs and the actives shared", () => {
    const view = fr(consumerState());
    expect(view.targets).toHaveLength(1);
    expect(view.targets[0]!.title).toBeNull();
    expect(view.targets[0]!.boxes.map((b) => b.id)).toEqual([...candidatesOf("plg"), "app.ret.active-retention"]);
    expect(view.shared.map((c) => c.count)).toEqual(["cohortSignups", "monthSignups", "appActives"]);
    // The active retention's box carries the app's own words, not an empty label.
    const active = view.targets[0]!.boxes.at(-1)!;
    expect(active.label.length).toBeGreaterThan(0);
    expect(active.hint.length).toBeGreaterThan(0);
  });

  it("an app earning from usage alone: no subscription number is a target or a count, the actives are still offered", () => {
    const view = fr(consumerUsageOnlyState());
    const ids = view.targets[0]!.boxes.map((b) => b.id);
    expect(ids).not.toContain("rev.paid-conversion");
    expect(ids).toContain("app.ret.active-retention");
    expect(view.shared.map((c) => c.count)).toContain("appActives");
  });

  it("an app with the purchases alone is offered its actives although one number carries them (§21.6.2)", () => {
    const state = consumerState();
    state.setup = { ...state.setup, monetization: { subscriptions: false, purchases: true, ads: false } };
    const actives = fr(state).shared.find((c) => c.count === "appActives");
    expect(actives).toBeDefined();
    expect(actives!.label.length).toBeGreaterThan(0);
    // The hint names the one number that uses it, in the app's words.
    expect(actives!.hint.length).toBeGreaterThan(0);
  });

  it("speaks English too", () => {
    const state = consumerState();
    const strings = mergeStrings(EN.strings, EN.typeStrings["consumer-app"]);
    const view = settingsNumbers(state, EN.typeCatalogs["consumer-app"].metrics, strings, "en", TODAY);
    expect(view.shared.map((c) => c.count)).toContain("appActives");
    expect(view.targets[0]!.boxes.map((b) => b.id)).toContain("app.ret.active-retention");
  });
});
