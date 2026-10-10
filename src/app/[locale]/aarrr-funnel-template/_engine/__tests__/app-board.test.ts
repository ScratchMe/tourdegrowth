import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { pelotonTitle } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import { consumerState, consumerUsageOnlyState, exampleState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { motionShapes } from "@/lib/engine/catalog-shape";
import { mergeStrings } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import { collectPlan } from "../collect";
import { AppStreamsBand } from "../AppStreamsBand";
import { Board } from "../Board";
import { BoardMoney } from "../BoardMoney";
import { Peloton } from "../Peloton";
import type { EngineView } from "../view";
import { WhatIfPanel } from "../WhatIfPanel";

/**
 * An app's board, drawn (§21.6.4, A22 APP-8), on the markup without a DOM: where the two streams sit, which cash
 * lines an app has, the peloton's columns, the funnel of a month with no subscriptions, and that the SaaS's board is
 * what it was. How it looks is checked on screen (JOURNAL.md).
 *
 */
const LOCALES = { fr: { P: FR, ctx: CTX_FR }, en: { P: EN, ctx: CTX_EN } } as const;

function viewOf(state: EngineState, locale: "fr" | "en" = "fr"): EngineView {
  const { P, ctx } = LOCALES[locale];
  const app = state.setup.type === "consumer-app";
  const strings = app ? mergeStrings(P.strings, P.typeStrings["consumer-app"]) : P.strings;
  const catalog = app ? P.typeCatalogs["consumer-app"] : { metrics: P.metrics, derived: P.derived };
  return {
    state,
    derived: deriveEngine(state, ctx, null, P.bridges, strings.units),
    strings,
    metrics: catalog.metrics,
    derivedCopy: catalog.derived,
    bridges: P.bridges,
    ctx,
    tourResult: null,
    tourOnDevice: false,
    deviceTour: null,
  };
}
const html = (view: EngineView, component: unknown, props: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(component as never, { view, ...props }) as never);
const text = (markup: string) => markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const NB = " ";

describe("the two streams' band", () => {
  it("an app with subscriptions and usage: the month's two streams, their sum, then what adds up", () => {
    const markup = html(viewOf(consumerState()), AppStreamsBand);
    expect(markup).toContain('data-testid="engine-app-streams"');
    expect(text(markup)).toContain(`Abonnements, achats et pub`);
    expect(text(markup)).toContain(`28${NB}800${NB}€`);
    expect(text(markup)).toContain(`10${NB}500${NB}€`);
    expect(text(markup)).toContain(`39${NB}300${NB}€`);
    // The total alone, two significant digits.
    expect(text(markup)).toContain(`~3${NB}300${NB}€`);
    expect(text(markup)).toContain(`~43${NB}000${NB}€`);
    expect(markup.indexOf("engine-app-streams-subscriptions")).toBeLessThan(markup.indexOf("engine-app-streams-usage"));
  });

  it("the title follows what is ticked, in both languages", () => {
    const purchases = consumerState();
    purchases.setup = { ...purchases.setup, monetization: { subscriptions: true, purchases: true, ads: false } };
    expect(text(html(viewOf(purchases), AppStreamsBand))).toContain("Abonnements et achats");
    const ads = consumerState();
    ads.setup = { ...ads.setup, monetization: { subscriptions: true, purchases: false, ads: true } };
    expect(text(html(viewOf(ads), AppStreamsBand))).toContain("Abonnements et pub");
    expect(text(html(viewOf(consumerState(), "en"), AppStreamsBand))).toContain("Subscriptions, purchases and ads");
  });

  it("is not drawn without subscriptions, without usage, or for a SaaS", () => {
    expect(html(viewOf(consumerUsageOnlyState()), AppStreamsBand)).toBe("");
    const subscriptionsOnly = consumerState();
    subscriptionsOnly.setup = { ...subscriptionsOnly.setup, monetization: { subscriptions: true, purchases: false, ads: false } };
    expect(html(viewOf(subscriptionsOnly), AppStreamsBand)).toBe("");
    expect(html(viewOf(exampleState()), AppStreamsBand)).toBe("");
  });

  it("a stream that cannot be computed says so, and the total is not a part shown alone (S9)", () => {
    // No revenue per subscriber: the subscriptions' revenue is unknown, the total with it.
    const state = withEntry(withEntry(consumerState(), "rev.arpa", undefined), "rev.paid-conversion", undefined);
    state.snapshots[state.snapshots.length - 1]!.base = { ...state.snapshots[state.snapshots.length - 1]!.base, mrrEnd: undefined };
    const markup = text(html(viewOf(state), AppStreamsBand));
    expect(markup).toContain("pas de chiffre");
    expect(markup).toContain(`10${NB}500${NB}€`);
    expect(markup).not.toContain(`39${NB}300${NB}€`);
  });
});

describe("the money block of an app", () => {
  it("lists the month's spend alone, and says why no cash is tied up (D11)", () => {
    const markup = html(viewOf(consumerState()), BoardMoney, { motion: "plg", hybrid: false });
    expect(markup).toContain("engine-money-plg-fact-spend");
    expect(markup).not.toContain("engine-money-plg-fact-tied");
    expect(text(markup)).toContain("Pas de trésorerie immobilisée pour une app");
    expect(text(markup)).toContain("Elle rembourse son coût en 13 mois");
  });

  it("the SaaS's block still lists the cash it ties up", () => {
    const markup = html(viewOf(exampleState()), BoardMoney, { motion: "plg", hybrid: false });
    expect(markup).toContain("engine-money-plg-fact-tied");
    expect(text(markup)).not.toContain("Pas de trésorerie immobilisée pour une app");
  });
});

describe("the peloton's columns", () => {
  const peloton = (state: EngineState) => {
    const view = viewOf(state);
    return html(view, Peloton, {
      peloton: view.derived.peloton,
      strings: view.strings,
      locale: "fr",
      cohortMonth: state.snapshots[state.snapshots.length - 1]!.cohortMonth,
      paidWindowDays: state.setup.paidWindowDays,
    });
  };
  it("four for the SaaS and for an app with subscriptions, three for an app without", () => {
    expect(peloton(exampleState())).toContain("--peloton-columns:4");
    expect(peloton(consumerState())).toContain("--peloton-columns:4");
    expect(peloton(consumerUsageOnlyState())).toContain("--peloton-columns:3");
  });
});

describe("the panel's funnel of the month", () => {
  const panel = (state: EngineState) => html(viewOf(state), WhatIfPanel, { onChange: () => {} });
  it("an app without subscriptions has no « new subscribers » column; with them, it has", () => {
    expect(panel(consumerUsageOnlyState())).not.toContain('data-testid="whatif-step-paying"');
    expect(panel(consumerUsageOnlyState())).toContain('data-testid="whatif-step-d30"');
    expect(panel(consumerState())).toContain('data-testid="whatif-step-paying"');
    expect(panel(exampleState())).toContain('data-testid="whatif-step-paying"');
  });
});

describe("the board", () => {
  const board = (state: EngineState) => {
    const view = viewOf(state);
    const verdict = pelotonTitle(state, view.derived.peloton, view.strings, view.metrics, view.ctx);
    const plan = collectPlan(state.snapshots[state.snapshots.length - 1]!, view.ctx.today, motionShapes(state.setup));
    const actions = new Proxy({}, { get: () => () => {} });
    return renderToStaticMarkup(
      createElement(Board as never, {
        view,
        actions,
        verdict,
        plan,
        returningFrom: null,
        openedAt: "2026-09-24",
        writeFailed: false,
        motionView: null,
        onMotion: () => {},
        onDeck: () => {},
        onSave: () => {},
        onImport: () => {},
        onErase: () => {},
        onSettings: () => {},
        onRename: () => {},
        onRequests: () => {},
      }) as never,
    );
  };

  it("an app's board draws: the streams before the money, the list of its own numbers", () => {
    const markup = board(consumerState());
    expect(markup.indexOf('data-testid="engine-app-streams"')).toBeGreaterThan(0);
    expect(markup.indexOf('data-testid="engine-app-streams"')).toBeLessThan(markup.indexOf('data-testid="engine-money-plg"'));
    expect(markup).toContain("engine-metric-app-acq-cpi");
    expect(markup).not.toContain("engine-metric-acq-cac");
    expect(markup).toContain("engine-metric-app-rev-commission");
  });

  it("a SaaS's board has no band and its own numbers", () => {
    const markup = board(exampleState());
    expect(markup).not.toContain("engine-app-streams");
    expect(markup).toContain("engine-metric-acq-cac");
    expect(markup).not.toContain("engine-metric-app-acq-cpi");
  });

  it("an app without subscriptions has no band, and its list has no subscription number", () => {
    const markup = board(consumerUsageOnlyState());
    expect(markup).not.toContain("engine-app-streams");
    expect(markup).not.toContain("engine-metric-rev-paid-conversion");
    expect(markup).toContain("engine-metric-app-rev-purchases-per-active");
  });
});
