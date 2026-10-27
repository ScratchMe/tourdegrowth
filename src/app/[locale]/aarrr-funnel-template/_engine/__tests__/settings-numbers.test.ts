import { describe, expect, it } from "vitest";
import { CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { consumerState, consumerUsageOnlyState, exampleState, hybridState, marketplaceNoSubscriptionsState, marketplaceState } from "@/lib/engine/__tests__/fixtures";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { mktCandidates } from "@/lib/engine/diagnose";
import { marketplaceStrings, mergeStrings } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import { settingsNumbers, targetGroups } from "../settings-numbers";

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

/**
 * The marketplace's targets and shared counts in the Settings (§22.6.1, A23 MKT-6): two groups of boxes, one per side,
 * each titled, the demand's first, with the candidates `mktCandidates` gives that side; `targetGroups` is what « Cibles »
 * at the start reads too. The SaaS's and the app's groups are as they were.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): the sides listed supply first falls 5 (four here, and the Settings card's markup); both groups built from the demand's candidates 4; a side group untitled 4.
 */
describe("targetGroups and settingsNumbers, a marketplace", () => {
  const words = (state: EngineState, locale: "fr" | "en", offering: "products" | "services" = "products") => {
    const text = locale === "fr" ? FR : EN;
    const services = offering === "services";
    return {
      strings: marketplaceStrings(text.strings, text.typeStrings.marketplace, offering, null),
      metrics: text.typeCatalogs[services ? "marketplace-services" : "marketplace"].metrics,
    };
  };

  it("targetGroups: the SaaS's and the app's by motion as before, the marketplace's by side, demand first", () => {
    expect(targetGroups(exampleState().setup).map((g) => [g.motion, g.side])).toEqual([["plg", undefined]]);
    expect(targetGroups(hybridState().setup).map((g) => [g.motion, g.side])).toEqual([["plg", undefined], ["slg", undefined]]);
    expect(targetGroups(consumerState().setup).map((g) => g.motion)).toEqual(["plg"]);
    const groups = targetGroups(marketplaceState().setup);
    expect(groups.map((g) => [g.motion, g.side])).toEqual([["mkt", "demand"], ["mkt", "supply"]]);
    expect(groups[0]!.ids).toEqual(mktCandidates("demand", marketplaceState().setup));
    expect(groups[1]!.ids).toEqual(mktCandidates("supply", marketplaceState().setup));
  });

  it("the sellers' subscription numbers are target boxes only when the sellers pay, and never in the buyers' group", () => {
    const paid = targetGroups(marketplaceState().setup);
    const unpaid = targetGroups(marketplaceNoSubscriptionsState().setup);
    expect(paid[1]!.ids).toEqual(["mkt.sell.signup-rate", "mkt.sell.first-sale", "mkt.sell.paid-conversion", "mkt.sell.churn", "mkt.sell.paid-churn"]);
    expect(unpaid[1]!.ids).toEqual(["mkt.sell.first-sale", "mkt.sell.churn"]);
    expect(paid[0]!.ids).toEqual(unpaid[0]!.ids);
    expect(paid[0]!.ids.every((id) => id.startsWith("mkt.buy.") || id === "mkt.liq.fill-rate")).toBe(true);
    // No number is in both groups: the two sides never share a box.
    expect(paid[0]!.ids.filter((id) => paid[1]!.ids.includes(id))).toEqual([]);
  });

  it("settingsNumbers: two titled groups, each box labelled by its number, the targets as the example holds them", () => {
    for (const locale of ["fr", "en"] as const) {
      const { strings, metrics } = words(marketplaceState(), locale);
      const view = settingsNumbers(marketplaceState(), metrics, strings, locale, TODAY);
      expect(view.targets.map((g) => [g.motion, g.side])).toEqual([["mkt", "demand"], ["mkt", "supply"]]);
      expect(view.targets.map((g) => g.title)).toEqual([strings.mkt.side.demandTitle, strings.mkt.side.supplyTitle]);
      // The example's five targets (§22.10.1) are in the boxes: the fill rate and the first order on the demand side.
      const boxes = view.targets.flatMap((g) => g.boxes);
      expect(boxes.filter((b) => b.value !== null).map((b) => b.id).sort()).toEqual(Object.keys(marketplaceState().snapshots[0]!.targets).sort());
      for (const box of boxes) {
        expect(box.label.length).toBeGreaterThan(0);
        expect(box.hint.length).toBeGreaterThan(0);
      }
    }
  });

  it("settingsNumbers: the shared counts are the marketplace's six — four with the buyers, the sellers' two only when they pay", () => {
    const { strings, metrics } = words(marketplaceState(), "fr");
    const paid = settingsNumbers(marketplaceState(), metrics, strings, "fr", TODAY);
    expect(paid.shared.map((c) => c.count)).toEqual(expect.arrayContaining(["mktCohortSignups", "mktOrders", "mktSellerCohortSignups"]));
    for (const count of paid.shared) expect(count.label.length, count.count).toBeGreaterThan(0);
    const unpaid = settingsNumbers(marketplaceNoSubscriptionsState(), metrics, strings, "fr", TODAY);
    expect(unpaid.shared.map((c) => c.count)).not.toContain("mktSellerMrrEnd");
    expect(unpaid.shared.map((c) => c.count)).toEqual(expect.arrayContaining(["mktCohortSignups", "mktOrders"]));
  });

  it("in services, the boxes speak services: no buyer, no seller in a label or a title", () => {
    const { strings, metrics } = words(marketplaceState(), "fr", "services");
    const view = settingsNumbers({ ...marketplaceState(), setup: { ...marketplaceState().setup, offering: "services" } }, metrics, strings, "fr", TODAY);
    const text = view.targets.flatMap((g) => [g.title ?? "", ...g.boxes.flatMap((b) => [b.label, b.hint])]).join(" | ");
    expect(text).not.toMatch(/acheteur|vendeur\b|vendeurs/i);
    expect(view.targets[0]!.title).toBe(strings.mkt.side.demandTitle);
    expect(strings.mkt.side.demandTitle).toContain("clients");
  });

  it("the hybrid still titles its two engines, the others none", () => {
    const hybrid = settingsNumbers(hybridState(), FR.metrics, FR.strings, "fr", TODAY);
    expect(hybrid.targets.map((g) => g.title)).toEqual([FR.strings.hybrid.motionName.plg, FR.strings.hybrid.motionName.slg]);
    expect("side" in hybrid.targets[0]!).toBe(false);
    expect(fr(exampleState()).targets.map((g) => g.title)).toEqual([null]);
  });
});
