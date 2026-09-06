import * as React from "react";

/**
 * Header language switch: a compact Segmented of two links, the current language filled ink.
 * @startingPoint section="Brand" subtitle="EN current · FR current" viewport="320x120"
 */
export interface LocaleSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The page's language. Drives the filled segment and the group name ("Language" / "Langue"). */
  current?: "en" | "fr";
  /** Destination of each segment — the same page in the other language. Real URLs, not handlers. */
  hrefs?: { en: string; fr: string };
}

export declare function LocaleSwitcher(props: LocaleSwitcherProps): JSX.Element;
