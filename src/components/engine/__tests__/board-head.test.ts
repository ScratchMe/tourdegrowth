import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EngineBar, type EngineBarProps } from "../EngineBar";
import { NextStep, type NextStepProps } from "../NextStep";

/**
 * The head of the board (design system extension 07, A18 T2.a): what the
 * engine bar and the next step must say, pinned without a DOM — one primary,
 * the menu closed, the backup said only while it is owed. What they look
 * like is checked on screen, by the engine's specs.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);

describe("EngineBar", () => {
  const bar = (props: Partial<EngineBarProps> = {}) =>
    html(
      createElement(EngineBar, {
        line: "LINE",
        menuLabel: "Moteur, mois et fichier",
        groups: [
          { title: "Ce moteur", items: ["RENAME"] },
          { title: "Fichier", items: ["SAVE", "ERASE"] },
        ],
        settingsLabel: "Réglages",
        onSettings: () => {},
        "data-testid": "bar",
        ...props,
      }),
    );

  it("keeps the menu closed: nothing in it is the next step", () => {
    expect(bar()).not.toMatch(/<details[^>]*\sopen=""/);
  });

  it("names each group of the menu by its title, one row per item", () => {
    const markup = bar();
    expect(markup).toMatch(/<section[^>]*aria-label="Ce moteur"/);
    expect(markup).toMatch(/<section[^>]*aria-label="Fichier"/);
    expect(markup.match(/<li>/g)).toHaveLength(3);
  });

  it("has no primary button: the settings are quiet", () => {
    expect(bar()).not.toMatch(/primary/i);
  });

  it("says the backup only while it is owed: the tag and the sentence come and go together", () => {
    expect(bar()).not.toContain("bar-pending");
    const owed = bar({ pending: "Jamais sauvegardé", note: "SAFARI" });
    expect(owed).toContain("Jamais sauvegardé");
    expect(owed).toContain("SAFARI");
  });
});

describe("NextStep", () => {
  const step = (props: Partial<NextStepProps> = {}) =>
    html(
      createElement(NextStep, {
        eyebrow: "Dernière visite · il y a 12 jours",
        lead: "LEAD",
        primary: { label: "Chiffre suivant : CAC →", onClick: () => {} },
        "data-testid": "next",
        ...props,
      }),
    );

  it("reads the reason, then the one action, then what else waits", () => {
    const markup = step({ lines: [{ text: "LINE" }], secondary: "SECONDARY" });
    const at = (needle: string) => markup.indexOf(needle);
    expect(at("Dernière visite")).toBeLessThan(at("LEAD"));
    expect(at("LEAD")).toBeLessThan(at("Chiffre suivant"));
    expect(at("Chiffre suivant")).toBeLessThan(at("SECONDARY"));
    expect(at("SECONDARY")).toBeLessThan(at("LINE"));
  });

  it("has exactly one button of its own: the primary", () => {
    expect(step().match(/<button/g)).toHaveLength(1);
  });

  it("titles itself with the eyebrow, a heading, and names its lines by it", () => {
    const markup = step({ lines: [{ text: "LINE" }] });
    expect(markup).toMatch(/<h2[^>]*id="engine-next"[^>]*>Dernière visite/);
    expect(markup).toMatch(/<ul[^>]*aria-label="Dernière visite · il y a 12 jours"/);
  });

  it("announces the lead only when asked: the refused save, never every change of step", () => {
    expect(step()).not.toContain('role="alert"');
    expect(step({ announce: true, leadTone: "advice" })).toMatch(/<p[^>]*role="alert"[^>]*>LEAD/);
  });

  it("draws no list at all when nothing else waits", () => {
    expect(step()).not.toContain("<ul");
  });
});
