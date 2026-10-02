import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EngineProgress, type EngineProgressProps } from "../EngineProgress";
import { NumberList, type NumberListProps } from "../NumberList";

/**
 * « Tes chiffres » (design system extension 07, C41, A18 T2.b): what the
 * list and its progress must say, pinned without a DOM — what remains first,
 * the one red stage, a found number's value without a tag, a row that opens
 * or is only read. What it looks like is checked on screen, by the engine's
 * specs.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);

describe("EngineProgress", () => {
  const progress = (props: Partial<EngineProgressProps> = {}) =>
    html(
      createElement(EngineProgress, {
        remaining: "6 à faire",
        counts: "7 trouvés · 2 estimés",
        groups: [
          { id: "acquisition", label: "Acquisition : trouvé, à faire", marks: ["found", "todo"] },
          { id: "activation", label: "Activation : estimé", marks: ["est"] },
        ],
        label: "Tes chiffres, étape par étape",
        ...props,
      }),
    );

  it("says what remains first, then the counts, then the marks", () => {
    const markup = progress();
    expect(markup.indexOf("6 à faire")).toBeLessThan(markup.indexOf("7 trouvés"));
    expect(markup.indexOf("7 trouvés")).toBeLessThan(markup.indexOf("<ol"));
  });

  it("draws one mark per number, grouped by stage, each group named in words; the marks themselves are silent", () => {
    const markup = progress();
    expect(markup).toMatch(/<ol[^>]*aria-label="Tes chiffres, étape par étape"/);
    expect(markup).toMatch(/<li[^>]*aria-label="Acquisition : trouvé, à faire"/);
    expect(markup.match(/data-mark=/g)).toHaveLength(3);
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(3);
  });

  it("is never a percentage bar", () => {
    expect(progress()).not.toMatch(/%|role="progressbar"|<progress/);
  });

  it("in a number's header (sm): the sentence only, no marks", () => {
    const markup = progress({ size: "sm" });
    expect(markup).toContain("6 à faire");
    expect(markup).not.toContain("<ol");
  });
});

describe("NumberList", () => {
  const list = (props: Partial<NumberListProps> = {}) =>
    html(
      createElement(NumberList, {
        title: "Tes chiffres",
        stages: [
          {
            id: "acquisition",
            name: "Acquisition",
            foundLabel: "1 sur 2 trouvé",
            marks: ["found", "todo"],
            rows: [
              { id: "a", name: "Taux d'inscription", value: "3,2 %", status: "found", onOpen: () => {}, "data-testid": "row-a" },
              { id: "b", name: "CAC", status: "todo", statusLabel: "À faire", onOpen: () => {}, "data-testid": "row-b" },
            ],
          },
          {
            id: "activation",
            name: "Activation",
            holdsBack: true,
            holdsLabel: "Freine ici",
            foundLabel: "0 sur 1 trouvé",
            marks: ["est"],
            rows: [{ id: "c", name: "Taux d'activation", value: "15–25 %", status: "est", statusLabel: "Estimé", note: "NOTE", "data-testid": "row-c" }],
          },
        ],
        "data-testid": "list",
        ...props,
      }),
    );

  it("shows every stage, in the order given, each a section named by its heading", () => {
    const markup = list();
    expect(markup.indexOf("Acquisition")).toBeLessThan(markup.indexOf("Activation"));
    expect(markup.match(/<section[^>]*aria-labelledby="engine-numbers-/g)).toHaveLength(2);
  });

  it("marks only the stage a target names: « Freine ici » and the diagnosis edge, once", () => {
    const markup = list();
    expect(markup.match(/Freine ici/g)).toHaveLength(1);
    expect(markup.match(/data-holds="true"/g)).toHaveLength(1);
  });

  it("a found number says its value and no tag: the value is the status", () => {
    const markup = list();
    const row = markup.slice(markup.indexOf('data-testid="row-a"'), markup.indexOf('data-testid="row-b"'));
    expect(row).toContain("3,2 %");
    expect(row).not.toMatch(/Trouvé|Found/);
  });

  it("a row with somewhere to go is one button; a row only read is not", () => {
    const markup = list();
    expect(markup).toMatch(/<button type="button"[^>]*data-testid="row-a"/);
    expect(markup).toMatch(/<div[^>]*data-testid="row-c"/);
    expect(markup).toContain('data-testid="row-c-note"');
  });

  it("an extra group (the hybrid's link) is closed at the end", () => {
    const markup = list({ extra: { title: "La liaison", rows: [{ id: "l", name: "Liaison", status: "todo", "data-testid": "row-l" }] } });
    expect(markup.indexOf("La liaison")).toBeGreaterThan(markup.indexOf("Taux d'activation"));
    expect(markup).not.toMatch(/<details[^>]*\sopen=""/);
  });
});
