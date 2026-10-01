"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/core/Button";
import { isSubmittedTour, loadStoredAnswers, loadStoredResults } from "@/lib/quiz/storage";

/**
 * The landing's « Start your Tour », which says « Resume » when this device
 * holds a Tour in progress (CHANTIERS.md A15.16, Zeigarnik, decided by Antoine
 * on 2026-10-01). The quiz already resumed at the first unanswered question;
 * nothing said so, and a person who had left at question 8 was invited to
 * « start ». The browser's Back, which leaves the quiz, lands here too: the
 * way back in is now said.
 *
 * Resolved strings, not the dictionary (REVIEW-02.md R2-14, like LastResult).
 * Read after mount: the server cannot see the device, and the start label is
 * what a newcomer — most of this page — sees anyway.
 */
export interface TourCtaProps {
  label: string;
  /** « Resume your Tour (question {n} of 15) → », `{n}` replaced here. */
  resumeLabel: string;
  /** All fifteen answered, the score not asked for yet. */
  resumeLastLabel: string;
  testId: string;
  fullWidth?: boolean;
  /**
   * The Tour's length, from the page: `lib/quiz/navigation` would bring the
   * fifteen questions into the landing's bundle to count them.
   */
  total: number;
}

export function TourCta({ label, resumeLabel, resumeLastLabel, testId, fullWidth, total }: TourCtaProps) {
  const [shown, setShown] = useState(label);

  useEffect(() => {
    const answers = loadStoredAnswers();
    const answered = Object.keys(answers).length;
    if (answered === 0 || isSubmittedTour(answers, loadStoredResults())) return;
    // Answered in order (the quiz only moves forward from a gap-free run), so the
    // next question is the count plus one. localStorage is only readable after
    // mount (see the comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(answered >= total ? resumeLastLabel : resumeLabel.replace("{n}", String(answered + 1)));
  }, [label, resumeLabel, resumeLastLabel, total]);

  return (
    <Button size="lg" href="/quiz" hard fullWidth={fullWidth} data-testid={testId}>
      {shown}
    </Button>
  );
}
