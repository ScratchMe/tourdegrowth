"use client";

import { Disclosure } from "@/components/core/Disclosure";
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
  /*
   * There is deliberately no `rawPoints` here (REVIEW-02.md R2-24). The raw
   * 0-60 total per pillar used to travel in every visitor's payload, owner or
   * not — and with options worth 20/7/0, each reachable sum maps to exactly
   * one multiset of answers, so it disclosed a little more than the shown
   * score. It is also redundant: the owner's answers and each option's
   * points are both here, so the numerator is computed below instead.
   */
}

interface ScoreBreakdownProps {
  locale: Locale;
  data: BreakdownData;
  /** The owner's own answers, read from this device (never from the page payload). */
  answers: Answers;
  pillars: { pillar: Pillar; score: number }[];
}

/**
 * The owner-only "how this score is calculated" panel — REVIEW.md R-12,
 * restructured by design system extension 01.
 *
 * CLAUDE.md calls it non-negotiable that "un score partagé doit être
 * ré-explicable en 10 secondes". That was true of the code — `computeScore`
 * is pure and well tested — and invisible in the product: nothing on the
 * result page ever showed the three answers behind a pillar's score.
 *
 * **Two levels, no more.** Level one is the closed disclosure. Opening it
 * shows the intro and the five pillar heads with their maths — that is the
 * ten-second explanation, visible at once on both breakpoints. Level two is a
 * per-pillar `sm` disclosure holding its three question / answer / points
 * rows. Before extension 01 all fifteen rows were flat, which was one full
 * screen per pillar on mobile.
 *
 * Two deliberate constraints, unchanged:
 *
 *  - **Owner only.** The answers describe a business far more than the score
 *    does, and `/r/<id>` is a public page. They are read from this device's
 *    localStorage (see `quiz/storage.ts`), so they never reach the payload of
 *    a shared link in the first place.
 *  - **Closed by default**, and placed after the CTAs, so the screen the
 *    design brief specified is visually unchanged until someone asks.
 */
export function ScoreBreakdown({ locale, data, answers, pillars }: ScoreBreakdownProps) {
  const t = UI_STRINGS.breakdown;
  const scoreOf = new Map(pillars.map((p) => [p.pillar, p.score]));

  return (
    <Disclosure summary={tc(t.title, locale)} data-testid="score-breakdown">
      <p className={styles.intro}>{tc(t.intro, locale)}</p>

      <div className={styles.pillars}>
        {PILLARS.map((pillar) => {
          const questions = data.questions.filter((q) => q.pillar === pillar);
          if (questions.length === 0) return null;

          const rawPoints = questions.reduce((sum, q) => sum + (q.options[answers[q.id] ?? -1]?.points ?? 0), 0);
          const maths = tc(t.pillarMathTemplate, locale)
            .replace("{raw}", String(rawPoints))
            .replace("{score}", String(scoreOf.get(pillar) ?? 0));

          return (
            <Disclosure
              key={pillar}
              size="sm"
              rule={false}
              className={styles.pillar}
              data-testid={`breakdown-pillar-${pillar}`}
              summary={
                <span className={styles.pillarHead}>
                  <span className={styles.pillarName}>{tc(UI_STRINGS.pillars[pillar], locale)}</span>
                  <span className={styles.pillarMath}>{maths}</span>
                </span>
              }
            >
              <ol className={styles.questions}>
                {questions.map((q) => {
                  const chosen = q.options[answers[q.id] ?? -1];
                  return (
                    <li key={q.id} className={styles.question}>
                      <span className={styles.questionText}>{q.question}</span>
                      <span className={styles.answerLabel}>{chosen?.label ?? "—"}</span>
                      <span
                        className={[styles.points, chosen?.points === 0 ? styles.pointsZero : ""]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {chosen ? tc(t.pointsTemplate, locale).replace("{n}", String(chosen.points)) : "—"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Disclosure>
          );
        })}
      </div>

      <p className={styles.note}>{tc(t.ownerOnlyNote, locale)}</p>
    </Disclosure>
  );
}
