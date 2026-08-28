"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ModeTag } from "@/components/brand/ModeTag";
import { Button } from "@/components/core/Button";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { StageProgress } from "@/components/quiz/StageProgress";
import { LoadingScreen } from "@/app/quiz/LoadingScreen";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { PILLARS } from "@/lib/scoring/pillars";
import styles from "./page.module.css";

type Phase = "answering" | "loading" | "error";

const QUESTION_COUNT = DEEP_MODE_QUESTIONS.length; // 10

/**
 * Deep dive questionnaire — SPEC-ADDENDUM-01.md §2.2/§2.3: 10 contextual
 * questions (2 per pillar), reached from the result page's "Get my deep
 * dive →" button, reusing the exact same screen component as the Quick
 * questionnaire (StageProgress/QuestionCard/AnswerOption) — only the
 * progress label and question count differ.
 *
 * Unlike the Quick questionnaire, answers here are NOT persisted to
 * localStorage: this is a short, optional bonus flow (not the core 15-
 * question promise SPEC.md §4 makes about never losing progress), so a
 * reload simply restarts it — a low-cost trade-off for not adding a second
 * persistence key/shape to reason about.
 */
export default function DeepDivePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale } = useLocale();
  const t = UI_STRINGS.quiz; // reuses the same generic "answer to continue"/error copy as the Quick flow
  const dd = UI_STRINGS.deepDive;

  const [phase, setPhase] = useState<Phase>("answering");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = DEEP_MODE_QUESTIONS[currentIndex]!;
  const currentStage = PILLARS.indexOf(currentQuestion.pillar); // 0-4

  function handleAnswer(optionIndex: number) {
    const next = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(next);

    if (currentIndex === QUESTION_COUNT - 1) {
      void submit(next);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  async function submit(finalAnswers: Record<string, number>) {
    setSubmitError(null);
    setPhase("loading");
    try {
      const res = await fetch(`/api/submissions/${params.id}/deep-dive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextAnswers: finalAnswers, locale }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message = (body as { error?: string } | null)?.error;
        throw new Error(message || `Request failed (${res.status})`);
      }
      router.push(`/r/${params.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }

  const questionCounter = tc(dd.questionCounterTemplate, locale)
    .replace("{n}", String(currentIndex + 1))
    .replace("{total}", String(QUESTION_COUNT));

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
          <div className={styles.headerRight}>
            <ModeTag mode="deep">{tc(dd.badge, locale)}</ModeTag>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {phase === "answering" && (
          <>
            <StageProgress current={currentStage + 1} total={PILLARS.length} />
            <MetaLabel>{questionCounter}</MetaLabel>

            <QuestionCard>{tc(currentQuestion.question, locale)}</QuestionCard>

            <div className={styles.answers}>
              {currentQuestion.options.map((option, index) => (
                <AnswerOption
                  key={index}
                  data-testid="deep-dive-answer-option"
                  selected={answers[currentQuestion.id] === index}
                  onClick={() => handleAnswer(index)}
                >
                  {tc(option.contextLabel, locale)}
                </AnswerOption>
              ))}
            </div>

            <div className={styles.footer}>
              {currentIndex > 0 ? (
                <Button variant="quiet" data-testid="back-button" onClick={handleBack}>
                  {tc(t.backButton, locale)}
                </Button>
              ) : (
                <span />
              )}
              <MetaLabel size="sm">{tc(t.answerToContinue, locale)}</MetaLabel>
            </div>
          </>
        )}

        {phase === "loading" && <LoadingScreen locale={locale} variant="deep" />}

        {phase === "error" && (
          <div className={styles.errorCard}>
            <MetaLabel size="xs" tone="alert">
              {tc(t.errorEyebrow, locale)}
            </MetaLabel>
            <h2 className={styles.errorTitle}>{tc(t.errorTitle, locale)}</h2>
            <p className={styles.errorBody}>{tc(t.errorBody, locale)}</p>
            {submitError && <p className={styles.errorDetail}>{submitError}</p>}
            <Button size="lg" fullWidth data-testid="retry-button" onClick={() => void submit(answers)}>
              {tc(t.errorRetry, locale)}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
