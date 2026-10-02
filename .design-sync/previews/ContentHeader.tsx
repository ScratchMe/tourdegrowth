import { ContentHeader } from "tour-de-growth";

/*
 * The header every content page wears: the wordmark home link on the left,
 * the language switch on the right. That is the whole component — it is
 * deliberately almost empty, because these pages are prose and the header's
 * job is to get out of the way.
 *
 * `path` is the page's address WITHOUT its language prefix: the switch needs
 * to send a reader to the same page in the other language, and only the
 * caller knows which page that is.
 *
 * The header spans the page; its row aligns to the page's own column —
 * `width="reading"` (760px, the default: every prose page, How it works and
 * the glossary alike, through `ProsePage`) or `wide` (the app shell's 1040px:
 * the engine's page, and the game's, which `ProsePage` sets wide because they
 * belong to a space — the band is the same width in the three).
 */

/** On a glossary term page: the header runs the card's width, its row sits on the 760px reading column, so both ends are inset. */
export const English = () => (
  <div style={{ maxWidth: 880 }}>
    <ContentHeader locale="en" path="/glossary/cac" />
  </div>
);

/** The same page in French — the switch now highlights FR and points back at EN. */
export const French = () => (
  <div style={{ maxWidth: 880 }}>
    <ContentHeader locale="fr" path="/glossary/cac" />
  </div>
);

/** At phone width, where the two ends sit closest together. */
export const Narrow = () => (
  <div style={{ maxWidth: 320 }}>
    <ContentHeader locale="fr" path="/about" />
  </div>
);

/**
 * On the engine's page: `width="wide"` puts the row on the app shell's column,
 * and the header of a space wears its band (here, ultramarine). At this card's
 * width the band is in its under-900px form — the legs' names go to screen
 * readers, the pictograms, numbers and "bientôt" stay; a window wide enough
 * for a band over ~950px shows the names too.
 */
export const InTheEngine = () => (
  <div style={{ maxWidth: 1040 }}>
    <ContentHeader locale="fr" path="/aarrr-funnel-template" width="wide" space="engine" />
  </div>
);
