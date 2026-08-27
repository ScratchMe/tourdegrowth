"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark/Wordmark";
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
import { loadStoredAnswers, saveStoredAnswers } from "@/lib/quiz/storage";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/scoring/questions";
import { LoadingScreen } from "./LoadingScreen";
import { ToneSelector, type Tone } from "./ToneSelector";
import styles from "./page.module.css";

type Phase = "answering" | "tone" | "loading" | "done";

// The full pre-result flow — DESIGN-BRIEF.md §05/§06a/§06b — as one route,
// one client state machine (`phase`), matching the design's own "State"
// section (no per-question or per-screen URLs).
//
// `phase: "done"` stands in for the real result page: Gemini/Supabase
// (step 6) and the result screens (step 7) don't exist yet.
export default function QuizPage() {
  const { locale } = useLocale();
  const t = UI_STRINGS.quiz;

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulseStage, setPulseStage] = useState<number | null>(null);
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
    setMounted(true);
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

  const questionCounter = tc(t.questionCounterTemplate, locale).replace(
    "{n}",
    String(Math.min(currentIndex + 1, QUESTION_COUNT)),
  );
  const minutesLeftLabel = tc(t.minutesLeftTemplate, locale).replace("{m}", String(minutesLeft(currentIndex)));
  const stageLabel = tc(t.stageLabelTemplate, locale)
    .replace("{n}", String(stageOfQuestion(currentIndex) + 1))
    .replace("{pillar}", tc(UI_STRINGS.pillars[content.pillar], locale));
  const toneLabel = tc(tone === "roast" ? UI_STRINGS.toneSelector.roastTitle : UI_STRINGS.toneSelector.neutralTitle, locale);
  const doneBody = tc(t.donePlaceholderBodyTemplate, locale).replace("{tone}", toneLabel);

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
          <ToneSelector locale={locale} tone={tone} onSelectTone={setTone} onSubmit={() => setPhase("loading")} />
        )}

        {phase === "loading" && <LoadingScreen locale={locale} onDone={() => setPhase("done")} />}

        {phase === "done" && (
          <div className={styles.doneCard}>
            <h2 className={styles.doneTitle}>{tc(t.donePlaceholderTitle, locale)}</h2>
            <p className={styles.doneBody}>{doneBody}</p>
          </div>
        )}
      </main>
    </>
  );
}
