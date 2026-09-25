import { DgMail, NightSurface } from "tour-de-growth";

/*
 * The CEO's mid-quarter email, inside the quarter report: a header line and
 * one message, at night. It is the private channel; the press clippings are
 * the public one, and they are on paper.
 */

const box = { padding: 20, maxWidth: 560 } as const;

/** The quarter is moving. */
export const Moving = () => (
  <NightSurface as="div" style={box}>
    <DgMail header="From: CEO · Subject: this week's numbers" body={'"It\'s moving. Keep going."'} />
  </NightSurface>
);

/** Stalled, in French — the longer message. */
export const StalledFrench = () => (
  <NightSurface as="div" style={box}>
    <DgMail
      header="De : DG · Objet : les chiffres de la semaine"
      body="« Je vois les chiffres de la semaine. Ça ne bouge pas assez. »"
    />
  </NightSurface>
);
