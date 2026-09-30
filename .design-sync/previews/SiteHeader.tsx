import { LocaleSwitcher, SiteHeader, WordmarkLink } from "tour-de-growth";

/*
 * The site header: the wordmark on the left, the page's own controls on the
 * right, one row — the five headers of the product (landing, content pages,
 * result, quiz, Deep dive) are this one component. It sticks to the top of
 * the window on frosted paper, 92% opaque so its row stays AA over anything
 * that scrolls under it. On a page that belongs to one of the three spaces,
 * the space band hangs from it and is its bottom edge; elsewhere, the dashed
 * rule it always had.
 */

/**
 * On the result: the Tour's band, the row on the app shell's width. At this
 * card's width the band is in its under-900px form (a container query on the
 * band, not the window): the legs' names go to screen readers, pictograms,
 * numbers and "bientôt" stay. Over ~950px of band they show — see SpaceBand.
 */
export const WithBand = () => (
  <div style={{ maxWidth: 1040 }}>
    <SiteHeader locale="fr" space="tour">
      <WordmarkLink locale="fr" />
      <LocaleSwitcher locale="fr" />
    </SiteHeader>
  </div>
);

/** On a glossary page: no space, the dashed rule. */
export const Plain = () => (
  <div style={{ width: 760 }}>
    <SiteHeader locale="en" width="reading">
      <WordmarkLink locale="en" />
      <LocaleSwitcher locale="en" path="/glossary/cac" />
    </SiteHeader>
  </div>
);

/** A phone. */
export const Phone = () => (
  <div style={{ width: 390 }}>
    <SiteHeader locale="fr" space="game" width="reading">
      <WordmarkLink locale="fr" />
      <LocaleSwitcher locale="fr" path="/game" />
    </SiteHeader>
  </div>
);
