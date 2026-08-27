import { STAGE_COUNT } from "@/lib/quiz/navigation";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** 0-4 — the stage the current question belongs to. */
  currentStage: number;
  /** Stage index (0-4) to play the "pulse" animation on right now, or null. */
  pulseStage: number | null;
}

/** The 5-segment progress bar (DESIGN-BRIEF.md §05): completed / current / upcoming. */
export function ProgressBar({ currentStage, pulseStage }: ProgressBarProps) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STAGE_COUNT}
      aria-valuenow={currentStage + 1}
    >
      {Array.from({ length: STAGE_COUNT }, (_, i) => {
        const state = i < currentStage ? "completed" : i === currentStage ? "current" : "upcoming";
        const classes = [styles.segment, styles[state], pulseStage === i ? styles.pulse : ""]
          .filter(Boolean)
          .join(" ");
        return <span key={i} className={classes} />;
      })}
    </div>
  );
}
