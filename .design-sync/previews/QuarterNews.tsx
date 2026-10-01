import * as React from "react";
import { DgFace, NightSurface, QuarterNews } from "tour-de-growth";

/*
 * The quarter's news, one card at a time, over the whole screen (Antoine,
 * 2026-09-26), in the island's order (island-view.ts `newsContent`): the
 * CEO's mid-quarter email — he writes one every quarter —, the verdict, what
 * happened on the team, the clippings, then the CEO's word — and only then
 * the report underneath. The system's one modal — a native <dialog>, Escape
 * is "Skip to the report".
 *
 * In the product it opens with `showModal()`, which lifts it into the top
 * layer over everything. On a canvas that shows several stories at once,
 * every story would cover every other card. So each story mounts it inside
 * a transformed, clipped frame standing in for the screen, and `InFrame`
 * shadows `showModal` on that one dialog instance before the component's own
 * effect runs: the component then takes its documented fallback (`open`, a
 * fixed layer), which the frame contains. The prototype is untouched.
 *
 * Every story passes the quarter's REAL items, played through the reducer
 * (lib/game/__tests__/paths.ts) and built by `newsContent`, so the dots and
 * the "n of N" count are the product's. The component opens on the first
 * card (the mail); `InFrame` then presses Next the number of times named in
 * `startAt`, exactly as a reader would, so the still lands on the card the
 * story is about. The entrance, the shake and the stamp are motion.
 */

const noop = () => {};

const frame = {
  position: "relative",
  transform: "translateZ(0)",
  overflow: "hidden",
  width: "100%",
  maxWidth: 760,
  // The capture is 700px tall and the card sits under 24px of padding: the
  // whole frame, its footer included, stays inside the still.
  height: 652,
  border: "1px dashed #d6d3d1",
  borderRadius: 6,
} as const;

function InFrame({ startAt = 0, children }: { startAt?: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  // A layout effect runs before any passive effect, so this lands before
  // QuarterNews's own `useEffect` reads `showModal`.
  React.useLayoutEffect(() => {
    const dialog = ref.current?.querySelector("dialog");
    if (dialog) Object.defineProperty(dialog, "showModal", { value: undefined, configurable: true });
  }, []);
  // A parent's passive effect runs after its children's: the dialog is open
  // and its primary button focused. Press Next as a reader would.
  React.useEffect(() => {
    const next = ref.current?.querySelector<HTMLButtonElement>("[data-news-primary]");
    for (let i = 0; i < startAt; i++) next?.click();
  }, [startAt]);
  return (
    <div ref={ref} style={frame}>
      <NightSurface as="div">{children}</NightSurface>
    </div>
  );
}

/**
 * Quarter 1 missed by 0.1 pts (paths.ts PATH_FIRED_DARK): the verdict, card
 * 2 of 3, after the CEO's mid-quarter mail. The number the quarter is judged
 * on, as big as the screen carries it, its status in words (the colour
 * repeats it), and the three other figures underneath.
 */
export const TheVerdict = () => (
  <InFrame startAt={1}>
    <QuarterNews
      q={1}
      eyebrow="End of the quarter"
      period="Quarter 1 · January to March"
      items={[
        { kind: "mail", label: "Mid-quarter", mail: { header: "From: CEO · Subject: this week's numbers", body: "Message from the CEO, mid-quarter: \"It's moving. Keep going.\"" } },
        { kind: "result", label: "The verdict", metric: "Churn", value: "5.7%", note: "target 5.6%", status: { text: "missed by 0.1 pts", tone: "bad" }, figures: [{ key: "customers", label: "Subscribers", value: "98,756" }, { key: "revenue", label: "Revenue", value: "€1.28M" }, { key: "patience", label: "CEO's patience", value: "53" }] },
        { kind: "boss", label: "The CEO's word", line: "The CEO: \"That's not what we agreed.\"", mood: "angry", face: <DgFace mood="angry" framing="avatar" /> },
      ]}
      progress={["1 of 3", "2 of 3", "3 of 3"]}
      labels={{ next: "Next →", finish: "See the quarter's report →", skip: "Skip to the report" }}
      onDone={noop}
    />
  </InFrame>
);

/**
 * An inspection lands (paths.ts PATH_C, quarter 3): card 3 of 5, after the
 * mail and the verdict — the one card where the screen shakes, the clipping
 * stamped with the fine (€75,000, the legal maximum whatever the radar — C14, A7.8), and its "why" on
 * the clipping itself, naming every trick taken down. It is longer than
 * this frame: as on a short screen, the dialog scrolls and the count and
 * Next stay stuck to its bottom, so the still shows the card's top.
 */
export const AnInspection = () => (
  <InFrame startAt={2}>
    <QuarterNews
      q={3}
      eyebrow="End of the quarter"
      period="Quarter 3 · July to September"
      items={[
        { kind: "mail", label: "Mid-quarter", mail: { header: "From: CEO · Subject: this week's numbers", body: "Message from the CEO, mid-quarter: \"I can see this week's numbers. It isn't moving enough.\"" } },
        { kind: "result", label: "The verdict", metric: "Churn", value: "5.0%", note: "target 4.6%", status: { text: "missed by 0.4 pts", tone: "bad" }, figures: [{ key: "customers", label: "Subscribers", value: "93,304" }, { key: "revenue", label: "Revenue", value: "€1.27M" }, { key: "patience", label: "CEO's patience", value: "57" }] },
        { kind: "clipping", label: "Meanwhile, outside", clipping: { kind: "control", masthead: "The Business Courier", headline: "Flixo caught out by the French consumer watchdog", text: "An inspection by the DGCCRF, France's consumer protection authority, an article in the press, a fine of €75,000. The CEO asks you to take everything down by Friday. 1,400 subscribers leave on the spot, and tell everyone why.", why: { heading: "Why this inspection", lines: ["Every trick you put into production pushed up the regulator radar, the hidden tile on your dashboard. This quarter it crossed the inspection threshold.", "In production when the inspectors came: \"Pause up front\", \"Declutter the subscription page\", \"Assisted cancellation\", \"Retention offers\", \"Social proof at exit\" and \"Contractual notice\". All of it is taken down on the spot, and its effect stops."] }, stamp: { text: "Fined · €75,000", tone: "bad" } } },
        { kind: "clipping", label: "Meanwhile, outside", clipping: { kind: "viral", handle: "@endless_evening", text: "A viral thread: \"I tried to cancel Flixo, here are my three hours.\" Cancellations speed up.", stamp: { text: "Viral", tone: "bad" } } },
        { kind: "boss", label: "The CEO's word", line: "The CEO: \"That's not what we agreed.\" \"Thanks for doing what I asked.\"", mood: "angry", face: <DgFace mood="angry" framing="avatar" /> },
      ]}
      progress={["1 of 5", "2 of 5", "3 of 5", "4 of 5", "5 of 5"]}
      labels={{ next: "Next →", finish: "See the quarter's report →", skip: "Skip to the report" }}
      onDone={noop}
    />
  </InFrame>
);

/** The verdict in French, target hit (paths.ts PATH_A, quarter 4), card 2 sur 5: the stamp in the good tone. */
export const French = () => (
  <InFrame startAt={1}>
    <QuarterNews
      q={4}
      eyebrow="Fin du trimestre"
      period="Trimestre 4 · octobre à décembre"
      items={[
        { kind: "mail", label: "À mi-trimestre", mail: { header: "De : DG · Objet : les chiffres de la semaine", body: "Message du DG, à mi-trimestre : « Ça bouge. Continue. »" } },
        { kind: "result", label: "Le verdict", metric: "Résiliations", value: "4,0 %", note: "objectif 4,0 %", status: { text: "objectif atteint", tone: "good" }, figures: [{ key: "customers", label: "Abonnés", value: "105 632" }, { key: "revenue", label: "Revenu", value: "1,33 M€" }, { key: "patience", label: "Patience du DG", value: "73" }] },
        { kind: "note", label: "Dans ton équipe", text: "Ta présentation au DG a tenu : des données, une courbe, une demande de temps. Il t'en donne." },
        { kind: "clipping", label: "Pendant ce temps, dehors", clipping: { kind: "press", masthead: "L'Écho des écrans", headline: "Flixo, l'appli qui laisse partir", text: "Un article : « Flixo, l'appli qui laisse partir ses abonnés, et qui les voit revenir. » Les inscriptions montent.", stamp: { text: "À la une", tone: "good" } } },
        { kind: "boss", label: "Le mot du DG", line: "Le DG : « Bien joué. » « Tu n'as pas fait ce que j'ai demandé. Je l'ai noté. »", mood: "firm", face: <DgFace mood="firm" framing="avatar" /> },
      ]}
      progress={["1 sur 5", "2 sur 5", "3 sur 5", "4 sur 5", "5 sur 5"]}
      labels={{ next: "Suivant →", finish: "Voir le bilan du trimestre →", skip: "Passer au bilan" }}
      onDone={noop}
    />
  </InFrame>
);
