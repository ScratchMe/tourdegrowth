import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SideNote, type SideNoteProps } from "../SideNote";

/**
 * SideNote (design system extension 10, A23 MKT-7a): what a side says where a
 * part is absent — by design (`absent`) or not yet (`pending`). Pinned without
 * a DOM: the dashed edge belongs to `pending` alone, red to neither, the part
 * keeps its heading and its place, and the component writes no word.
 *
 * Non-vacuity (2026-10-27, one sabotage at a time, restored after): `pending`
 * without its class drops 1 test; the eyebrow in the alert tone 1; the dashed
 * edge given to `absent` 1; the action drawn before the body 2 (the order, the
 * exact text); a stray « 0 » in the body 1.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);
const note = (props: Partial<SideNoteProps> = {}) =>
  html(
    createElement(
      SideNote,
      {
        title: "Les vendeurs ne paient pas",
        headingId: "note-title",
        "data-testid": "note",
        ...props,
      },
      createElement("p", null, "Tout le revenu, ce sont les commissions."),
    ),
  );
const words = (markup: string) =>
  markup
    .replace(/<[^>]*>/g, "|")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
const css = readFileSync(join(__dirname, "..", "SideNote.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
/** The sheet without the pending kind's rules (the phone's padding included). */
const withoutPending = css.replace(/\.pending \{[^}]*\}/g, "");

describe("SideNote", () => {
  it("is a section named by its title, an h3: the part keeps its heading", () => {
    const markup = note();
    expect(markup).toMatch(/<section[^>]*aria-labelledby="note-title"[^>]*data-testid="note"/);
    expect(markup).toMatch(/<h3 id="note-title"[^>]*>Les vendeurs ne paient pas<\/h3>/);
  });

  it("absent by default: no frame, and none of the pending kind's dashed look", () => {
    const markup = note();
    expect(markup).toContain('data-kind="absent"');
    expect(markup).toMatch(/class="[^"]*_absent_/);
    expect(markup).not.toMatch(/_pending_/);
  });

  it("takes the dashed edge only when it is pending", () => {
    const markup = note({ kind: "pending" });
    expect(markup).toContain('data-kind="pending"');
    expect(markup).toMatch(/class="[^"]*_pending_/);
    expect(markup).not.toMatch(/_absent_/);
    expect(css).toMatch(/\.pending \{[^}]*border: var\(--engine-pending-edge\)/);
    // The one dashed edge of the sheet is that rule's: the absent kind draws an ink rule on top, not a frame.
    expect(withoutPending).not.toMatch(/--engine-pending-edge|dashed/);
    expect(css).toMatch(/\.absent \{[^}]*border-top: var\(--border-rule\)/);
  });

  it("is never red, in either kind: no alert tone, no leak, no red token", () => {
    for (const kind of ["absent", "pending"] as const) {
      expect(note({ kind, eyebrow: "Argent", action: createElement("button", { type: "button" }, "Coche-le") })).not.toMatch(/alert|red|leak/i);
    }
    expect(css).not.toMatch(/alert|paint-red|highlight|diagnosis-edge|advice-edge|warning|--viz-/);
  });

  it("says its eyebrow first, its body after the title, and the action last", () => {
    const markup = note({ eyebrow: "Argent · août 2026", action: createElement("button", { type: "button" }, "Fixer les cibles") });
    expect(markup.indexOf("Argent")).toBeLessThan(markup.indexOf("Les vendeurs ne paient pas"));
    expect(markup.indexOf("Les vendeurs ne paient pas")).toBeLessThan(markup.indexOf("Tout le revenu"));
    expect(markup.indexOf("Tout le revenu")).toBeLessThan(markup.indexOf("Fixer les cibles"));
    expect(markup).toMatch(/<div class="[^"]*_action_[^"]*"><button type="button">Fixer les cibles<\/button><\/div>/);
  });

  it("leaves out what it is not given: no eyebrow, no body, no action", () => {
    const markup = html(createElement(SideNote, { title: "Pas assez de cibles", kind: "pending" }));
    expect(markup).not.toMatch(/_action_|_body_/);
    expect(markup).not.toContain("<button");
    expect(words(markup)).toEqual(["Pas assez de cibles"]);
  });

  it("writes no word of its own, no figure, no mark: its text is exactly the props'", () => {
    const markup = note({ eyebrow: "Argent · août 2026", action: createElement("button", { type: "button" }, "Coche-le dans les réglages") });
    expect(words(markup)).toEqual(["Argent · août 2026", "Les vendeurs ne paient pas", "Tout le revenu, ce sont les commissions.", "Coche-le dans les réglages"]);
    expect(markup).not.toMatch(/<svg|<img|\?/);
    // Never a zero where a stream is absent: the part says it in words.
    expect(words(markup).join(" ")).not.toMatch(/\b0\b/);
  });
});
