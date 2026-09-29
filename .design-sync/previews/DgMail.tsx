import { DgMail, NightSurface } from "tour-de-growth";

/*
 * The CEO's mid-quarter email, inside the quarter report: a header line and
 * one message, at night. It is the private channel; the press clippings are
 * the public one, and they are on paper. The body is the event's sentence
 * exactly as the level journals it (`events.midMailMoving` /
 * `events.midMailStalled` in content/game/retention.ts), lead-in included.
 */

const box = { padding: 20, maxWidth: 560 } as const;

/** The quarter is moving: the first quarter of reference year C (the dark path). */
export const Moving = () => (
  <NightSurface as="div" style={box}>
    <DgMail header={"From: CEO · Subject: this week's numbers"} body={"Message from the CEO, mid-quarter: \"It's moving. Keep going.\""} />
  </NightSurface>
);

/** Stalled, in French — the longer message: the first quarter of reference year A. */
export const StalledFrench = () => (
  <NightSurface as="div" style={box}>
    <DgMail header={"De : DG · Objet : les chiffres de la semaine"} body={"Message du DG, à mi-trimestre : « Je vois les chiffres de la semaine. Ça ne bouge pas assez. »"} />
  </NightSurface>
);
