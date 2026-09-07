"use client";

import { useEffect, useRef } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { SEGMENT_MODELS, SEGMENT_SCREEN, SEGMENT_STAGES, type SegmentModel, type SegmentStage } from "@/content/segments";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import type { SegmentAnswers } from "@/lib/submissions/segment";
import styles from "./SegmentSelector.module.css";

interface SegmentSelectorProps {
  locale: Locale;
  segment: SegmentAnswers;
  onChange: (segment: SegmentAnswers) => void;
  onSubmit: () => void;
}

/**
 * The two context questions behind a comparable benchmark — REVIEW-02.md
 * R2-26. Its own screen rather than two more fields on the tone selector:
 * §06a is a designed screen, and keeping this separate means it can be
 * measured, moved or removed without touching it.
 *
 * Nothing here is required. Both questions default to "I'd rather not say",
 * so pressing Continue immediately is a complete answer — the score is never
 * gated on profiling, and the reader falls back to the global average.
 */
export function SegmentSelector({ locale, segment, onChange, onSubmit }: SegmentSelectorProps) {
  const t = SEGMENT_SCREEN;
  // Mounts only once the 15th question is answered — the same transition the
  // tone selector focuses on, for the same reason (REVIEW.md R-19).
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className={styles.wrap} data-testid="segment-screen">
      <MetaLabel size="xs">{tc(t.eyebrow, locale)}</MetaLabel>
      <h2 ref={titleRef} tabIndex={-1} className={styles.title}>
        {tc(t.title, locale)}
      </h2>
      <p className={styles.intro}>{tc(t.intro, locale)}</p>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{tc(t.stageLabel, locale)}</legend>
        <div className={styles.options}>
          {SEGMENT_STAGES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${segment.stage === option.value ? styles.selected : ""}`}
              aria-pressed={segment.stage === option.value}
              data-testid="segment-stage-option"
              onClick={() => onChange({ ...segment, stage: option.value as SegmentStage })}
            >
              {tc(option.label, locale)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{tc(t.modelLabel, locale)}</legend>
        <div className={styles.options}>
          {SEGMENT_MODELS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${segment.model === option.value ? styles.selected : ""}`}
              aria-pressed={segment.model === option.value}
              data-testid="segment-model-option"
              onClick={() => onChange({ ...segment, model: option.value as SegmentModel })}
            >
              {tc(option.label, locale)}
            </button>
          ))}
        </div>
      </fieldset>

      <Button size="lg" fullWidth onClick={onSubmit} data-testid="segment-continue">
        {tc(t.submit, locale)}
      </Button>

      <MetaLabel size="xs" uppercase={false} className={styles.hint}>
        {tc(t.optional, locale)}
      </MetaLabel>
    </div>
  );
}
