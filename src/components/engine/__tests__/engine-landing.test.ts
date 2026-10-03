import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EngineLanding, type EngineLandingProps } from "../EngineLanding";

/**
 * EngineLanding (design system extension 07, A18 T4): one HTML for both
 * visits. What both must hold is pinned here without a DOM; which one shows
 * is CSS on `[data-engine="known"]`, pinned on the stylesheet itself, and
 * measured in a browser by `e2e/engine-landing.spec.ts`.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const landing = (props: Partial<EngineLandingProps> = {}) =>
  html(
    createElement(EngineLanding, {
      eyebrow: "Le moteur",
      title: "Ton moteur de growth",
      lede: "Ton Tour dit si tu mesures.",
      positioning: "Dix-sept chiffres en libre-service.",
      promiseTitle: "Rien de ce que tu saisis ne sort d'ici",
      promiseBody: "Aucun chiffre ne quitte ton navigateur.",
      promiseLine: "Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur.",
      cta: "Entre tes chiffres →",
      ctaNote: "Gratuit, sans compte.",
      aside: createElement("svg", { "data-testid": "watch" }),
      ...props,
    }),
  );
const css = readFileSync(join(__dirname, "..", "EngineLanding.module.css"), "utf8");

describe("EngineLanding", () => {
  it("holds both visits in one HTML: the H1, the lede and positioning, the promise as a card and as a line", () => {
    const markup = landing();
    expect(markup.match(/<h1/g)).toHaveLength(1);
    for (const text of ["Ton Tour dit si tu mesures.", "Dix-sept chiffres", "Aucun chiffre ne quitte", "ne vit que dans ce navigateur"]) {
      expect(markup).toContain(text);
    }
  });

  it("puts the promise before the call to action, and never in a <details>", () => {
    const markup = landing();
    expect(markup.indexOf("engine-privacy")).toBeLessThan(markup.indexOf("engine-cta"));
    expect(markup.indexOf("engine-privacy-line")).toBeLessThan(markup.indexOf("engine-cta"));
    expect(markup).not.toContain("<details");
  });

  it("the call to action is an anchor to the tool, drawn secondary — the page's one primary is the start card's", () => {
    const markup = landing();
    expect(markup).toMatch(/<a[^>]*href="#engine"[^>]*data-testid="engine-cta"|<a[^>]*data-testid="engine-cta"[^>]*href="#engine"/);
    expect(markup).not.toMatch(/data-testid="engine-cta"[^>]*class="[^"]*primary/);
    // The stopwatch is decoration.
    expect(markup).toMatch(/aria-hidden="true"[^>]*><svg data-testid="watch"/);
  });

  it("a returning reader's version is CSS alone: the intro, the card, the call to action and the aside hidden, the line shown", () => {
    const known = css.slice(css.indexOf("Returning"));
    for (const hidden of [".intro", ".promise,", ".cta,", ".aside"]) expect(known).toContain(`[data-engine="known"] ${hidden}`);
    expect(known).toMatch(/\[data-engine="known"\] \.promiseLine \{\s*display: block;/);
    expect(known).toContain("var(--engine-landing-title)");
    expect(known).toContain("var(--engine-landing-title-mobile)");
  });
});
