import { NotFoundScreen } from "@/components/brand/NotFoundScreen";
import { UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { RootShell, rootMetadata } from "./root-shell";

export const metadata = { ...rootMetadata, robots: { index: false, follow: true } };

/**
 * The global 404 — REVIEW.md R-26.
 *
 * `global-not-found.tsx`, not `not-found.tsx`: Next mounts this one as a
 * LAYOUT rather than a page (`app-render.js#createNotFoundLoaderTree`), which
 * is what lets it render its own `<html>`/`<body>`. As a plain `not-found` it
 * ended up nested inside Next's built-in error document instead — verified,
 * the markup came back as `<html id="__next_error__">` with our content
 * inside and no `lang` attribute at all.
 *
 * Before this, an address matching no route at all rendered Next's built-in
 * error document: `<html id="__next_error__">`, not one of our stylesheets, an
 * unbranded white page. It was the only surface of the product that did not
 * look like the product, and a link mistyped from a shared result lands on it.
 *
 * It renders `<html>`/`<body>` ITSELF, via `RootShell`. That is the known
 * friction point of having two root layouts (R-24): a global not-found sits
 * above both `[locale]/` and `(app)/`, so it has no root layout in its chain
 * and must be its own.
 *
 * The language comes from the header the proxy resolved, since a URL that
 * matches nothing carries no locale prefix to read. That makes this one route
 * render on demand — correct for a 404 nobody links to on purpose, and it
 * changes nothing for the 36 content pages, which keep their own root layout
 * and stay prerendered.
 */
export default async function GlobalNotFound() {
  const locale = await resolveRequestLocale();
  const t = UI_STRINGS.notFound;

  return (
    <RootShell locale={locale}>
      <NotFoundScreen locale={locale} title={t.title} body={t.body} cta={t.cta} />
    </RootShell>
  );
}
