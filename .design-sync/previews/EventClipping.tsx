import { EventClipping, NightSurface } from "tour-de-growth";

/*
 * A public event of the quarter, as the outside world printed it: a paper
 * clipping, slightly tilted, nested inside the night. `data-world="paper"`
 * rebinds the tokens back to paper, so the press reads on paper while the
 * dashboard stays dark — the dashboard hides the cost, the press shows it
 * first. Mastheads and handles are fictional, except SignalConso, the
 * public platform the event names. The tilt is static, so it stays under
 * reduced motion. Copy: content/game/retention.ts.
 */

const grid = {
  padding: 24,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 300px))",
  gap: 24,
  alignItems: "start",
} as const;

/** The five kinds side by side: four articles and one viral post. */
export const AllKinds = () => (
  <NightSurface as="div" style={grid}>
    <EventClipping
      kind="control"
      masthead="The Business Courier"
      headline="Flixo caught out by the French consumer watchdog"
      text="An inspection by the DGCCRF, France's consumer protection authority, an article in the press, a fine of €450,000."
    />
    <EventClipping
      kind="reports"
      masthead="SignalConso"
      headline="Complaints against Flixo pile up"
      text="Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions."
    />
    <EventClipping
      kind="viral"
      handle="@endless_evening"
      text={'"I tried to cancel Flixo, here are my three hours." Cancellations speed up.'}
    />
    <EventClipping
      kind="press"
      masthead="The Screen Echo"
      headline="Flixo, the app that lets you leave"
      text="Flixo, the app that lets its subscribers leave, and sees them come back. Sign-ups climb."
    />
    <EventClipping
      kind="competitor"
      masthead="The Streaming Letter"
      headline="A price offensive in the spring"
      text="A competitor launched an aggressive offer in the spring. Everyone lost subscribers this quarter, you included."
    />
  </NightSurface>
);

/** One clipping in French, at the width the report gives it. */
export const French = () => (
  <NightSurface as="div" style={{ padding: 24, maxWidth: 360 }}>
    <EventClipping
      kind="control"
      masthead="Le Courrier de l'éco"
      headline="Flixo épinglé par la répression des fraudes"
      text="Contrôle de la DGCCRF, article dans la presse, amende de 450 000 €. Le DG te demande de tout retirer avant vendredi."
    />
  </NightSurface>
);
