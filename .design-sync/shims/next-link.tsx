/*
 * `next/link` for the design-system bundle.
 *
 * Six components take an `href` and render a Next `Link` for it — `Button`
 * most of all, which is used on every screen. Next's own compiler replaces a
 * dozen `process.env.__NEXT_*` build-time constants inside that module; a
 * plain esbuild bundle leaves them as real reads, so the IIFE threw
 * `ReferenceError: process is not defined` before it could assign
 * `window.TourDeGrowth` — every component was missing and every preview blank.
 *
 * This is a substitution, not a reimplementation: in the DOM, `next/link`
 * renders exactly this `<a href>`. What it adds on top is client-side
 * routing, which has no meaning in a design canvas — there are no routes to
 * push. So the rendered markup and the styling are identical, and the `href`
 * prop keeps the meaning its `.d.ts` gives it.
 *
 * Wired by `paths` in `.design-sync/tsconfig.ds.json`, which the converter
 * reads — never by touching the app's own `tsconfig.json`.
 */
import type { AnchorHTMLAttributes, ReactNode } from "react";

type UrlObject = { pathname?: string | null };

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | UrlObject;
  children?: ReactNode;
  /* Accepted and ignored: routing-only props with no canvas equivalent. */
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
}

export default function Link({
  href,
  children,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  passHref: _passHref,
  legacyBehavior: _legacyBehavior,
  ...rest
}: LinkProps) {
  const url = typeof href === "string" ? href : (href?.pathname ?? "#");
  return (
    <a href={url} {...rest}>
      {children}
    </a>
  );
}
