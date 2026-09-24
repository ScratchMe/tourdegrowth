import type { ReactNode } from "react";
import { meterPct } from "@/lib/viz/bullet";
import styles from "./StatTile.module.css";

export interface StatTileDelta {
  /**
   * Already formatted, and it must carry BOTH a sign and a word
   * ("−0,4 pt · mieux", "+1 200 abonnés"): the change is never told by color
   * alone. Use U+2212 (−) for a minus, not a hyphen.
   */
  text: string;
  direction: "up" | "down" | "flat";
  /**
   * Whether this change is good news. Color = direction × sentiment: a churn
   * that goes down is good, a revenue that goes down is bad, and only the
   * caller knows which. `flat` is never colored — nothing changed, so
   * nothing is good or bad. Absent: muted.
   */
  sentiment?: "good" | "bad";
}

export interface StatTileBar {
  /** 0–100, clamped. `null` = not measured: the track is hatched, never drawn empty (an empty bar reads as zero). */
  value: number | null;
  /** `good`/`bad` color the fill; the tile's text must still say which (e.g. "à bout"), color only repeats it. */
  tone: "good" | "bad" | "neutral";
}

interface StatTileBase {
  /** Already-translated label. Rendered uppercase mono. */
  label: string;
  /**
   * `hero` = the stencil figure (48px, 30px under 760px): the one tile a
   * dashboard is about, like the score numeral. `md` = mono 20px. `compact` =
   * mono 17px, for a dense mobile grid.
   */
  size?: "hero" | "md" | "compact";
  className?: string;
  "data-testid"?: string;
}

interface StatTileKnown extends StatTileBase {
  hidden?: false;
  /** Already formatted by the caller, with the same formatter everywhere the number appears. */
  value: string;
  unknownLabel?: never;
  sub?: string;
  delta?: StatTileDelta;
  bar?: StatTileBar;
  /** Lifts the blur a `hidden` tile was showing, once (`--dur-reveal`, 600ms by default). Off under reduced motion. */
  revealing?: boolean;
  /** A small chart under the figure — a mini `BulletChart`, never a second number. */
  children?: ReactNode;
}

interface StatTileUnknown extends StatTileBase {
  hidden?: false;
  /** Not measured. Renders a long dash and `unknownLabel` — never a zero, which would be a measurement. */
  value: null;
  /** Required with `value: null`: the dash alone says nothing to a screen reader. */
  unknownLabel: string;
  sub?: string;
  delta?: never;
  bar?: StatTileBar;
  revealing?: never;
  children?: ReactNode;
}

interface StatTileHidden extends StatTileBase {
  hidden: true;
  /**
   * The tile does not accept a value at all in this state — not in the text,
   * not in an attribute. The number is meant to be unknown to the player
   * until it is revealed, and a value that is in the DOM is known to anyone
   * who opens devtools.
   */
  value?: never;
  /** Shown sharp, at full opacity, under the blurred decoy ("pas sur ton dashboard"). */
  hiddenLabel: string;
  /** Read by screen readers only ("masquée jusqu'en décembre"), for what the decoy says to sighted readers. */
  hiddenNote?: string;
  sub?: never;
  delta?: never;
  bar?: never;
  revealing?: never;
  children?: never;
}

export type StatTileProps = StatTileKnown | StatTileUnknown | StatTileHidden;

/**
 * One figure, its label, and what it did since last time — DS v3 §5.7.
 *
 * Three states. **Known**: the caller's formatted string, an optional signed
 * delta and a meter. **Unknown** (`value: null`): a long dash and a "not
 * measured" label, and a hatched meter if there is one. **Hidden**: a blurred,
 * `aria-hidden` decoy (two digit-shaped blocks and a fake bar) with
 * `hiddenLabel` sharp under it — you can see there is something, you cannot
 * read it. The real value is
 * never in the DOM in that state; `revealing` then plays the blur off once
 * the value arrives.
 *
 * Colors come only from semantic tokens, so the same tile reads in
 * `data-world="paper"` and `data-world="night"`. Nothing is carried by color
 * alone: the delta has a sign and a word, the meter's tone repeats text the
 * caller has written.
 *
 * A tile is a flat panel, never raised — a dashboard is a row of equals.
 */
export function StatTile(props: StatTileProps) {
  const { label, size = "md", className, "data-testid": testId } = props;
  const classes = [styles.tile, styles[size], className ?? ""].filter(Boolean).join(" ");

  if (props.hidden) {
    return (
      <div className={classes} data-testid={testId} data-state="hidden">
        <div className={styles.label}>{label}</div>
        {/*
         * The decoy is shapes, not text: two digit-sized blocks where a "00"
         * would be. Blurred text is still text — axe measures its contrast
         * (and fails it, by design at 50% opacity) — while a shape carries
         * the same "there is a number here" without being a string anyone
         * could select, copy or read aloud.
         */}
        <div className={styles.decoy} aria-hidden="true">
          <span className={`${styles.value} ${styles.decoyFigure}`}>
            <span />
            <span />
          </span>
          <span className={styles.decoyBar} />
        </div>
        <div className={styles.hiddenLabel}>{props.hiddenLabel}</div>
        {props.hiddenNote ? <span className="tdg-visually-hidden">{props.hiddenNote}</span> : null}
      </div>
    );
  }

  const unknown = props.value === null;
  const { sub, delta, bar, children } = props;
  const revealing = !unknown && props.revealing;

  return (
    <div className={classes} data-testid={testId} data-state={unknown ? "unknown" : "known"}>
      <div className={styles.label}>{label}</div>
      <div className={[styles.figure, revealing ? styles.revealing : ""].filter(Boolean).join(" ")}>
        {unknown ? (
          <>
            <span className={`${styles.value} ${styles.dash}`} aria-hidden="true">
              —
            </span>
            <span className={styles.unknownLabel}>{props.unknownLabel}</span>
          </>
        ) : (
          <span className={styles.value}>{props.value}</span>
        )}
        {delta ? (
          <span
            className={[styles.delta, delta.direction !== "flat" && delta.sentiment ? styles[delta.sentiment] : ""]
              .filter(Boolean)
              .join(" ")}
            data-direction={delta.direction}
          >
            {delta.text}
          </span>
        ) : null}
      </div>
      {bar ? (
        <div className={[styles.track, revealing ? styles.revealing : ""].filter(Boolean).join(" ")} aria-hidden="true">
          {bar.value === null ? (
            <span className={styles.hatch} />
          ) : (
            <span className={`${styles.fill} ${styles[bar.tone]}`} style={{ width: `${meterPct(bar.value)}%` }} />
          )}
        </div>
      ) : null}
      {sub ? <div className={styles.sub}>{sub}</div> : null}
      {children}
    </div>
  );
}
