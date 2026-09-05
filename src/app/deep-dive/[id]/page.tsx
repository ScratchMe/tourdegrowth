"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ModeTag } from "@/components/brand/ModeTag";
import { Button } from "@/components/core/Button";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { FreeContextField } from "@/components/quiz/FreeContextField";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { StageProgress } from "@/components/quiz/StageProgress";
import { LoadingScreen } from "@/app/quiz/LoadingScreen";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { FREE_CONTEXT, FREE_CONTEXT_MAX_LENGTH } from "@/content/free-context";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { trackEvent } from "@/lib/analytics/goatcounter";
import { findOwnerToken } from "@/lib/quiz/storage";
import { PILLARS } from "@/lib/scoring/pillars";
import styles from "./page.module.css";

type Phase = "answering" | "freeContext" | "loading" | "error";

const QUESTION_COUNT = DEEP_MODE_QUESTIONS.length; // 10

/**
 * Deep dive questionnaire — SPEC-ADDENDUM-01.md §2.2/§2.3: 10 contextual
 * questions (2 per pillar), reached from the result page's "Get my deep
 * dive →" button, reusing the exact same screen component as the Quick
 * questionnaire (StageProgress/QuestionCard/AnswerOption) — only the
 * progress label and question count differ.
 *
 * SPEC-ADDENDUM-02.md §1 adds an 11th, final screen: an optional free-text
 * context field, "un écran de plus dans la même séquence" rather than a
 * different kind of step — same StageProgress (now fully filled, since all
 * 10 pillar questions are done), same QuestionCard-as-heading treatment.
 *
 * Unlike the Quick questionnaire, nothing here is persisted to
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
  const [freeContext, setFreeContext] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // REVIEW.md R-01: the Deep dive belongs to whoever took the Tour, and the
  // only proof of that on the client is the one-time token stored when the
  // submission was created. Checked after mount (localStorage is
  // client-only) — someone opening this URL from a shared link is sent
  // straight to the result page rather than being walked through 11 screens
  // that the API would reject at the end.
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [ownershipChecked, setOwnershipChecked] = useState(false);

  useEffect(() => {
    const token = findOwnerToken(params.id);
    if (!token) {
      router.replace(`/r/${params.id}`);
      return;
    }
    // Same deliberate post-mount read as the quiz and result screens: the
    // owner token lives in localStorage, which SSR cannot see.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOwnerToken(token);
    setOwnershipChecked(true);
    // REVIEW.md R-11: only counted once ownership is confirmed, so a visitor
    // being redirected away never registers as a Deep dive start.
    trackEvent("deep_dive_started");
  }, [params.id, router]);

  const currentQuestion = DEEP_MODE_QUESTIONS[currentIndex]!;
  const currentStage = PILLARS.indexOf(currentQuestion.pillar); // 0-4

  function handleAnswer(optionIndex: number) {
    const next = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(next);

    if (currentIndex === QUESTION_COUNT - 1) {
      setPhase("freeContext");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  async function submit(finalAnswers: Record<string, number>, finalFreeContext: string) {
    if (!ownerToken) return; // unreachable in practice: the effect above redirects away without one
    setSubmitError(null);
    setPhase("loading");
    try {
      const res = await fetch(`/api/submissions/${params.id}/deep-dive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextAnswers: finalAnswers,
          locale,
          ownerToken,
          // Trimmed client-side too so an all-whitespace field behaves like
          // "skipped" rather than sending a technically-non-empty string —
          // the server still truncates/validates independently either way.
          freeContext: finalFreeContext.trim() || null,
        }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message = (body as { error?: string } | null)?.error;
        throw new Error(message || `Request failed (${res.status})`);
      }
      trackEvent("deep_dive_completed", finalFreeContext.trim() ? "with_context" : "no_context");
      router.push(`/r/${params.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }

  // Nothing renders until ownership is settled — a flash of the first Deep
  // dive question before redirecting would be worse than a blank moment.
  if (!ownershipChecked) return null;

  const questionCounter = tc(dd.questionCounterTemplate, locale)
    .replace("{n}", String(currentIndex + 1))
    .replace("{total}", String(QUESTION_COUNT));

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <WordmarkLink />
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

        {phase === "freeContext" && (
          <>
            {/* All 5 pillar segments are done at this point — this screen is
                the extra 11th step, not a 6th pillar, so `current` sits one
                past `total` (StageProgress renders every n < current as
                "done"). */}
            <StageProgress current={PILLARS.length + 1} total={PILLARS.length} />

            <QuestionCard>{tc(FREE_CONTEXT.label, locale)}</QuestionCard>

            <p className={styles.freeContextPitch}>{tc(FREE_CONTEXT.pitch, locale)}</p>

            <FreeContextField
              value={freeContext}
              onChange={setFreeContext}
              maxLength={FREE_CONTEXT_MAX_LENGTH}
              placeholder={tc(FREE_CONTEXT.placeholder, locale)}
              data-testid="free-context-textarea"
            />

            <div className={styles.footer}>
              <Button variant="quiet" data-testid="back-button" onClick={() => setPhase("answering")}>
                {tc(t.backButton, locale)}
              </Button>
              <div className={styles.freeContextActions}>
                <Button variant="secondary" data-testid="skip-button" onClick={() => void submit(answers, "")}>
                  {tc(FREE_CONTEXT.skip, locale)}
                </Button>
                <Button data-testid="submit-button" onClick={() => void submit(answers, freeContext)}>
                  {tc(FREE_CONTEXT.submit, locale)}
                </Button>
              </div>
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
            <Button size="lg" fullWidth data-testid="retry-button" onClick={() => void submit(answers, freeContext)}>
              {tc(t.errorRetry, locale)}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
