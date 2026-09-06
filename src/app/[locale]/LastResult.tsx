"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
export function LastResult({ withScore, withoutScore }: LastResultProps) {
  const [last, setLast] = useState<StoredResult | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLast(loadStoredResults()[0] ?? null);
  }, []);

  if (!last) return null;

  // Entries written before R-20 carry no score — an unnumbered link is still
  // the way back, so those fall back rather than being hidden.
  const label = typeof last.total === "number" ? withScore.replace("{score}", String(last.total)) : withoutScore;

  return (
    <Link href={`/r/${last.id}`} className={styles.link} data-testid="last-result-link">
      {label}
    </Link>
  );
}
