"use client";

import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import type { Answers } from "@/lib/scoring/score";
import styles from "./ScoreBreakdown.module.css";

/** One question, resolved to display text on the server — see the note in `page.tsx`. */
export interface BreakdownQuestion {
  id: string;
  pillar: Pillar;
  question: string;
  options: { label: string; points: number }[];
}

export interface BreakdownData {
  questions: BreakdownQuestion[];
  /** Raw 0-60 total per pillar, straight from `computeScore` — the numerator of the shown maths. */
  rawPoints: Record<Pillar, number>;
}

interface ScoreBreakdownProps {
  locale: Locale;
  data: BreakdownData;
  /** The owner's own answers, read from this device (never from the page payload). */
  answers: Answers;
  pillars: { pillar: Pillar; score: number }[];
}

/**
 * The owner-only "how this score is calculated" panel — REVIEW.md R-12.
 *
 * CLAUDE.md calls it non-negotiable that "un score partagé doit être
 * ré-explicable en 10 secondes". That was true of the code — `computeScore`
 * is pure and well tested — and invisible in the product: nothing on the
 * result page ever showed the three answers behind a pillar's score, even
 * though they were sitting in Firestore.
 *
 * Two deliberate constraints:
 *
 *  - **Owner only.** The answers describe a business far more than the score
 *    does, and `/r/<id>` is a public page. They are read from this device's
 *    localStorage (see `quiz/storage.ts`), so they never reach the payload of
 *    a shared link in the first place.
 *  - **Closed by default.** A native `<details>`, placed after the CTAs, so
 *    the screen the design brief specified is visually unchanged until
 *    someone asks for the detail. No design-system component covers a
 *    disclosure, so this is built from tokens only — flagged rather than
 *    invented (see the CLAUDE.md entry).
 */
export function ScoreBreakdown({ locale, data, answers, pillars }: ScoreBreakdownProps) {
  const t = UI_STRINGS.breakdown;
  const scoreOf = new Map(pillars.map((p) => [p.pillar, p.score]));

  return (
    <details className={styles.wrap} data-testid="score-breakdown">
      <summary className={styles.summary}>{tc(t.title, locale)}</summary>

      <p className={styles.intro}>{tc(t.intro, locale)}</p>

      {PILLARS.map((pillar) => {
        const questions = data.questions.filter((q) => q.pillar === pillar);
        if (questions.length === 0) return null;

        const maths = tc(t.pillarMathTemplate, locale)
          .replace("{raw}", String(data.rawPoints[pillar] ?? 0))
          .replace("{score}", String(scoreOf.get(pillar) ?? 0));

        return (
          <section key={pillar} className={styles.pillar}>
            <div className={styles.pillarHead}>
              <span className={styles.pillarName}>{tc(UI_STRINGS.pillars[pillar], locale)}</span>
              <span className={styles.pillarMath}>{maths}</span>
            </div>

            <ul className={styles.questions}>
              {questions.map((q) => {
                const chosen = q.options[answers[q.id] ?? -1];
                return (
                  <li key={q.id} className={styles.question}>
                    <span className={styles.questionText}>{q.question}</span>
                    <span className={styles.answerRow}>
                      <span className={styles.answerLabel}>{chosen?.label ?? "—"}</span>
                      <span className={styles.points}>
                        {chosen ? tc(t.pointsTemplate, locale).replace("{n}", String(chosen.points)) : "—"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className={styles.note}>{tc(t.ownerOnlyNote, locale)}</p>
    </details>
  );
}
