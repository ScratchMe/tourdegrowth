import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Disclosure, type DisclosureProps } from "../Disclosure";

/**
 * Disclosure's delta (design system extension 07, A18 T0): `defaultOpen`,
 * `open` and `id`, all optional, so a row another control opens — the trap's
 * « Écris ta définition » — can be drawn open and pointed at. What the markup
 * must say is pinned here, without a DOM; the `toggle` that calls
 * `onOpenChange` is the browser's own, exercised by its first caller (A18 T1).
 */
const html = (props: Partial<DisclosureProps> = {}) =>
  // `children` is required by the props and passed as createElement's third argument (react/no-children-prop).
  renderToStaticMarkup(createElement(Disclosure, { summary: "Ta définition et une note", ...props } as DisclosureProps, "body"));

const openAttr = (markup: string) => /<details[^>]*\sopen=""/.test(markup);

describe("Disclosure: open, from elsewhere", () => {
  it("stays closed by default — a caller from before is unchanged", () => {
    expect(openAttr(html())).toBe(false);
    expect(html()).not.toContain(" id=");
  });

  it("is drawn open with defaultOpen", () => {
    expect(openAttr(html({ defaultOpen: true }))).toBe(true);
  });

  it("follows `open` when controlled, over defaultOpen", () => {
    expect(openAttr(html({ open: true }))).toBe(true);
    expect(openAttr(html({ open: false, defaultOpen: true }))).toBe(false);
  });

  it("carries its id on the <details>, for aria-controls", () => {
    expect(html({ id: "sheet-words" })).toMatch(/<details[^>]*\sid="sheet-words"/);
  });

  it("is still a native <details> with its summary first", () => {
    expect(html({ open: true })).toMatch(/^<details[^>]*><summary/);
  });
});
