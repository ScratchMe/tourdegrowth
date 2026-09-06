import * as React from "react";

export interface FooterLink {
  label: string;
  href: string;
}

/**
 * Site footer: dashed rule, two nav links, one mono credit line. Aligns to the page container.
 * @startingPoint section="Brand" subtitle="wide (landing/result) and reading (prose pages)" viewport="1040x180"
 */
export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** wide = --width-desktop (landing, result, 404) · reading = --width-reading (How it works, glossary) */
  width?: "wide" | "reading";
  /** Exactly the internal links: How it works, Glossary. */
  links: FooterLink[];
  /** Credit sentence with the CV link inside, e.g. "A side project by <a>Antoine Berthaud — Senior Growth PM</a>." */
  credit: React.ReactNode;
}

export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
