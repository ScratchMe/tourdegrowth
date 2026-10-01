import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "./StageScores.module.css";

export interface StageScoreProps {
  /** The stage's name. Kept in English on French screens, matching content/glossary.ts. */
  stage: string;
  /** The figure, printed as given ("8", not "08"). Always printed with its "/total". */
  score: number | string;
  /** Default 20. Also the meter's scale — never fitted to the data. */
  total?: number;
  /** `alert`: the stage that stalls — red wash and a solid red rule. Follows the bottleneck: one row on `clear`, the tied group on `shared`, none on `level` (C34). */
  tone?: "neutral" | "alert";
  /** The landing only: makes the stage name a link to its glossary page. Never together with a « ? » in `children`. */
  href?: string;
  /** The link's accessible name, localized, containing the visible name: "Acquisition — definition" / « Acquisition — définition ». Required with `href`. */
  linkLabel?: string;
  id?: string;
  /** The result only: the stage's GlossaryTerm (its « ? »), right after the name — tone="alert" on an alert row, "muted" elsewhere. */
  children?: ReactNode;
}

/**
 * One stage's score as a row of the score sheet (design system extension 05,
 * replaces PillarChip): "18/20 Acquisition ?". A value, not an action — no
 * box, no radius, no edge all round, no hover on the row. The one thing to
 * touch is the « ? » passed as `children`, or on the landing the stage name
 * when `href` makes it a link. Renders an <li>: always inside `StageScores`.
 *
 * The meter between score and name is the score's share of its total. It
 * repeats the number, so it is hidden from assistive technology: the row's
 * text is its whole reading.
 */
export function StageScore({ stage, score, total = 20, tone = "neutral", href, linkLabel, id, children }: StageScoreProps) {
  const value = typeof score === "number" ? score : Number(score);
  const share = Number.isFinite(value) && total > 0 ? Math.min(1, Math.max(0, value / total)) : null;
  const name =
    href !== undefined ? (
      <Link href={href} className={styles.link} aria-label={linkLabel}>
        {stage}
      </Link>
    ) : (
      stage
    );

  return (
    <li id={id} className={[styles.row, tone === "alert" ? styles.alert : ""].filter(Boolean).join(" ")}>
      <span className={styles.score}>
        <span className={styles.figure}>{score}</span>/{total}
      </span>{" "}
      <span className={styles.meter} aria-hidden="true" data-testid="stage-meter">
        {share !== null ? (
          <span className={styles.fill} style={{ "--score-share": `${Math.round(share * 1000) / 10}%` } as CSSProperties} />
        ) : null}
      </span>{" "}
      <span className={styles.name}>
        {name}
        {children}
      </span>
    </li>
  );
}
