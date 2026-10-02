import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AskList, type AskListProps } from "../AskList";

/**
 * The requests, one screen (design system extension 07, A18 T3.c): what the
 * list must hold, pinned without a DOM — one card per role with its numbers
 * and its request as it will be copied, the copy as each card's own action,
 * a copied card saying when, and one primary for the screen.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const list = (props: Partial<AskListProps> = {}) =>
  html(
    createElement(AskList, {
      title: "À demander (3)",
      lead: "Envoie les demandes aujourd'hui.",
      groups: [
        { id: "finance", role: "Finance", numbers: "CAC · Marge brute", request: "Bonjour —\n– le CAC\n– la marge brute", action: createElement("button", { type: "button" }, "Copier"), "data-testid": "card-finance" },
        { id: "data", role: "Data", numbers: "Coefficient viral", request: "Bonjour —", copied: "Copiée le 24 septembre 2026.", "data-testid": "card-data" },
      ],
      done: { label: "C'est envoyé, passe au chiffre suivant →", onClick: () => {}, "data-testid": "done" },
      "data-testid": "asks",
      ...props,
    }),
  );

describe("AskList", () => {
  it("is a section named by its heading, which takes the focus a person's move sends it", () => {
    expect(list()).toMatch(/<section[^>]*aria-labelledby="engine-asks-title"/);
    expect(list()).toMatch(/<h2 id="engine-asks-title"[^>]*tabindex="-1"[^>]*>À demander \(3\)/);
  });

  it("one card per role: the role as its heading, its numbers, the request as it will be copied", () => {
    const markup = list();
    expect(markup.match(/<h3/g)).toHaveLength(2);
    expect(markup.indexOf("Finance")).toBeLessThan(markup.indexOf("Data"));
    expect(markup).toMatch(/<blockquote[^>]*>Bonjour —\n– le CAC/);
  });

  it("a copied card says when, and carries no copy; one still to copy carries its action", () => {
    const markup = list();
    const finance = markup.slice(markup.indexOf('data-testid="card-finance"'), markup.indexOf('data-testid="card-data"'));
    const data = markup.slice(markup.indexOf('data-testid="card-data"'));
    expect(finance).toContain("Copier");
    expect(finance).not.toContain("Copiée le");
    expect(data).toContain("Copiée le 24 septembre 2026.");
  });

  it("has one primary, the screen's way on", () => {
    const markup = list();
    expect((markup.match(/<button[^>]*class="[^"]*primary/g) ?? []).length).toBe(1);
    expect(markup).toMatch(/<button[^>]*data-testid="done"[^>]*>C&#x27;est envoyé|<button[^>]*data-testid="done"[^>]*>C'est envoyé/);
  });
});
