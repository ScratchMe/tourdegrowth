import { SiteFooter } from "tour-de-growth";

/*
 * On every content page and on both 404s — a dead shared link is a real entry
 * point, and the one thing it must not be is a cul-de-sac.
 *
 * Deliberately NOT on the quiz or the deep dive: those are the two flows the
 * product exists to get finished, and a row of exits halfway through fifteen
 * questions works against that.
 *
 * The CV link is followable on purpose — no `nofollow`, and `noopener`
 * WITHOUT `noreferrer`, so the destination's analytics can attribute the
 * visit. That attribution is the entire reason the link exists.
 */

/** `wide` matches the landing container. */
export const Wide = () => (
  <div style={{ maxWidth: 880 }}>
    <SiteFooter locale="en" width="wide" />
  </div>
);

/** `reading` matches the narrower prose pages — glossary, About, the legal pages. */
export const Reading = () => (
  <div style={{ maxWidth: 680 }}>
    <SiteFooter locale="en" width="reading" />
  </div>
);

/** In French, where the nav labels and the credit sentence both change length. */
export const French = () => (
  <div style={{ maxWidth: 680 }}>
    <SiteFooter locale="fr" width="reading" />
  </div>
);
