import type { HTMLAttributes } from "react";
import styles from "./Bottleneck.module.css";
// Type-only, so it is erased at compile time and this component still pulls
// nothing from the scoring library into the browser bundle. One declaration
// rather than two that can drift apart — the resolver decides the states,
// this only renders them.
import type { Sharpness } from "@/lib/scoring/bottleneck";

export type { Sharpness };

export interface BottleneckPillar {
  /** Already-translated pillar name. Rendered uppercase, in the stencil face. */
  pillar: string;
  score: number;
}

export interface BottleneckProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Required, not defaulted. The bundle defaults it to `"clear"`; here a
   * caller has to say which claim the scores support, because defaulting to
   * the sharpest one is exactly the failure this prop exists to prevent.
   * Compute it with `resolveBottleneck` rather than by hand.
   */
  sharpness: Sharpness;
  /**
   * The sharpness line, already translated. Uppercase mono, ≤ 32 characters
   * so it holds one line at 390px.
   */
  label: string;
  /**
   * Lowest first. `clear` shows the first; `shared` shows all of them;
   * `level` shows none. The component re-applies that rule itself, so a
   * caller cannot hand `clear` three names and get three.
   */
  pillars?: readonly BottleneckPillar[];
  total?: number;
  /** The verdict sentence, already translated. Closes the block. */
  verdict: string;
  size?: "desktop" | "mobile";
  /** `roast` paints the pillar name red and does nothing else. */
  tone?: "straight" | "roast";
}

/**
 * The stage holding this product back, stamped inside the raised score card
 * directly under `ScoreDisplay` — design system extension 03, §1.
 *
 * It **replaces** the verdict line that used to float under the numeral: the
 * verdict sentence moves in here as the block's last line, so the reading
 * order is numeral → dashed rule → sharpness label → pillar name and score →
 * verdict. Use it once, and nowhere but inside that card.
 *
 * **Sharpness is the honesty mechanism.** A name set in 36px stencil is a
 * claim; `sharpness` is what says whether the scores support it. `clear`
 * names one stage, `shared` names every stage tied at the bottom, `level`
 * names none because nothing is behind.
 *
 * Never add a gauge, a bar, a confidence badge or an emoji. The score has to
 * stay re-explainable in ten seconds, and a name with a number out of 20 is
 * the whole claim.
 */
export function Bottleneck({
  sharpness,
  label,
  pillars = [],
  total = 20,
  verdict,
  size = "desktop",
  tone = "straight",
  className,
  ...rest
}: BottleneckProps) {
  const desktop = size === "desktop";
  const named = sharpness === "level" ? [] : sharpness === "clear" ? pillars.slice(0, 1) : pillars;

  return (
    <div
      className={[styles.wrap, desktop ? styles.desktop : styles.mobile, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className={[styles.label, named.length ? "" : styles.labelLevel].filter(Boolean).join(" ")}>
        {label}
      </div>
      {named.length ? (
        <div className={styles.names}>
          {named.map((p) => (
            <div className={styles.name} key={p.pillar}>
              <span
                className={[styles.pillar, tone === "roast" ? styles.pillarRoast : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.pillar}
              </span>
              <span className={styles.score}>
                <b>{p.score}</b>/{total}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.verdict} data-testid="score-verdict">
        {verdict}
      </div>
    </div>
  );
}
