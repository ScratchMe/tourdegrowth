import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "@/content/engine-copy";
import { consumerState, exampleState } from "@/lib/engine/__tests__/fixtures";
import { CTX_FR, FR } from "@/lib/engine/__tests__/props";
import { mergeStrings } from "@/lib/engine/strings";
import type { BusinessType, EngineState } from "@/lib/engine/types";
import { Setup } from "../Setup";

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
