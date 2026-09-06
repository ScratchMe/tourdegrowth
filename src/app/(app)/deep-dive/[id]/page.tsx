"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ModeTag } from "@/components/brand/ModeTag";
import { Button } from "@/components/core/Button";
import { DetourCard } from "@/components/core/DetourCard";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { TextArea } from "@/components/core/TextArea";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { StageProgress } from "@/components/quiz/StageProgress";
import { LoadingScreen } from "@/components/quiz/LoadingScreen";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { FREE_CONTEXT, FREE_CONTEXT_MAX_LENGTH } from "@/content/free-context";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { trackEvent } from "@/lib/analytics/goatcounter";
import {
  clearDeepDiveProgress,
  findOwnerToken,
  loadDeepDiveProgress,
  saveDeepDiveProgress,
} from "@/lib/quiz/storage";
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
 * Progress IS persisted since REVIEW.md R-20. It deliberately wasn't when
 * this shipped — a short optional bonus flow, not the core 15-question
 * promise of SPEC.md §4 — but the flow grew to 10 questions plus a free-text
 * screen plus a generation that can take a minute, and losing all of that to
 * a stray reload stopped being a low-cost trade-off. Same shape as the quiz:
 * the resume point is DERIVED from the stored answers (first unanswered
 * question, or the free-context screen once all 10 are in) rather than being
 * a second piece of state to keep in sync.
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
  // Same reason as the Quick questionnaire (REVIEW.md R-19): answering
  // removes the focused button and swaps the question.
  const questionRegionRef = useRef<HTMLDivElement>(null);
  const lastAnnouncedIndex = useRef<number | null>(null);

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

    // Resume where they left off, if they were here before. Derived from the
    // stored answers alone — one source of truth, as in the quiz.
    const stored = loadDeepDiveProgress(params.id);
    if (stored) {
      setAnswers(stored.answers);
      setFreeContext(stored.freeContext);
      const firstUnanswered = DEEP_MODE_QUESTIONS.findIndex((q) => stored.answers[q.id] === undefined);
      if (firstUnanswered === -1) setPhase("freeContext");
      else setCurrentIndex(firstUnanswered);
    }
    // REVIEW.md R-11: only counted once ownership is confirmed, so a visitor
    // being redirected away never registers as a Deep dive start.
    trackEvent("deep_dive_started");
  }, [params.id, router]);

  useEffect(() => {
    if (phase !== "answering") return;
    if (lastAnnouncedIndex.current === null || lastAnnouncedIndex.current === currentIndex) {
      lastAnnouncedIndex.current = currentIndex;
      return;
    }
    lastAnnouncedIndex.current = currentIndex;
    questionRegionRef.current?.focus();
  }, [currentIndex, phase]);

  const currentQuestion = DEEP_MODE_QUESTIONS[currentIndex]!;
  const currentStage = PILLARS.indexOf(currentQuestion.pillar); // 0-4

  function handleAnswer(optionIndex: number) {
    const next = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(next);
    saveDeepDiveProgress({ submissionId: params.id, answers: next, freeContext });

    if (currentIndex === QUESTION_COUNT - 1) {
      setPhase("freeContext");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function handleFreeContextChange(value: string) {
    setFreeContext(value);
    // Written on every keystroke rather than debounced: it is a single
    // small localStorage entry, and the case worth protecting is exactly the
    // one a debounce would lose — a reload a moment after typing.
    saveDeepDiveProgress({ submissionId: params.id, answers, freeContext: value });
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
      // Cleared on success, not on abandon: `freeContext` is a founder
      // describing their business in their own words, and it has no reason
      // to outlive the request it was written for.
      clearDeepDiveProgress();
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
          <WordmarkLink locale={locale} />
          <div className={styles.headerRight}>
            <ModeTag mode="deep">{tc(dd.badge, locale)}</ModeTag>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {phase === "answering" && (
          <div
            ref={questionRegionRef}
            tabIndex={-1}
            role="group"
            aria-label={questionCounter}
            className={styles.questionRegion}
          >
            <StageProgress current={currentStage + 1} total={PILLARS.length} aria-label={questionCounter} />
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
          </div>
        )}

        {phase === "freeContext" && (
          <>
            {/* All 5 pillar segments are done at this point — this screen is
                the extra 11th step, not a 6th pillar, so `current` sits one
                past `total` (StageProgress renders every n < current as
                "done"). */}
            <StageProgress
              current={PILLARS.length + 1}
              total={PILLARS.length}
              aria-label={tc(FREE_CONTEXT.label, locale)}
            />

            <QuestionCard>{tc(FREE_CONTEXT.label, locale)}</QuestionCard>

            <p className={styles.freeContextPitch}>{tc(FREE_CONTEXT.pitch, locale)}</p>

            <TextArea
              value={freeContext}
              onChange={handleFreeContextChange}
              maxLength={FREE_CONTEXT_MAX_LENGTH}
              placeholder={tc(FREE_CONTEXT.placeholder, locale)}
              label={tc(FREE_CONTEXT.label, locale)}
              data-testid="free-context-textarea"
            />

            {/* Two actions since design system extension 01, not three: the
                field is already marked optional in its own question, and the
                primary button submits an empty one just as Skip did. Leaving
                the field blank is still the way to skip. */}
            <div className={styles.footer}>
              <Button variant="quiet" data-testid="back-button" onClick={() => setPhase("answering")}>
                {tc(t.backButton, locale)}
              </Button>
              <Button data-testid="submit-button" onClick={() => void submit(answers, freeContext)}>
                {tc(FREE_CONTEXT.submit, locale)}
              </Button>
            </div>

            {/* REVIEW-02.md R2-09: a real Deep dive takes about a minute (four
                generations in parallel since it became bilingual), and this
                button used to lead into that minute with no warning. */}
            <MetaLabel size="xs" uppercase={false} className={styles.waitNotice} data-testid="wait-notice">
              {tc(UI_STRINGS.deepDive.waitNotice, locale)}
            </MetaLabel>
          </>
        )}

        {phase === "loading" && <LoadingScreen locale={locale} variant="deep" />}

        {phase === "error" && (
          <div className={styles.detour}>
            <DetourCard
              tone="fault"
              headingLevel="h2"
              eyebrow={tc(t.errorEyebrow, locale)}
              title={tc(t.errorTitle, locale)}
            >
              {tc(t.errorBody, locale)}
              {submitError && <p className={styles.errorDetail}>{submitError}</p>}
            </DetourCard>

            <Button size="lg" data-testid="retry-button" onClick={() => void submit(answers, freeContext)}>
              {tc(t.errorRetry, locale)}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
