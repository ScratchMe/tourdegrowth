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
 */

/** On a content page, where the other language is a real URL. */
export const ContentPage = () => (
  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
    <LocaleSwitcher locale="en" path="/glossary/cac" />
    <LocaleSwitcher locale="fr" path="/glossary/cac" />
  </div>
);

/**
 * With no `path` — a shared result has no language in its address, and must
 * not gain one: those links are already out in the world and a result renders
 * in the READER's language, not its author's.
 */
export const AppPage = () => <LocaleSwitcher locale="en" />;
