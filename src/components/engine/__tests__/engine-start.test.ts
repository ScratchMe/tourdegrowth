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
});
