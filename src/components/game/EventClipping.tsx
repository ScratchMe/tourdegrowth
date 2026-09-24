import styles from "./EventClipping.module.css";

export type ClippingKind = "control" | "reports" | "viral" | "press" | "competitor";

export type EventClippingProps =
  | {
      /** A viral thread is a post, not an article: a handle and what it says. */
      kind: "viral";
      /** « @soiree_sans_fin » — fictional (GAME-BRIEF §8.3). */
      handle: string;
      text: string;
    }
  | {
      kind: Exclude<ClippingKind, "viral">;
      /** A fictional outlet (« Le Courrier de l'éco »), or SignalConso, the public platform the event names. */
      masthead: string;
      headline: string;
      text: string;
    };

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
 * The tilt is a static transform, not motion: it stays under
 * `prefers-reduced-motion`.
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
    </figure>
  );
}
