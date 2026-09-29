import type { CSSProperties } from "react";
import { stageProfile } from "@/lib/viz/stage-profile";
import styles from "./HubMountain.module.css";

export interface HubMountainZone {
  /** A zone with a level to play: filled ochre, its number on a flag. */
  open: boolean;
}

export interface HubMountainProps {
  /** One per zone, in AARRR order — the road runs left to right, the Tour's own order. */
  zones: readonly HubMountainZone[];
  /** « Profil de la montagne ». */
  title: string;
  /** « cinq cols, cinq entreprises ». */
  legend: string;
  className?: string;
  "data-testid"?: string;
}

/**
 * How high each climb is, in points out of 20 — a drawing, not a measure:
 * the legend never says what a height means, and nothing on the hub is
 * scored. Chosen for a mountain leg's silhouette (the third col, retention,
 * the summit of the day) and fixed, so the poster is the same for everyone.
 */
const HEIGHTS = [9, 12, 17, 11, 14] as const;

/** The same 0–100 space as `StageProfile`: the plot's CSS gives it its pixels. */
const BOX = { width: 100, height: 100, top: 0, base: 100, floor: 5 } as const;

const at = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${y}%` });

/**
 * The game hub's mountain — design I + B, retained by Antoine on 2026-09-28.
 *
 * « Le côté obscur » is the race's mountain leg, and its hub is set as a
 * night poster: five cols for the five zones, the one you can play filled in
 * the game's ochre and flagged with its number, the others tagged with
 * theirs, an amber moon over the first. The road book the result page draws
 * (`viz/StageProfile`), read in the other world: the geometry is the same
 * pure function (`lib/viz/stage-profile.ts`), the heights are a drawing.
 *
 * Decoration only, hidden from assistive technology: the zone list under it
 * says everything the picture does, in words — which zone is open, which
 * says « Bientôt ». The ochre never speaks alone either: the flag carries the
 * number, and the list carries the state.
 *
 * Reads the night world's tokens (`--viz-ink`, `--surface-inverse`…), so it
 * belongs inside a `[data-world="night"]` block — the hub's intro.
 */
export function HubMountain({ zones, title, legend, className, "data-testid": testId }: HubMountainProps) {
  const profile = stageProfile(
    zones.map((z, i) => ({ score: 20 - HEIGHTS[i % HEIGHTS.length]!, hot: z.open })),
    20,
    BOX,
  );

  return (
    <div
      className={[styles.mountain, className ?? ""].filter(Boolean).join(" ")}
      aria-hidden="true"
      data-testid={testId}
    >
      <div className={styles.cap}>
        <span className={styles.title}>{title}</span>
        <span>{legend}</span>
      </div>

      <div className={styles.plot}>
        <span className={styles.moon} />
        <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <path className={styles.area} d={profile.area} />
          {profile.columns.map((c, i) => (c.hot ? <path key={i} className={styles.openArea} d={c.area} /> : null))}
          <path className={styles.ridge} d={profile.ridge} vectorEffect="non-scaling-stroke" />
          <path className={styles.road} d="M0 100H100" vectorEffect="non-scaling-stroke" />
        </svg>

        {profile.columns.slice(1).map((c) => (
          <span key={c.x0} className={styles.tick} style={{ left: `${c.x0}%` }} />
        ))}

        {profile.columns.map((c, i) =>
          c.hot ? (
            <span key={i} className={styles.flag} style={at(c.peakX, c.peakY)} data-open="true">
              {i + 1}
            </span>
          ) : (
            <span key={i} className={styles.tag} style={at(c.peakX, c.peakY)}>
              {i + 1}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
