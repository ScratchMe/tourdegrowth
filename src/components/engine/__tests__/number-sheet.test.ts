import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnswerSwitch, type AnswerSwitchProps } from "../AnswerSwitch";
import { HowItCompares, type HowItComparesProps } from "../HowItCompares";
import { NumberSheet, type NumberSheetProps } from "../NumberSheet";
import { TrapNote, type TrapNoteProps } from "../TrapNote";
import { WhereToFind, type WhereToFindProps } from "../WhereToFind";

/**
 * The number's screen (design system extension 07, A18 T1): what each
 * component's markup must say, pinned without a DOM — the order of the
 * blocks, the one verdict a team target earns, the folded and the open.
 * What it looks like is checked on screen, by the engine's specs.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const at = (markup: string, needle: string) => {
  const i = markup.indexOf(needle);
  if (i < 0) throw new Error(`not in the markup: ${needle}`);
  return i;
};

describe("NumberSheet", () => {
  const sheet = (props: Partial<NumberSheetProps> = {}) =>
    html(
      createElement(NumberSheet, {
        name: "Taux d'inscription",
        definition: "ONE-LINER",
        formula: "FORMULA",
        formulaLabel: "Formule",
        tour: "TOUR",
        trap: "TRAP",
        where: "WHERE",
        answer: "ANSWER",
        compare: "COMPARE",
        words: "WORDS",
        actions: "ACTIONS",
        footer: "FOOTER",
        ...props,
      }),
    );

  it("lays the blocks out in the fixed order: the trap before the value, the reference after it, the words last", () => {
    const markup = sheet();
    const order = ["Taux d", "ONE-LINER", "FORMULA", "TOUR", "TRAP", "WHERE", "ANSWER", "COMPARE", "WORDS", "ACTIONS", "FOOTER"].map((n) => at(markup, n));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("is not a <form>: what is typed in the engine never rides a submit", () => {
    expect(sheet()).not.toContain("<form");
  });

  it("names its group by the heading, which takes the focus only when asked (tabindex -1)", () => {
    const markup = sheet({ headingId: "n-title" });
    expect(markup).toMatch(/<h2 id="n-title" tabindex="-1"/);
    expect(markup).toMatch(/role="group" aria-labelledby="n-title"/);
  });

  it("a computed number shows no answer and no words", () => {
    const markup = sheet({ readOnly: true });
    expect(markup).not.toContain("ANSWER");
    expect(markup).not.toContain("WORDS");
    expect(markup).toContain("COMPARE");
  });

  it("without a name (a board row, until T2), draws no heading and no unnamed group", () => {
    const markup = sheet({ name: undefined });
    expect(markup).not.toContain("<h2");
    expect(markup).not.toContain('role="group"');
  });

  it("opens the definition in a new tab, so the sheet in progress is not lost", () => {
    expect(sheet({ definitionHref: "/fr/glossaire/x", definitionLabel: "Définition →" })).toMatch(/<a[^>]*href="\/fr\/glossaire\/x"[^>]*target="_blank"/);
  });
});

describe("AnswerSwitch", () => {
  const options: AnswerSwitchProps["options"] = [
    { value: "estimate", label: "Je peux l'estimer" },
    { value: "ask", label: "Je le demande" },
    { value: "cant", label: "Je ne le trouve pas" },
  ];
  const sw = (props: Partial<AnswerSwitchProps> = {}) =>
    html(createElement(AnswerSwitch, { legend: "Pas de chiffre sous la main ?", options, backLabel: "← Finalement, je l’ai", value: "BOXES", source: "SOURCE", editor: "EDITOR", ...props }));

  it("shows the boxes first, nothing pressed: a number nobody looked at is still to do", () => {
    const markup = sw();
    expect(markup).toContain("BOXES");
    expect(markup).not.toContain("EDITOR");
    expect(markup.match(/aria-pressed="false"/g)).toHaveLength(3);
    expect(at(markup, "BOXES")).toBeLessThan(at(markup, "Pas de chiffre"));
  });

  it("swaps the boxes for the chosen answer's editor, with the way back, and presses that one only", () => {
    const markup = sw({ answer: "ask" });
    expect(markup).not.toContain("BOXES");
    expect(markup).toContain("EDITOR");
    expect(markup).toContain("← Finalement, je l’ai");
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Je le demande</);
  });

  it("names the group of the three by its legend", () => {
    const markup = sw({ legendId: "q" });
    expect(markup).toMatch(/role="group" aria-labelledby="q"/);
    expect(markup).toMatch(/<span id="q"[^>]*>Pas de chiffre/);
  });
});

describe("TrapNote", () => {
  it("is an aside named by its label, with the hybrid trap under its own label", () => {
    const markup = html(
      createElement(TrapNote, { label: "Le piège, avant de taper", hybrid: { label: "Si tu vends des deux façons", text: "HYBRID" } } as TrapNoteProps, "TRAP"),
    );
    expect(markup).toMatch(/^<aside[^>]*aria-label="Le piège, avant de taper"/);
    expect(at(markup, "TRAP")).toBeLessThan(at(markup, "HYBRID"));
  });
});

describe("WhereToFind", () => {
  const where = (props: Partial<WhereToFindProps> = {}) =>
    html(
      createElement(WhereToFind, {
        label: "Où le trouver",
        tools: [
          { tool: "GA4", path: "Rapports › Acquisition" },
          { tool: "Mixpanel ou Amplitude", path: "Insights", yours: true },
        ],
        yoursLabel: "ton outil",
        ...props,
      }),
    );

  it("is folded by default, and its summary names the tools, the team's first", () => {
    const markup = where();
    expect(markup).not.toMatch(/<details[^>]*\sopen=""/);
    expect(markup).toMatch(/<summary[^>]*>.*Où le trouver.*Mixpanel ou Amplitude · GA4.*<\/summary>/);
  });

  it("tags the team's own tool, and only it", () => {
    expect(where().match(/ton outil/g)).toHaveLength(1);
  });

  it("opens on first render when the team's tools fill this number", () => {
    expect(where({ open: true })).toMatch(/<details[^>]*\sopen=""/);
  });
});

describe("HowItCompares (C1: only a team target earns a verdict)", () => {
  const compare = (props: Partial<HowItComparesProps> = {}) =>
    html(createElement(HowItCompares, { title: "Comment il se situe", domain: [0, 10], chartLabel: "Taux 3 %, repère 2–5 %", ...props }));

  it("draws the chart, the band under it, and no tag, against a reference alone", () => {
    const markup = compare({ value: 3, band: [2, 5], caveat: "CAVEAT" });
    expect(markup).toContain('role="img"');
    expect(markup).toContain("data-band");
    expect(markup).not.toContain("data-verdict");
    expect(markup).toContain("CAVEAT");
  });

  it("says below the target in the red of a diagnosis, at or above it in neutral", () => {
    expect(compare({ value: 3, target: 5, verdict: { tone: "below", label: "Sous la cible" } })).toMatch(/data-verdict="below"/);
    expect(compare({ value: 6, target: 5, verdict: { tone: "ok", label: "À la cible" } })).toMatch(/data-verdict="ok"/);
  });

  it("draws no chart when there is nothing to draw, and keeps the caveat and the target box", () => {
    const markup = compare({ caveat: "No reference worth publishing", targetField: "TARGET-BOX" });
    expect(markup).not.toContain('role="img"');
    expect(markup).toContain("No reference worth publishing");
    expect(markup).toContain("TARGET-BOX");
  });

  it("draws the target alone, before any figure: the tick, no bar", () => {
    const markup = compare({ target: 5 });
    expect(markup).toContain('role="img"');
    expect(markup).not.toMatch(/style="width:/);
  });

  it("an estimate draws no bar, so its legend line has no bar's swatch — the words say the range (A21.7)", () => {
    const legend = [
      { kind: "value" as const, label: "Ton chiffre 70 à 80 %" },
      { kind: "band" as const, label: "Repère publié" },
    ];
    const swatches = (markup: string) => markup.match(/aria-hidden="true"><\/span>/g)?.length ?? 0;
    expect(swatches(compare({ value: null, band: [2, 5], legend }))).toBe(1);
    expect(swatches(compare({ value: 3, band: [2, 5], legend }))).toBe(2);
    expect(compare({ value: null, band: [2, 5], legend })).toContain("Ton chiffre 70 à 80 %");
  });
});
