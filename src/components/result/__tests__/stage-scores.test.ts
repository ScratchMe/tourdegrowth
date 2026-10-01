/* eslint-disable react/no-children-prop -- StageScores declares `children` required: createElement's rest arguments do not satisfy that type, so the tests pass it as the prop the component declares (as form-primitives.test.ts does). */
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StageScore } from "../StageScore";
import { StageScores } from "../StageScores";
import { StampedPillar } from "../StampedPillar";
import styles from "../StageScores.module.css";

/**
 * The markup rules of the score sheet — design system extension 05 (A16,
 * design/ds-extension-05-return/). No DOM here (environment "node"):
 * `renderToStaticMarkup` turns a component into a string, enough to pin what
 * a screen reader and a crawler get — an ordered list with its name, a row's
 * text as its whole reading, the meter hidden, the landing's link named for
 * where it goes, the stamp read in words with its dots hidden. What the sheet
 * looks like (no box, the red row, the 44px rows) is measured on screen, in
 * e2e/result-composition.spec.ts and e2e/targets.spec.ts.
 */

const html = (element: ReactElement) => renderToStaticMarkup(element);
const text = (markup: string) => markup.replace(/<span[^>]*aria-hidden="true"[^>]*>.*?<\/span>/g, "").replace(/<[^>]+>/g, "");

describe("StageScores", () => {
  it("is an ordered list carrying its accessible name and its size", () => {
    const out = html(createElement(StageScores, { label: "Score per stage, out of 20", size: "sm", children: null }));
    expect(out).toMatch(/^<ol [^>]*aria-label="Score per stage, out of 20"/);
    expect(out).toContain(styles.sm);
    expect(out).not.toContain(styles.md);
  });

  it("defaults to the result's size, which shrinks on a phone by CSS alone", () => {
    expect(html(createElement(StageScores, { children: null }))).toContain(styles.md);
  });
});

describe("StageScore", () => {
  it("is a row whose text is its whole reading, the meter hidden and scaled to the score", () => {
    const out = html(createElement(StageScore, { stage: "Acquisition", score: 18 }));
    expect(out).toMatch(/^<li /);
    expect(text(out).replace(/\s+/g, " ").trim()).toBe("18/20 Acquisition");
    expect(out).toMatch(/<span class="[^"]*" aria-hidden="true" data-testid="stage-meter"><span class="[^"]*" style="--score-share:90%"><\/span><\/span>/);
  });

  it("prints the figure as given and the caller's total", () => {
    const out = html(createElement(StageScore, { stage: "Retention", score: 8, total: 20 }));
    expect(text(out)).toContain("8/20");
    expect(text(out)).not.toContain("08");
  });

  it("marks the stalling stage with the alert class only when told to", () => {
    expect(html(createElement(StageScore, { stage: "Retention", score: 8, tone: "alert" }))).toContain(styles.alert);
    expect(html(createElement(StageScore, { stage: "Acquisition", score: 18 }))).not.toContain(styles.alert);
  });

  it("on the landing, makes the stage NAME the link, named for where it goes — never the whole row", () => {
    const out = html(
      createElement(StageScore, { stage: "Activation", score: 12, href: "/fr/glossary/activation", linkLabel: "Activation — définition" }),
    );
    expect(out).toMatch(/<a [^>]*href="\/fr\/glossary\/activation"[^>]*>Activation<\/a>/);
    expect(out).toMatch(/<a [^>]*aria-label="Activation — définition"/);
    // The score stays outside the link: it is read with the row.
    expect(out).toMatch(/12<\/span>\/20<\/span>/);
    expect(out.indexOf("<a ")).toBeGreaterThan(out.indexOf("/20"));
  });
});

describe("StampedPillar", () => {
  it("is a row of the sheet, read in words with its dots hidden", () => {
    const out = html(createElement(StampedPillar, { pillar: "Retention", score: 9, suffix: "dead last" }));
    expect(out).toMatch(/^<li /);
    expect(text(out).replace(/\s+/g, " ").trim()).toBe("Retention 9/20 dead last");
    expect(out.match(/aria-hidden="true">·<\/span>/g)).toHaveLength(2);
  });
});
