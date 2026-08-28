"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/core/Button";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuestionText } from "@/components/quiz/QuestionText";
import { StageProgress } from "@/components/quiz/StageProgress";
import { QUESTIONS } from "@/content/copy-library";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
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
  // Components below shrink to their own mobile figures via CSS below the
  // app's breakpoint (see e.g. QuestionCard.module.css) — "desktop" here is
  // just the base size, not a fixed desktop-only choice.
  const size = "desktop";

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulseStage, setPulseStage] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openGlossaryId, setOpenGlossaryId] = useState<string | null>(null);
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
  const currentStage = phase === "answering" ? stageOfQuestion(currentIndex) : STAGE_COUNT;

  function handleAnswer(optionIndex: AnswerIndex) {
    const nextAnswers: Answers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(nextAnswers);
    saveStoredAnswers(nextAnswers);
    setOpenGlossaryId(null);

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
    setOpenGlossaryId(null);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  // "Get my score →" and "Try again" both call this — same request, same
  // stored answers, so a retry after a failure never restarts the
  // questionnaire (SPEC.md §4). SPEC-ADDENDUM-01.md §0: this is now a
  // synchronous scoring + lookup on the server, no Gemini call — a minimum
  // dwell (see LoadingScreen's "quick" variant) keeps the transition from
  // feeling abrupt even on a very fast response, without adding any delay
  // to a normal or slow one.
  async function handleGetScore() {
    setSubmitError(null);
    setPhase("loading");
    const minDwell = new Promise((resolve) => window.setTimeout(resolve, 300));
    try {
      const [res] = await Promise.all([
        fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, tone, locale, refId: loadRefId() }), // SPEC.md §7
        }),
        minDwell,
      ]);
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
    .replace("{pillar}", tc(UI_STRINGS.pillars[currentQuestion.pillar], locale));

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
          <div className={styles.headerRight}>
            {phase === "answering" ? (
              <>
                <MetaLabel size="sm">{questionCounter}</MetaLabel>
                <MetaLabel size="sm" className={styles.minutesLeft}>
                  {minutesLeftLabel}
                </MetaLabel>
              </>
            ) : phase === "error" ? (
              <MetaLabel size="sm" tone="alert">
                {tc(t.errorHeaderLabel, locale)}
              </MetaLabel>
            ) : (
              <MetaLabel size="sm">{tc(UI_STRINGS.toneSelector.headerLabel, locale)}</MetaLabel>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <StageProgress current={currentStage + 1} total={STAGE_COUNT} size={size} />
        {phase === "answering" && <MetaLabel>{stageLabel}</MetaLabel>}

        {phase === "answering" && (
          <>
            <QuestionCard size={size}>
              <QuestionText
                questionId={currentQuestion.id}
                text={tc(currentQuestion.question, locale)}
                locale={locale}
                openGlossaryId={openGlossaryId}
                onOpenGlossaryChange={setOpenGlossaryId}
                glossaryCloseLabel={tc(UI_STRINGS.glossary.closeLabel, locale)}
                glossaryLabelTemplate={tc(UI_STRINGS.glossary.definitionLabelTemplate, locale)}
              />
            </QuestionCard>

            <div className={styles.answers}>
              {currentQuestion.options.map((option, index) => {
                const optionIndex = index as AnswerIndex;
                const selected = answers[currentQuestion.id] === optionIndex;
                return (
                  <AnswerOption
                    key={optionIndex}
                    size={size}
                    data-testid="answer-option"
                    selected={selected}
                    onClick={() => handleAnswer(optionIndex)}
                  >
                    {tc(option.label, locale)}
                  </AnswerOption>
                );
              })}
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

        {phase === "tone" && (
          <ToneSelector locale={locale} tone={tone} onSelectTone={setTone} onSubmit={handleGetScore} />
        )}

        {phase === "loading" && <LoadingScreen locale={locale} variant="quick" />}

        {phase === "error" && (
          <div className={styles.errorCard}>
            <MetaLabel size="xs" tone="alert">
              {tc(t.errorEyebrow, locale)}
            </MetaLabel>
            <h2 className={styles.errorTitle}>{tc(t.errorTitle, locale)}</h2>
            <p className={styles.errorBody}>{tc(t.errorBody, locale)}</p>
            {submitError && <p className={styles.errorDetail}>{submitError}</p>}
            <Button size="lg" fullWidth data-testid="retry-button" onClick={handleGetScore}>
              {tc(t.errorRetry, locale)}
            </Button>
            <MetaLabel size="xs" uppercase={false}>
              {tc(t.errorHint, locale)}
            </MetaLabel>
          </div>
        )}
      </main>
    </>
  );
}
