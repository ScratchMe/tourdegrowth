import type { CSSProperties } from "react";
import { stageProfile } from "@/lib/viz/stage-profile";
import styles from "./StageProfile.module.css";

export interface StageProfileStage {
  /** Printed under its column, e.g. « ACQ. ». */
  abbr: string;
  score: number;
  /** A stage the page names as holding the product back: red, and flagged. */
  hot: boolean;
}

export interface StageProfileProps {
  /** In AARRR order — the road runs left to right, the funnel's own order. */
  stages: readonly StageProfileStage[];
  total?: number;
  /** « Profil du parcours ». */
  title: string;
  /** What the height means, printed on the card: « hauteur = points manquants sur 20 ». */
  legend: string;
  /** The flag over a hot stage's summit: « HC », the Tour's hardest climbs. */
  flag: string;
  className?: string;
  "data-testid"?: string;
}

/** The page draws in a 0–100 space both ways; the plot's CSS gives it its pixels. */
const BOX = { width: 100, height: 100, top: 0, base: 100, floor: 5 } as const;

const at = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${y}%` });

/** « −8 », with a real minus sign; a stage at full marks reads « 0 », not « −0 ». */
const gap = (missing: number) => (missing ? `−${missing}` : "0");

/**
 * The stage profile — design I + B, retained by Antoine on 2026-09-28.
 *
 * The five AARRR stages drawn as a road book draws a stage: one climb per
 * stage, as high as the points it is missing, the stage that stalls in red
 * and flagged « HC ». It shows the SHAPE of the five scores; the pillar chips
 * under it give the numbers and are its table view, which is why the whole
 * figure is hidden from assistive technology — a screen reader gets the
 * chips, and the Bottleneck block above has already named the stage.
 *
 * One series in ink, one red for the diagnosis (DS v3 §5.5), every summit
 * labelled with its gap — the red never speaks alone: the flag, the bold red
 * label and the chip below all say it.
 *
 * Responsive the way `Sparkline` is: the SVG stretches a 0–100 `viewBox`
 * with non-scaling strokes, and every word is HTML placed in percent, so no
 * text scales with the width. The geometry (`lib/viz/stage-profile.ts`) is
 * pure, and the share image draws from the same function.
 */
export function StageProfile({
  stages,
  total = 20,
  title,
  legend,
  flag,
  className,
  "data-testid": testId,
}: StageProfileProps) {
  const profile = stageProfile(stages, total, BOX);

  return (
    <div
      className={[styles.card, className ?? ""].filter(Boolean).join(" ")}
      aria-hidden="true"
      data-testid={testId}
    >
      <div className={styles.cap}>
        <span className={styles.title}>{title}</span>
        <span>{legend}</span>
      </div>

      <div className={styles.plot}>
        <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <path className={styles.area} d={profile.area} />
          {profile.columns.map((c, i) => (c.hot ? <path key={i} className={styles.hotArea} d={c.area} /> : null))}
          <path className={styles.ridge} d={profile.ridge} vectorEffect="non-scaling-stroke" />
          {profile.columns.map((c, i) =>
            c.hot ? <path key={i} className={styles.hotRidge} d={c.ridge} vectorEffect="non-scaling-stroke" /> : null,
          )}
          <path className={styles.road} d="M0 100H100" vectorEffect="non-scaling-stroke" />
        </svg>

        {profile.columns.slice(1).map((c) => (
          <span key={c.x0} className={styles.tick} style={{ left: `${c.x0}%` }} />
        ))}

        {profile.columns.map((c, i) =>
          c.hot ? (
            <span key={i} className={styles.flag} style={at(c.peakX, c.peakY)} data-hot="true">
              {flag}
              <span className={styles.gapHot}>{gap(c.missing)}</span>
            </span>
          ) : (
            <span key={i} className={styles.gap} style={at(c.peakX, c.peakY)}>
              {gap(c.missing)}
            </span>
          ),
        )}
      </div>

      <div className={styles.labels}>
        {profile.columns.map((c, i) => (
          <span
            key={i}
            className={[styles.label, c.hot ? styles.labelHot : ""].filter(Boolean).join(" ")}
            style={{ left: `${c.peakX}%` }}
          >
            {stages[i]!.abbr}
          </span>
        ))}
      </div>
    </div>
  );
}
