import type { HTMLAttributes, ReactNode } from "react";
import styles from "./StageProgress.module.css";

export interface StageProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 1-based index of the pillar in progress. */
  current?: number;
  /** Segment count. Always 5 in production — one per AARRR pillar. */
  total?: number;
  size?: "desktop" | "mobile";
  /** Mono caption below, e.g. "Deep dive · Question 3 of 10". */
  label?: ReactNode;
}

/**
 * Progress through the five pillars, drawn as road markings. Done segments
 * are solid ink, the current one is red and pulses once as it fills,
 * pending ones are dashed on sunken fill. Five segments, always — the count
 * is the framework, not a variable. The precise position goes in `label`,
 * not the segments: the Deep dive reuses these same five segments across
 * its 10 questions (2 per pillar).
 */
export function StageProgress({ current = 1, total = 5, size = "desktop", label, className, ...rest }: StageProgressProps) {
  const desktop = size === "desktop";

  return (
    <div className={className} {...rest}>
      <div className={[styles.segments, desktop ? styles.desktop : styles.mobile].join(" ")}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const state = n < current ? styles.done : n === current ? styles.current : styles.pending;
          return (
            <div
              key={n}
              className={[styles.segment, desktop ? styles.segmentDesktop : styles.segmentMobile, state].join(" ")}
            />
          );
        })}
      </div>
      {label ? (
        <div className={[styles.label, desktop ? styles.labelDesktop : styles.labelMobile].join(" ")}>{label}</div>
      ) : null}
    </div>
  );
}
