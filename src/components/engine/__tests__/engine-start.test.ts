import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EngineStart, type EngineStartProps } from "../EngineStart";

/**
 * The first visit's one question (design system extension 07, A18 T3.a):
 * what the start screen must hold, pinned without a DOM — a real radio group
 * with the question as its legend, the plan said politely when the answer
 * changes, the defaults in a sentence with « Modifier », one primary, and
 * the other ways in quiet. What it looks like is checked on screen.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const start = (props: Partial<EngineStartProps> = {}) =>
  html(
    createElement(EngineStart, {
      title: "Avant de commencer",
      legend: "Comment vends-tu ?",
      options: [
        { value: "ss", label: "Libre-service", note: "On s'inscrit et on paie seul (PLG)." },
        { value: "sa", label: "Assisté", note: "Un commercial signe les contrats (SLG)." },
        { value: "both", label: "Les deux", note: "Deux moteurs, un total." },
      ],
      motion: "ss",
      onMotionChange: () => {},
      plan: "PLAN",
      defaults: "DEFAULTS",
      changeLabel: "Modifier",
      onChange: () => {},
      startLabel: "Commencer →",
      onStart: () => {},
      exampleLabel: "Voir un exemple rempli",
      onExample: () => {},
      importLabel: "Importer un fichier (.json)",
      onImport: () => {},
      "data-testid": "start",
      ...props,
    }),
  );

describe("EngineStart", () => {
  it("asks one question, as a real radio group whose legend is the question, the default chosen", () => {
    const markup = start();
    expect(markup).toMatch(/<fieldset[\s\S]*<legend[^>]*>[\s\S]*Comment vends-tu/);
    expect(markup.match(/type="radio"/g)).toHaveLength(3);
    expect(markup).toMatch(/type="radio"[^>]*value="ss"[^>]*checked=""|checked=""[^>]*value="ss"/);
  });

  it("says the plan politely, so a changed answer is read out", () => {
    expect(start()).toMatch(/<p[^>]*aria-live="polite"[^>]*data-testid="start-plan"[^>]*>PLAN/);
  });

  it("has exactly one primary, and the other ways in are quiet", () => {
    const markup = start();
    // A button's opening tag, by its test id: its class names say its variant.
    const tag = (id: string) => markup.match(new RegExp(`<button[^>]*data-testid="${id}"[^>]*>`))?.[0] ?? "";
    const buttons = markup.match(/<button[^>]*>/g) ?? [];
    expect(buttons.filter((b) => /class="[^"]*primary/.test(b))).toHaveLength(1);
    expect(tag("start-go")).toMatch(/class="[^"]*primary/);
    for (const id of ["start-change", "start-example", "start-import"]) expect(tag(id), id).toMatch(/class="[^"]*quiet/);
  });

  it("offers only the ways it is given: another engine's start has « Annuler », no example and no import", () => {
    const markup = start({ exampleLabel: undefined, onExample: undefined, importLabel: undefined, onImport: undefined, cancelLabel: "Annuler", onCancel: () => {} });
    expect(markup).not.toContain("start-example");
    expect(markup).not.toContain("start-import");
    expect(markup).toContain('data-testid="start-cancel"');
  });

  it("its heading can take the focus a person's move sends it, and is not in the Tab order", () => {
    expect(start()).toMatch(/<h2 id="engine-start-title"[^>]*tabindex="-1"/);
  });

  // Non-vacuity, measured on 2026-10-07: `earns` never drawn (`{false ? …}`) falls 2 of the 9 tests here, the group's and
  // the message's.
  const EARNS = {
    legend: "Elle gagne de l'argent par",
    options: [
      { id: "subscriptions" as const, label: "Des abonnements" },
      { id: "purchases" as const, label: "Des achats intégrés" },
      { id: "ads" as const, label: "De la publicité" },
    ],
    value: { subscriptions: true, purchases: false, ads: false },
    onChange: () => {},
  };

  it("the app's three ways of earning are a group of boxes under the question, the ticked ones checked (§21.6.1)", () => {
    const markup = start({ earns: EARNS });
    expect(markup).toContain('data-testid="start-earns"');
    expect(markup.match(/type="checkbox"/g)).toHaveLength(3);
    expect(markup).toMatch(/<legend[\s\S]*?Elle gagne de l(?:'|&#x27;)argent par/);
    const box = (id: string) => markup.match(new RegExp(`<input[^>]*data-testid="start-earns-${id}"[^>]*>`))?.[0] ?? "";
    expect(box("subscriptions")).toMatch(/checked=""/);
    expect(box("purchases")).not.toMatch(/checked=""/);
    expect(box("ads")).not.toMatch(/checked=""/);
    // The radio group is still the first thing: the boxes follow it, before the plan.
    expect(markup.indexOf("Comment vends-tu")).toBeLessThan(markup.indexOf("start-earns"));
    expect(markup.indexOf("start-earns")).toBeLessThan(markup.indexOf("PLAN"));
  });

  it("without `earns`, the card of a SaaS: no group, no box", () => {
    const markup = start();
    expect(markup).not.toContain("start-earns");
    expect(markup).not.toContain('type="checkbox"');
  });

  it("says its message under the boxes, tied to each of them, only when it is given", () => {
    const quiet = start({ earns: EARNS });
    expect(quiet).not.toContain("start-earns-error");
    const markup = start({ earns: { ...EARNS, value: { subscriptions: false, purchases: false, ads: false }, error: "Coche au moins une façon de gagner de l'argent." } });
    expect(markup).toMatch(/data-testid="start-earns-error"[^>]*>Coche au moins une façon/);
    const message = markup.match(/id="([^"]*-message)"/)?.[1];
    expect(message).toBeDefined();
    for (const id of ["subscriptions", "purchases", "ads"]) {
      const box = markup.match(new RegExp(`<input[^>]*data-testid="start-earns-${id}"[^>]*>`))?.[0] ?? "";
      expect(box, id).toContain(message!);
    }
  });

  it("offers a fourth radio, the app's, when it is given", () => {
    const markup = start({
      options: [
        { value: "ss", label: "SaaS B2B, en libre-service" },
        { value: "sa", label: "SaaS B2B, en vente assistée" },
        { value: "both", label: "SaaS B2B, les deux" },
        { value: "app", label: "App grand public", note: "Abonnements, achats intégrés ou pub." },
      ],
      motion: "app",
      earns: EARNS,
    });
    expect(markup.match(/type="radio"/g)).toHaveLength(4);
    expect(markup).toMatch(/type="radio"[^>]*value="app"[^>]*checked=""|checked=""[^>]*value="app"/);
  });
});

/**
 * The marketplace's two answers (§22.6.1, A23 MKT-6), under the question as the app's boxes are: a two-option choice of
 * the words it is read in, then one box, whether the sellers pay.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): the marketplace's block never drawn falls 3 (the radios and box, the answers' chosen state, their place before the plan).
 */
describe("EngineStart, the marketplace's answers (§22.6.1)", () => {
  const MKT = {
    legend: "Elle met en relation",
    options: [
      { value: "products" as const, label: "Acheteurs et vendeurs de produits" },
      { value: "services" as const, label: "Clients et prestataires de services" },
    ],
    offering: "products" as const,
    onOfferingChange: () => {},
    subscriptionsLabel: "Les vendeurs paient un abonnement",
    sellerSubscriptions: false,
    onSellerSubscriptionsChange: () => {},
  };
  const withMkt = (props: Partial<EngineStartProps> = {}) =>
    start({
      options: [
        { value: "ss", label: "SaaS B2B, en libre-service" },
        { value: "sa", label: "SaaS B2B, en vente assistée" },
        { value: "both", label: "SaaS B2B, les deux" },
        { value: "app", label: "App grand public" },
        { value: "mkt", label: "Place de marché", note: "Une commission sur chaque commande." },
      ],
      motion: "mkt",
      mkt: MKT,
      ...props,
    });

  it("a fifth radio, the marketplace's, chosen; under it a second group of two radios and one box", () => {
    const markup = withMkt();
    expect(markup).toMatch(/type="radio"[^>]*value="mkt"[^>]*checked=""|checked=""[^>]*value="mkt"/);
    expect(markup).toContain('data-testid="start-mkt"');
    // Five answers to the question, two words to read it in: seven radios, one checkbox.
    expect(markup.match(/type="radio"/g)).toHaveLength(7);
    expect(markup.match(/type="checkbox"/g)).toHaveLength(1);
    expect(markup).toMatch(/<legend[\s\S]*?Elle met en relation/);
  });

  it("products are chosen at the start, services are the other word, and the box is unticked (D9, D10)", () => {
    const markup = withMkt();
    const radio = (value: string) => markup.match(new RegExp(`<input[^>]*name="engine-offering"[^>]*value="${value}"[^>]*>|<input[^>]*value="${value}"[^>]*name="engine-offering"[^>]*>`))?.[0] ?? "";
    expect(radio("products")).toMatch(/checked=""/);
    expect(radio("services")).not.toMatch(/checked=""/);
    expect(markup.match(/<input[^>]*data-testid="start-mkt-subscriptions"[^>]*>/)?.[0] ?? "").not.toMatch(/checked=""/);
    const services = withMkt({ mkt: { ...MKT, offering: "services", sellerSubscriptions: true } });
    expect(services.match(/<input[^>]*name="engine-offering"[^>]*value="services"[^>]*>|<input[^>]*value="services"[^>]*name="engine-offering"[^>]*>/)?.[0] ?? "").toMatch(/checked=""/);
    expect(services.match(/<input[^>]*data-testid="start-mkt-subscriptions"[^>]*>/)?.[0] ?? "").toMatch(/checked=""/);
  });

  it("its two answers follow the question and come before the plan, and the app's boxes are not drawn", () => {
    const markup = withMkt();
    expect(markup.indexOf("Comment vends-tu")).toBeLessThan(markup.indexOf("start-mkt"));
    expect(markup.indexOf("start-mkt")).toBeLessThan(markup.indexOf("PLAN"));
    expect(markup).not.toContain("start-earns");
  });

  it("without `mkt`, no second group and no box: the card of a SaaS or of the app", () => {
    const markup = start();
    expect(markup).not.toContain("start-mkt");
    expect(markup).not.toContain("engine-offering");
    expect(markup).not.toContain('type="checkbox"');
  });
});
