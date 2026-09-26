import styles from "./EventClipping.module.css";

export type ClippingKind = "control" | "reports" | "viral" | "press" | "competitor";

/** What the event means for the player — « Pourquoi ce contrôle » and its lines. */
export interface ClippingWhy {
  heading: string;
  lines: readonly string[];
}

/**
 * The news screen's rubber stamp across the clipping (« Amende · 97 500 € »).
 * Decorative: it repeats what the clipping says, so it is hidden from
 * assistive technology. `good` for the one kind article.
 */
export interface ClippingStamp {
  text: string;
  tone: "bad" | "good";
}

interface ClippingExtras {
  why?: ClippingWhy;
  stamp?: ClippingStamp;
}

export type EventClippingProps =
  | ({
      /** A viral thread is a post, not an article: a handle and what it says. */
      kind: "viral";
      /** « @soiree_sans_fin » — fictional (GAME-BRIEF §8.3). */
      handle: string;
      text: string;
    } & ClippingExtras)
  | ({
      kind: Exclude<ClippingKind, "viral">;
      /** A fictional outlet (« Le Courrier de l'éco »), or SignalConso, the public platform the event names. */
      masthead: string;
      headline: string;
      text: string;
    } & ClippingExtras);

/**
 * A public event of the quarter, as the outside world printed it — game plan
 * §1.4 (La Bataille's newspaper clipping, the one staging idea it takes) and
 * §2.6.
 *
 * It is PAPER, nested inside the night: `data-world="paper"` rebinds every
 * semantic token back to the paper world (world-night.css), and the clipping
 * paints its own ground and ink, because both are inherited as computed
 * values from the night around it. That is the thesis in one gesture: the
 * dashboard hides the cost, and the press, on paper, shows it first.
 *
 * `why` says what the event means — an inspection names the tricks it took
 * down and the hidden tile that brought it (Antoine, 2026-09-26: « on ne
 * comprend pas pourquoi ça arrive »). The stamp only lands on the news screen.
 *
 * The tilt is a static transform, not motion: it stays under
 * `prefers-reduced-motion`. The stamp's slam is motion, and motion.css
 * switches it off there — it is drawn in its final place either way.
 */
export function EventClipping(props: EventClippingProps) {
  return (
    <figure data-world="paper" className={styles.clipping} data-kind={props.kind}>
      {props.kind === "viral" ? (
        <>
          <figcaption className={styles.handle}>{props.handle}</figcaption>
          <p className={styles.post}>{props.text}</p>
        </>
      ) : (
        <>
          <figcaption className={styles.masthead}>{props.masthead}</figcaption>
          <p className={styles.headline}>{props.headline}</p>
          <p className={styles.text}>{props.text}</p>
        </>
      )}
      {props.stamp ? (
        <span className={styles.stamp} data-tone={props.stamp.tone} aria-hidden="true" data-testid="game-clipping-stamp">
          {props.stamp.text}
        </span>
      ) : null}
      {props.why ? (
        <div className={styles.why} data-testid="game-clipping-why">
          <p className={styles.whyHeading}>{props.why.heading}</p>
          {props.why.lines.map((line) => (
            <p key={line} className={styles.whyLine}>
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </figure>
  );
}
