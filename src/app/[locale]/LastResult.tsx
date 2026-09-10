"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LANDING_RETURN_EVENT, RETAKE_NUDGE_EVENT, trackEvent } from "@/lib/analytics/goatcounter";
import { latestProgression, type Progression, retakeNudge, type RetakeNudge } from "@/lib/quiz/progression";
import { progressionSentence, type ProgressionTemplates } from "@/lib/quiz/progression-copy";
import { loadStoredResults, type StoredResult } from "@/lib/quiz/storage";
import styles from "./LastResult.module.css";

/**
 * Resolved strings, not the dictionary (REVIEW-02.md R2-14): this island is
 * the landing's only client code, and importing `UI_STRINGS` here put the
 * whole bilingual dictionary in the landing's bundle for two lines of text.
 */
export interface LastResultProps {
  /** "Your last score: {score}/100 — see it again →", `{score}` replaced here. */
  withScore: string;
  withoutScore: string;
  /** REVIEW-02.md R2-27 — the three progression sentences, already translated. */
  progression: ProgressionTemplates;
  /** REVIEW-03.md C1 — the 30-day nudge: the two `{n}` templates and its link text, already translated. */
  nudge: { weeks: string; months: string; cta: string };
}

/**
 * "Your last score: 74/100 — see it again →" on the landing — REVIEW.md R-20.
 *
 * With no accounts (SPEC.md §5), a result is reachable only by its URL. Lose
 * the link and the result is gone, even for the person who created it. This
 * is the way back, and it costs nothing: the ids were already on the device,
 * stored for the owner token (R-01).
 *
 * A client island, like `RefCapture`, so the landing itself stays a Server
 * Component and keeps being prerendered (R-24). It reads localStorage AFTER
 * mount rather than seeding initial state, because the server cannot see it
 * and a seeded value would guarantee a hydration mismatch — the same lesson
 * as the quiz. Rendering nothing first is also the right default here: a
 * newcomer, who is most of this page's traffic, sees nothing appear and
 * disappear.
 */
export function LastResult({ withScore, withoutScore, progression, nudge }: LastResultProps) {
  const [last, setLast] = useState<StoredResult | null>(null);
  const [progress, setProgress] = useState<Progression | null>(null);
  const [stale, setStale] = useState<RetakeNudge | null>(null);
  const returnCounted = useRef(false);

  useEffect(() => {
    const results = loadStoredResults();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLast(results[0] ?? null);
    setProgress(latestProgression(results));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStale(retakeNudge(results, Date.now()));

    // REVIEW-03.md A4 — "someone with a result loaded the landing again".
    // Not part of the value-action ratio: it is the denominator the 30-day
    // nudge (C1) will need before anyone can say whether that nudge works.
    // The ref guards against a double-invoked effect counting one visit
    // twice; the effect itself runs once per load.
    if (results.length > 0 && !returnCounted.current) {
      returnCounted.current = true;
      trackEvent(LANDING_RETURN_EVENT);
    }
  }, []);

  if (!last) return null;

  // Entries written before R-20 carry no score — an unnumbered link is still
  // the way back, so those fall back rather than being hidden.
  const label = typeof last.total === "number" ? withScore.replace("{score}", String(last.total)) : withoutScore;

  return (
    <span className={styles.wrap}>
      <Link href={`/r/${last.id}`} className={styles.link} data-testid="last-result-link">
        {label}
      </Link>
      {/* REVIEW-02.md R2-27 — only once there are two scored Tours to
          compare; a first-time finisher sees the link alone. */}
      {progress ? (
        <span className={styles.progression} data-testid="progression">
          {progressionSentence(progress, progression)}
        </span>
      ) : null}
      {/* REVIEW-03.md C1 — the only reminder a product with no email and no
          account can send. Quiet mono under the link, and a question rather
          than an instruction: someone who came back already knows where the
          hero CTA is. */}
      {stale ? (
        <span className={styles.nudge} data-testid="retake-nudge">
          {(stale.unit === "weeks" ? nudge.weeks : nudge.months).replace("{n}", String(stale.value))}
          {" — "}
          <Link
            href="/quiz"
            className={styles.nudgeLink}
            data-testid="retake-nudge-link"
            onClick={() => trackEvent(RETAKE_NUDGE_EVENT)}
          >
            {nudge.cta}
          </Link>
        </span>
      ) : null}
    </span>
  );
}
