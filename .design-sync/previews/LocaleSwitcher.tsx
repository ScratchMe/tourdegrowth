import { LocaleSwitcher } from "tour-de-growth";

/*
 * EN | FR. It is a `Segmented` in link form — real anchors, not buttons,
 * because switching language has to reload the document so `<html lang>`
 * follows it. A client-side swap leaves the old lang attribute in place,
 * which is invisible to crawlers but wrong for screen readers and for the
 * browser's own translation prompt.
 *
 * `path` is the current page WITHOUT its language prefix. Omit it on a page
 * whose URL carries no language — a result page, the quiz — and the switch
 * falls back to `?lang=`, which resolves against whatever address you are on.
 * That form looks exactly like the one below (only the links differ), so it
 * has no cell of its own.
 */

/** On a content page, where the other language is a real URL: the English page, then the French one — the active language filled. */
export const ContentPage = () => (
  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
    <LocaleSwitcher locale="en" path="/glossary/cac" />
    <LocaleSwitcher locale="fr" path="/glossary/cac" />
  </div>
);
