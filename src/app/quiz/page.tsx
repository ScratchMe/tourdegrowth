"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark/Wordmark";
import { Button } from "@/components/button/Button";
import { ProgressBar } from "@/components/progress-bar/ProgressBar";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { QUESTION_CONTENT } from "@/lib/i18n/questionnaire-content";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  QUESTIONS_PER_STAGE,
  QUESTION_COUNT,
  STAGE_COUNT,
  firstUnansweredIndex,
  isComplete,
  minutesLeft,
  stageOfQuestion,
} from "@/lib/quiz/navigation";
import { trackEvent } from "@/lib/analytics/goatcounter";
import { loadRefId, loadStoredAnswers, saveRefId, saveStoredAnswers } from "@/lib/quiz/storage";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/scoring/questions";
import { LoadingScreen } from "./LoadingScreen";
import { ToneSelector, type Tone } from "./ToneSelector";
import styles from "./page.module.css";

type Phase = "answering" | "tone" | "loading" | "error";

// The full pre-result flow — DESIGN-BRIEF.md §05/§06a/§06b — as one route,
// one client state machine (`phase`), matching the design's own "State"
// section (no per-question or per-screen URLs). On success, `loading`
// redirects straight to the real /r/<id> result page (step 7) — there's no
// terminal "done" state on this page anymore.
//
// `phase: "error"` is DESIGN-BRIEF.md §06c — it keeps the SPEC.md §4 promise
// (answers stay saved, retry doesn't restart the questionnaire) that the
// copy itself makes explicit.
export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = UI_STRINGS.quiz;

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulseStage, setPulseStage] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // SPEC.md §6bis: "Straight up" (neutral) is the explicit default tone.
  const [tone, setTone] = useState<Tone>("neutral");

  // Resuming from localStorage is client-only (SSR always sees an empty
  // store) — done in an effect, after mount, rather than in the initial
  // state, so the server-rendered HTML and the first client render match.
  useEffect(() => {
    const stored = loadStoredAnswers();
    setAnswers(stored);
    if (isComplete(stored)) {
      setCurrentIndex(QUESTION_COUNT - 1);
      setPhase("tone");
    } else {
      setCurrentIndex(firstUnansweredIndex(stored));
    }

    // SPEC.md §7: capture ?ref= if this visitor landed here directly
    // (rather than via / — either way works, see storage.ts).
    const ref = searchParams.get("ref");
    if (ref) saveRefId(ref);

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const currentQuestion = QUESTIONS[currentIndex]!;
  const content = QUESTION_CONTENT[currentQuestion.id]!;
  const currentStage = phase === "answering" ? stageOfQuestion(currentIndex) : STAGE_COUNT;

  function handleAnswer(optionIndex: AnswerIndex) {
    const nextAnswers: Answers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(nextAnswers);
    saveStoredAnswers(nextAnswers);

    const stageJustCompleted = (currentIndex + 1) % QUESTIONS_PER_STAGE === 0;
    if (stageJustCompleted) {
      const completedStage = stageOfQuestion(currentIndex);
      setPulseStage(completedStage);
      window.setTimeout(() => {
        setPulseStage((current) => (current === completedStage ? null : current));
      }, 400);
    }

    if (currentIndex === QUESTION_COUNT - 1) {
      setPhase("tone");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  // "Get my score →" and "Try again" both call this — same request, same
  // stored answers, so a retry after a failure never restarts the
  // questionnaire (SPEC.md §4).
  async function handleGetScore() {
    setSubmitError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, tone, locale, refId: loadRefId() }), // SPEC.md §7
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message = (body as { error?: string } | null)?.error;
        throw new Error(message || `Request failed (${res.status})`);
      }
      const submission = (await res.json()) as { id: string };
      trackEvent("submission_completed", tone); // SPEC.md §8: one custom event per completed analysis
      router.push(`/r/${submission.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }

  const questionCounter = tc(t.questionCounterTemplate, locale).replace(
    "{n}",
    String(Math.min(currentIndex + 1, QUESTION_COUNT)),
  );
  const minutesLeftLabel = tc(t.minutesLeftTemplate, locale).replace("{m}", String(minutesLeft(currentIndex)));
  const stageLabel = tc(t.stageLabelTemplate, locale)
    .replace("{n}", String(stageOfQuestion(currentIndex) + 1))
    .replace("{pillar}", tc(UI_STRINGS.pillars[content.pillar], locale));

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
          <div className={styles.headerRight}>
            {phase === "answering" ? (
              <>
                <span className={styles.mono}>{questionCounter}</span>
                <span className={`${styles.mono} ${styles.minutesLeft}`}>{minutesLeftLabel}</span>
              </>
            ) : phase === "error" ? (
              <span className={`${styles.mono} ${styles.errorHeaderLabel}`}>{tc(t.errorHeaderLabel, locale)}</span>
            ) : (
              <span className={styles.mono}>{tc(UI_STRINGS.toneSelector.headerLabel, locale)}</span>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <ProgressBar currentStage={currentStage} pulseStage={pulseStage} />
        {phase === "answering" && <p className={styles.stageLabel}>{stageLabel}</p>}

        {phase === "answering" && (
          <>
            <div className={styles.questionCard}>
              <h2 className={styles.question}>{tc(content.question, locale)}</h2>
            </div>

            <div className={styles.answers}>
              {content.options.map((option) => {
                const selected = answers[currentQuestion.id] === option.index;
                return (
                  <button
                    key={option.index}
                    type="button"
                    data-testid="answer-option"
                    className={`${styles.answerButton} ${selected ? styles.selected : ""}`}
                    onClick={() => handleAnswer(option.index)}
                  >
                    {tc(option.label, locale)}
                  </button>
                );
              })}
            </div>

            <div className={styles.footer}>
              {currentIndex > 0 ? (
                <button type="button" data-testid="back-button" className={styles.backLink} onClick={handleBack}>
                  {tc(t.backButton, locale)}
                </button>
              ) : (
                <span />
              )}
              <span className={styles.mono}>{tc(t.answerToContinue, locale)}</span>
            </div>
          </>
        )}

        {phase === "tone" && (
          <ToneSelector locale={locale} tone={tone} onSelectTone={setTone} onSubmit={handleGetScore} />
        )}

        {phase === "loading" && <LoadingScreen locale={locale} />}

        {phase === "error" && (
          <div className={styles.errorCard}>
            <p className={styles.errorEyebrow}>{tc(t.errorEyebrow, locale)}</p>
            <h2 className={styles.errorTitle}>{tc(t.errorTitle, locale)}</h2>
            <p className={styles.errorBody}>{tc(t.errorBody, locale)}</p>
            {submitError && <p className={styles.errorDetail}>{submitError}</p>}
            <Button data-testid="retry-button" className={styles.errorCta} onClick={handleGetScore}>
              {tc(t.errorRetry, locale)}
            </Button>
            <p className={styles.errorHint}>{tc(t.errorHint, locale)}</p>
          </div>
        )}
      </main>
    </>
  );
}
