import { NextLevel } from "tour-de-growth";

/*
 * The teaser for the next zone at the end of December: an eyebrow, the
 * zone's title with the dark patterns it will cover, and a status word. The
 * status is a word ("coming soon"), never only a greyed card.
 */

const box = { padding: 24, maxWidth: 720 } as const;

export const ComingSoon = () => (
  <div style={box}>
    <NextLevel
      eyebrow="Next level"
      title={'"How people find you": the countdown timer, the creeping price, the fake stock'}
      status="coming soon"
    />
  </div>
);

export const French = () => (
  <div style={box}>
    <NextLevel
      eyebrow="Niveau suivant"
      title="« Comment les gens vous trouvent » : le compte à rebours, le prix qui gonfle, le faux stock"
      status="bientôt"
    />
  </div>
);
