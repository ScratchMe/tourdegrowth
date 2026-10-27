import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "@/content/engine-copy";
import { consumerState, exampleState, marketplaceNoSubscriptionsState, marketplaceState } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { marketplaceStrings, mergeStrings } from "@/lib/engine/strings";
import type { BusinessType, EngineState } from "@/lib/engine/types";
import { Setup } from "../Setup";
import { settingsNumbers } from "../settings-numbers";

/**
 * What the Settings card says of the type and of the last way of earning (§21.6.2, A22 APP-7, decided by Antoine on
 * 2026-10-07), pinned on the markup without a DOM; how it looks is checked on screen. The lines a ticked box adds
 * (`streamChanges`) need a click and are tested in `stream-lines.test.ts`.
 *
 * Non-vacuity, measured on 2026-10-07 (each sabotage alone, this file run, 6 tests, then put back): the hint always
 * drawn falls 2 (the SaaS alone, and an app with the SaaS alone open); the hint never drawn falls 1 (another type
 * open); the last box's reason read from `start.appEarnsNone` again falls 1.
 */
const appStrings = mergeStrings(FR.strings, FR.typeStrings["consumer-app"]);
const stringsFor = (type: BusinessType) => (type === "consumer-app" ? appStrings : FR.strings);
const settings = (state: EngineState, openTypes: ComponentProps<typeof Setup>["openTypes"]) => {
  const snapshot = state.snapshots[0]!;
  return renderToStaticMarkup(
    createElement(Setup, {
      strings: stringsFor(state.setup.type),
      stringsFor,
      locale: "fr",
      today: CTX_FR.today,
      tour: null,
      onStart: () => {},
      openTypes,
      initial: { setup: state.setup, referenceMonth: snapshot.referenceMonth, cohortMonth: snapshot.cohortMonth },
    }) as never,
  );
};
const typeTag = (markup: string) => markup.match(/<p[^>]*data-testid="engine-setup-type-fixed"[^>]*>([^<]*)</)?.[1];
const apostrophe = (text: string) => text.replace(/'/g, "&#x27;");
const typeFixed = apostrophe(ENGINE_COPY.setup.typeFixed.fr);

describe("Settings: the type", () => {
  it("with the SaaS alone open, the type is written and no hint promises another", () => {
    const markup = settings(exampleState(), ["b2b-saas"]);
    expect(typeTag(markup)).toBe(FR.strings.setup.types.b2bSaas);
    expect(markup).not.toContain(typeFixed);
  });

  it("with the SaaS alone open, an app (a file imported, say) still reads its type and no hint", () => {
    const markup = settings(consumerState(), ["b2b-saas"]);
    expect(typeTag(markup)).toBe(appStrings.setup.types.consumerApp);
    expect(markup).not.toContain(typeFixed);
  });

  it("with another type open, the hint says the type is fixed", () => {
    const markup = settings(exampleState(), ["b2b-saas", "consumer-app"]);
    expect(typeTag(markup)).toBe(FR.strings.setup.types.b2bSaas);
    expect(markup).toContain(typeFixed);
  });
});

describe("Settings: the last way of earning", () => {
  const lastWay = () => {
    const state = consumerState();
    state.setup = { ...state.setup, monetization: { subscriptions: false, purchases: false, ads: true } };
    return settings(state, ["b2b-saas", "consumer-app"]);
  };

  it("the box left ticked is disabled, and says why in the settings' own words", () => {
    const markup = lastWay();
    expect(markup).toContain(apostrophe(ENGINE_COPY.settings.streamLast.fr));
    expect(markup).not.toContain(apostrophe(ENGINE_COPY.start.appEarnsNone.fr));
    const ads = markup.match(/<input[^>]*data-testid="engine-setup-earns-ads"[^>]*>/)?.[0] ?? "";
    expect(ads).toMatch(/disabled/);
  });

  it("with several ways ticked, none is disabled and no reason is drawn", () => {
    const markup = settings(consumerState(), ["b2b-saas", "consumer-app"]);
    expect(markup).not.toContain(apostrophe(ENGINE_COPY.settings.streamLast.fr));
    for (const stream of ["subscriptions", "purchases", "ads"]) {
      expect(markup.match(new RegExp(`<input[^>]*data-testid="engine-setup-earns-${stream}"[^>]*>`))?.[0] ?? "").not.toMatch(/disabled/);
    }
  });

  it("speaks English too", () => {
    expect(ENGINE_COPY.settings.streamLast.en).toBe("You need at least one way of making money.");
  });
});

/**
 * The Settings card of a marketplace (§22.6.1, A23 MKT-6), pinned on the markup without a DOM: its sides line instead of
 * the motions, its words and its box, its three windows, its cohort matured for the longest of them, its two groups of
 * targets, its type written and not chosen. What a click changes (the sellers' box, a window, the offering) needs a
 * DOM and is the e2e's; `stream-lines.test.ts` and `start.test.ts` hold its logic.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): the cohort field kept to the self-serve motion falls 1; the first window offering 7, 30 and 60 days 1 (a first try, which only asserted the pressed value, fell nothing: the list of offered values is its own test); the card reading the neutral words (no offering) 2; the marketplace's radio always dashed 1; the cohort window read as 30 days 1; the type written as the SaaS's 1. What no test here can see: `start()` refusing a card with no motion for a marketplace (`noMotion`), which a click reaches, and the lines said before a save, which need a state the markup cannot change.
 */
describe("Settings: a marketplace (§22.6.1)", () => {
  const text = { fr: { props: FR, ctx: CTX_FR }, en: { props: EN, ctx: CTX_EN } };
  const mkt = (state: EngineState, locale: "fr" | "en" = "fr", openTypes: ComponentProps<typeof Setup>["openTypes"] = ["b2b-saas", "marketplace"]) => {
    const { props, ctx } = text[locale];
    const snapshot = state.snapshots[0]!;
    const forType = (type: BusinessType, offering?: "products" | "services") =>
      type === "marketplace" ? marketplaceStrings(props.strings, props.typeStrings.marketplace, offering ?? "products", null) : props.strings;
    const strings = forType("marketplace", state.setup.offering);
    const catalog = props.typeCatalogs[state.setup.offering === "services" ? "marketplace-services" : "marketplace"].metrics;
    return renderToStaticMarkup(
      createElement(Setup, {
        strings,
        stringsFor: forType,
        locale,
        today: ctx.today,
        tour: null,
        onStart: () => {},
        openTypes,
        initial: { setup: state.setup, referenceMonth: snapshot.referenceMonth, cohortMonth: snapshot.cohortMonth },
        numbers: settingsNumbers(state, catalog, strings, locale, ctx.today),
      }) as never,
    );
  };
  /** The markup's text, tags as bars, the apostrophe as written and U+00A0 as a plain space (French sets one before `:`, `;`, `?`). */
  const text_ = (markup: string) => markup.replace(/<[^>]+>/g, "|").replace(/&#x27;/g, "'").replaceAll("\u00a0", " ");
  /** The label of the window's segmented control that is pressed. */
  const pressed = (markup: string, testId: string) => {
    const group = markup.match(new RegExp(`data-testid="${testId}">([\\s\\S]*?)</div></div></div>`))?.[1] ?? "";
    return [...group.matchAll(/aria-pressed="true"[^>]*>([^<]*)</g)].map((m) => m[1]!.replaceAll("\u00a0", " "));
  };

  it("writes its type and the hint that it is fixed; has no motions to tick, and says it has two sides instead", () => {
    const markup = mkt(marketplaceState());
    expect(typeTag(markup)).toBe(FR.strings.setup.types.marketplace);
    expect(markup).toContain(typeFixed);
    expect(markup).not.toContain('data-testid="engine-setup-motions"');
    expect(markup).not.toContain('data-testid="engine-motion-plg"');
    expect(markup).not.toContain('data-testid="engine-setup-app-sells"');
    const sides = markup.match(/<p[^>]*data-testid="engine-setup-mkt-sides"[^>]*>([^<]*)</)?.[1];
    expect(sides?.replaceAll("\u00a0", " ")).toBe("Une place de marché a deux côtés : les acheteurs et les vendeurs.");
  });

  it("holds the words it is read in and the sellers' box as the engine has them", () => {
    const paid = mkt(marketplaceState());
    expect(paid).toContain("Ce qu&#x27;elle met en relation");
    const radio = (markup: string, value: string) => markup.match(new RegExp(`<input[^>]*id="[^"]*-offering-${value}"[^>]*>`))?.[0] ?? "";
    expect(radio(paid, "products")).toMatch(/checked=""/);
    expect(radio(paid, "services")).not.toMatch(/checked=""/);
    expect(paid.match(/<input[^>]*data-testid="engine-setup-mkt-subscriptions"[^>]*>/)?.[0] ?? "").toMatch(/checked=""/);
    const unpaid = mkt(marketplaceNoSubscriptionsState());
    expect(unpaid.match(/<input[^>]*data-testid="engine-setup-mkt-subscriptions"[^>]*>/)?.[0] ?? "").not.toMatch(/checked=""/);
    const services = mkt({ ...marketplaceState(), setup: { ...marketplaceState().setup, offering: "services" } });
    expect(radio(services, "services")).toMatch(/checked=""/);
    expect(radio(services, "products")).not.toMatch(/checked=""/);
  });

  it("the three windows offer the values of §22.2.1, in order — 7, 30, 90; 60, 90, 180; 30, 60, 90 days", () => {
    const markup = mkt(marketplaceState());
    const offered = (testId: string) => {
      const group = markup.match(new RegExp(`data-testid="${testId}">([\\s\\S]*?)</div></div></div>`))?.[1] ?? "";
      return [...group.matchAll(/<button[^>]*aria-pressed="(?:true|false)"[^>]*>([^<]*)</g)].map((m) => m[1]!.replaceAll("\u00a0", " "));
    };
    expect(offered("engine-setup-window-first-order")).toEqual(["7 jours", "30 jours", "90 jours"]);
    expect(offered("engine-setup-window-repeat")).toEqual(["60 jours", "90 jours", "180 jours"]);
    expect(offered("engine-setup-window-first-sale")).toEqual(["30 jours", "60 jours", "90 jours"]);
  });

  it("the three windows are the engine's, each pressed; one that is absent (D11) shows its default", () => {
    const written = marketplaceState();
    written.setup = { ...written.setup, firstOrderWindowDays: 7, repeatWindowDays: 180, firstSaleWindowDays: 90 };
    const markup = mkt(written);
    expect(pressed(markup, "engine-setup-window-first-order")).toEqual(["7 jours"]);
    expect(pressed(markup, "engine-setup-window-repeat")).toEqual(["180 jours"]);
    expect(pressed(markup, "engine-setup-window-first-sale")).toEqual(["90 jours"]);
    // A setup that says none (the start card writes none): the defaults of §22.2.1.
    const bare = mkt(marketplaceState());
    expect(pressed(bare, "engine-setup-window-first-order")).toEqual(["30 jours"]);
    expect(pressed(bare, "engine-setup-window-repeat")).toEqual(["90 jours"]);
    expect(pressed(bare, "engine-setup-window-first-sale")).toEqual(["60 jours"]);
    // A window outside its list reads as its default, as `mktSetup` reads it.
    const odd = marketplaceState();
    odd.setup = { ...odd.setup, repeatWindowDays: 45 as never };
    expect(pressed(mkt(odd), "engine-setup-window-repeat")).toEqual(["90 jours"]);
  });

  it("the first window carries the « fenêtre » hint and its « ? », in the marketplace's words", () => {
    const markup = mkt(marketplaceState());
    expect(markup).toContain('data-testid="engine-term-window"');
    expect(text_(markup)).toContain("La fenêtre : le nombre de jours qu'a un acheteur ou un vendeur, depuis son inscription, pour que ça compte.");
  });

  it("follows the cohort matured for the longest window — mai 2026 on 24 September, 90 days — and says so in the hint", () => {
    const markup = mkt(marketplaceState());
    expect(text_(markup)).toContain("On suit les acheteurs et les vendeurs inscrits en mai 2026 : ceux inscrits en juin 2026 n'ont pas encore eu 90 jours.");
    const longer = marketplaceState();
    longer.setup = { ...longer.setup, repeatWindowDays: 180 };
    longer.snapshots[0]!.cohortMonth = "2026-02";
    expect(text_(mkt(longer))).toContain("ceux inscrits en mars 2026 n'ont pas encore eu 180 jours.");
  });

  it("its targets are two titled groups, the demand's first, with a box for each number that side positions", () => {
    const markup = mkt(marketplaceState());
    const demand = markup.indexOf('data-testid="engine-settings-targets-demand"');
    const supply = markup.indexOf('data-testid="engine-settings-targets-supply"');
    expect(demand).toBeGreaterThan(0);
    expect(supply).toBeGreaterThan(demand);
    expect(text_(markup.slice(demand, supply))).toContain("La demande : les acheteurs");
    expect(text_(markup.slice(supply))).toContain("L'offre : les vendeurs");
    expect(markup.slice(demand, supply).match(/data-testid="engine-settings-target-/g)).toHaveLength(6);
    expect(markup.slice(supply).match(/data-testid="engine-settings-target-[a-z-]+"/g)?.length).toBe(5);
    // The sellers' subscription numbers are boxes only when the sellers pay.
    expect(mkt(marketplaceNoSubscriptionsState()).match(/data-testid="engine-settings-target-/g)).toHaveLength(6 + 2);
  });

  it("in services every word of the card is services', in both languages", () => {
    const services = { ...marketplaceState(), setup: { ...marketplaceState().setup, offering: "services" as const } };
    const fr = text_(mkt(services));
    expect(fr).toContain("Une place de marché a deux côtés : les clients et les prestataires.");
    expect(fr).toContain("Première réservation sous");
    expect(fr).toContain("Deuxième réservation sous");
    expect(fr).toContain("Première réservation reçue sous");
    expect(fr).toContain("La demande : les clients");
    expect(fr).toContain("L'offre : les prestataires");
    expect(fr).not.toMatch(/Première commande|Deuxième commande|Première vente|acheteur/);
    const en = text_(mkt(services, "en"));
    expect(en).toContain("A marketplace has two sides: clients and providers.");
    expect(en).toContain("First booking within");
    expect(en).toContain("Second booking within");
    expect(en).toContain("First booking received within");
    expect(en).not.toMatch(/First order|Second order|First sale|buyer/);
  });

  it("speaks English: the sides line, the offering, the box and the windows", () => {
    const en = text_(mkt(marketplaceState(), "en"));
    expect(en).toContain("A marketplace has two sides: buyers and sellers.");
    expect(en).toContain("What it connects");
    expect(en).toContain("Buyers and sellers of products");
    expect(en).toContain("Sellers pay a subscription");
    expect(en).toContain("First order within");
    expect(en).toContain("Second order within");
    expect(en).toContain("First sale within");
    expect(en).toContain("Your marketplace's name");
  });

  it("is the card of the SaaS and of the app, unchanged, when the engine is theirs", () => {
    for (const state of [exampleState(), consumerState()]) {
      const markup = settings(state, ["b2b-saas", "consumer-app", "marketplace"]);
      for (const id of ["engine-setup-mkt-sides", "engine-setup-mkt-subscriptions", "engine-setup-mkt-windows", "engine-setup-window-first-order"]) expect(markup, id).not.toContain(id);
    }
  });
});

/**
 * The type choice of a NEW engine's card (§22.6.1): the marketplace is a choice when the build opens it and dashed otherwise,
 * as the app is; the guard that actually picks is `pickedType` (`start.test.ts`).
 */
describe("the new engine's type choice, the marketplace (§22.6.1)", () => {
  const text_ = (markup: string) => markup.replace(/<[^>]+>/g, "|").replace(/&#x27;/g, "'").replaceAll("\u00a0", " ");
  const card = (openTypes: ComponentProps<typeof Setup>["openTypes"], startType?: BusinessType) =>
    renderToStaticMarkup(
      createElement(Setup, {
        strings: FR.strings,
        stringsFor: (type: BusinessType, offering?: "products" | "services") =>
          type === "marketplace" ? marketplaceStrings(FR.strings, FR.typeStrings.marketplace, offering ?? "products", null) : FR.strings,
        locale: "fr",
        today: CTX_FR.today,
        tour: null,
        onStart: () => {},
        openTypes,
        ...(startType ? { startType } : {}),
      }) as never,
    );
  const marketplaceRadio = (markup: string) => markup.match(/<input[^>]*type="radio"[^>]*value="marketplace"[^>]*>/)?.[0] ?? "";

  it("not open: dashed, with its reason", () => {
    expect(marketplaceRadio(card(["b2b-saas", "consumer-app"]))).toMatch(/disabled/);
    expect(card(["b2b-saas"])).toContain("Plus tard");
  });

  it("open: a radio like the others, and chosen it opens the marketplace's card", () => {
    expect(marketplaceRadio(card(["b2b-saas", "marketplace"]))).not.toMatch(/disabled/);
    const chosen = card(["b2b-saas", "marketplace"], "marketplace");
    expect(marketplaceRadio(chosen)).toMatch(/checked=""/);
    expect(chosen).toContain('data-testid="engine-setup-mkt-sides"');
    expect(chosen).not.toContain('data-testid="engine-setup-motions"');
    // A new card has no targets and no runway yet: those are the Settings'.
    expect(chosen).not.toContain("engine-settings-targets");
  });

  it("the SaaS's boxes, reached from the marketplace's answer on this card, open on self-serve, not on two empty ones", () => {
    const saas = renderToStaticMarkup(
      createElement(Setup, {
        strings: FR.strings,
        locale: "fr",
        today: CTX_FR.today,
        tour: null,
        onStart: () => {},
        openTypes: ["b2b-saas", "marketplace"],
        startType: "b2b-saas",
        startMotions: { plg: false, slg: false },
      }) as never,
    );
    expect(saas.match(/<input[^>]*data-testid="engine-motion-plg"[^>]*>/)?.[0] ?? "").toMatch(/checked=""/);
    expect(saas.match(/<input[^>]*data-testid="engine-motion-slg"[^>]*>/)?.[0] ?? "").not.toMatch(/checked=""/);
  });

  it("the start screen's answers are what the card opens on", () => {
    const chosen = renderToStaticMarkup(
      createElement(Setup, {
        strings: FR.strings,
        stringsFor: (type: BusinessType, offering?: "products" | "services") =>
          type === "marketplace" ? marketplaceStrings(FR.strings, FR.typeStrings.marketplace, offering ?? "products", null) : FR.strings,
        locale: "fr",
        today: CTX_FR.today,
        tour: null,
        onStart: () => {},
        openTypes: ["b2b-saas", "marketplace"],
        startType: "marketplace",
        startMkt: { offering: "services", sellerSubscriptions: true },
      }) as never,
    );
    expect(text_(chosen)).toContain("Une place de marché a deux côtés : les clients et les prestataires.");
    expect(chosen.match(/<input[^>]*data-testid="engine-setup-mkt-subscriptions"[^>]*>/)?.[0] ?? "").toMatch(/checked=""/);
  });
});
