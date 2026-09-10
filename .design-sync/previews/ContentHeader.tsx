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
 */

/** On a glossary term page. */
export const English = () => (
  <div style={{ maxWidth: 680 }}>
    <ContentHeader locale="en" path="/glossary/cac" />
  </div>
);

/** The same page in French — the switch now highlights FR and points back at EN. */
export const French = () => (
  <div style={{ maxWidth: 680 }}>
    <ContentHeader locale="fr" path="/glossary/cac" />
  </div>
);

/** On "How it works", which is the wider of the two content containers. */
export const HowItWorks = () => (
  <div style={{ maxWidth: 880 }}>
    <ContentHeader locale="en" path="/how-it-works" />
  </div>
);

/** At phone width, where the two ends sit closest together. */
export const Narrow = () => (
  <div style={{ maxWidth: 320 }}>
    <ContentHeader locale="fr" path="/about" />
  </div>
);
