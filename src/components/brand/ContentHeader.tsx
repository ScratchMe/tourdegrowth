import type { Locale } from "@/lib/i18n/locale";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteHeader } from "./SiteHeader";
import type { Space } from "./SpaceBand";
import { WordmarkLink } from "./WordmarkLink";

export interface ContentHeaderProps {
  locale: Locale;
  /** This page's path without the locale prefix, e.g. "/glossary/cac" — what the language switch links to in the other language. */
  path: string;
  /** Passed through to the language switch — see `LocaleSwitcher`. */
  switchQuery?: string;
  /**
   * The width the header's inner row aligns to — the page's own content
   * column, like `SiteFooter`'s. `reading` (760px) for the prose pages;
   * `wide` (the app shell's 1040px) for a page whose body is a tool, where a
   * header narrower than the content under it reads as misaligned, and for
   * every page of a space: its band is the same width in the three spaces,
   * and names the race's legs only over 900px (`ProsePage` passes it).
   */
  width?: "reading" | "wide";
  /**
   * The space this page belongs to — the engine's page, the game's hub and
   * levels. Hangs the space band under the row (`SpaceBand`). The glossary,
   * How it works and the other reading pages belong to none and have no band.
   */
  space?: Space;
}

/**
 * The header shared by the content pages (REVIEW-02.md R2-05): the wordmark
 * and the language switch, on the site header (`SiteHeader`). One component
 * rather than the same two lines pasted into each page module, so the next
 * thing added to this header — a nav link, a CTA — is added once and laid
 * out once. Server Component: nothing here is interactive.
 */
export function ContentHeader({ locale, path, switchQuery, width = "reading", space }: ContentHeaderProps) {
  return (
    <SiteHeader locale={locale} width={width} space={space}>
      <WordmarkLink locale={locale} />
      <LocaleSwitcher locale={locale} path={path} switchQuery={switchQuery} />
    </SiteHeader>
  );
}
