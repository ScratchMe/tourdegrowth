import * as React from "react";
import { NightSurface, QuarterNews } from "tour-de-growth";

/*
 * The quarter's news, one card at a time, over the whole screen (Antoine,
 * 2026-09-26): the verdict first, then what happened inside and outside,
 * then the CEO's word, and only then the report underneath. The system's one
 * modal — a native <dialog>, Escape is « Skip to the report ».
 *
 * In the product it opens with `showModal()`, which lifts it into the top
 * layer over everything. On a canvas that shows several stories at once,
 * every story would cover every other card. So each story mounts it inside
 * a transformed, clipped frame standing in for the screen, and `InFrame`
 * shadows `showModal` on that one dialog instance before the component's own
 * effect runs: the component then takes its documented fallback (`open`, a
 * fixed layer), which the frame contains. The prototype is untouched.
 *
 * A still shows the FIRST card: the others arrive one by one with Next, and
 * each has its own component and preview (DgMail, EventClipping, DgFace).
 * The entrance, the shake and the stamp are motion. Copy:
 * content/game/retention.ts; numbers from the real level, as QuarterReport's
 * preview uses them.
 */

const noop = () => {};

const frame = {
  position: "relative",
  transform: "translateZ(0)",
  overflow: "hidden",
  width: "100%",
  maxWidth: 760,
  height: 720,
  border: "1px dashed #d6d3d1",
  borderRadius: 6,
} as const;

function InFrame({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  // A layout effect runs before any passive effect, so this lands before
  // QuarterNews's own `useEffect` reads `showModal`.
  React.useLayoutEffect(() => {
    const dialog = ref.current?.querySelector("dialog");
    if (dialog) Object.defineProperty(dialog, "showModal", { value: undefined, configurable: true });
  }, []);
  return (
    <div ref={ref} style={frame}>
      <NightSurface as="div">{children}</NightSurface>
    </div>
  );
}

const labels = { next: "Next →", finish: "See the quarter's report →", skip: "Skip to the report" };
/** « 1 of 3 », one per card, like the island fills them (content/game/retention.ts: news.progress). */
const progressOf = (total: number, word: string) => Array.from({ length: total }, (_, i) => `${i + 1} ${word} ${total}`);

/**
 * Quarter 1, missed by 0.1 pt: the number the quarter is judged on, as big as
 * the screen carries it, its status in words (the colour repeats it), and the
 * three other figures underneath.
 */
export const TheVerdict = () => (
  <InFrame>
    <QuarterNews
      q={1}
      eyebrow="End of the quarter"
      period="Quarter 1 · January to March"
      items={[
        {
          kind: "result",
          label: "The verdict",
          metric: "Churn",
          value: "5.7%",
          note: "target 5.6%",
          status: { text: "missed by 0.1 pt", tone: "bad" },
          figures: [
            { key: "subs", label: "Subscribers", value: "98,904" },
            { key: "mrr", label: "Revenue", value: "€1.28M" },
            { key: "patience", label: "CEO's patience", value: "58" },
          ],
        },
        { kind: "mail", label: "Mid-quarter", mail: { header: "From: CEO · Subject: this week's numbers", body: '"It\'s moving. Keep going."' } },
        { kind: "boss", label: "The CEO's word", line: '"That\'s not what we agreed."', mood: "firm" },
      ]}
      progress={progressOf(3, "of")}
      labels={labels}
      onDone={noop}
    />
  </InFrame>
);

/**
 * An inspection lands: the one card where the screen shakes, with the
 * clipping stamped. Passed as the first card here so a still can show it.
 */
export const AnInspection = () => (
  <InFrame>
    <QuarterNews
      q={3}
      eyebrow="End of the quarter"
      period="Quarter 3 · July to September"
      items={[
        {
          kind: "clipping",
          label: "Meanwhile, outside",
          clipping: {
            kind: "control",
            masthead: "The Business Courier",
            headline: "Flixo caught out by the French consumer watchdog",
            text: "An inspection by the DGCCRF, France's consumer protection authority, an article in the press, a fine of €450,000.",
            stamp: { text: "Fined · €450,000", tone: "bad" },
          },
        },
        { kind: "boss", label: "The CEO's word", line: '"I don\'t know how much longer I can cover for you."', mood: "angry" },
      ]}
      progress={progressOf(2, "of")}
      labels={labels}
      onDone={noop}
    />
  </InFrame>
);

/** The verdict in French, target hit: the stamp in the good tone. */
export const French = () => (
  <InFrame>
    <QuarterNews
      q={4}
      eyebrow="Fin du trimestre"
      period="Trimestre 4 · octobre à décembre"
      items={[
        {
          kind: "result",
          label: "Le verdict",
          metric: "Résiliations",
          value: "3,9 %",
          note: "objectif 4,0 %",
          status: { text: "objectif atteint", tone: "good" },
          figures: [
            { key: "subs", label: "Abonnés", value: "92 140" },
            { key: "mrr", label: "Revenus", value: "1,24 M€" },
            { key: "patience", label: "Patience du DG", value: "74" },
          ],
        },
        { kind: "boss", label: "Le mot du DG", line: "« Bien joué. »", mood: "calm" },
      ]}
      progress={progressOf(2, "sur")}
      labels={{ next: "Suivant →", finish: "Voir le bilan du trimestre →", skip: "Passer au bilan" }}
      onDone={noop}
    />
  </InFrame>
);
