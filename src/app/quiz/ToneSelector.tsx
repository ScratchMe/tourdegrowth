"use client";

import { Button } from "@/components/core/Button";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import styles from "./ToneSelector.module.css";

export type { Tone };

interface ToneSelectorProps {
  locale: Locale;
  tone: Tone;
  onSelectTone: (tone: Tone) => void;
  onSubmit: () => void;
}

/** Tone selector — DESIGN-BRIEF.md §06a. "Straight up" (neutral) is the SPEC.md §6bis default. */
export function ToneSelector({ locale, tone, onSelectTone, onSubmit }: ToneSelectorProps) {
  const t = UI_STRINGS.toneSelector;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{tc(t.title, locale)}</h2>

      <div className={styles.options}>
        <ToneOption
          selected={tone === "neutral"}
          title={tc(t.neutralTitle, locale)}
          description={tc(t.neutralDescription, locale)}
          onClick={() => onSelectTone("neutral")}
        />
        <ToneOption
          selected={tone === "roast"}
          title={tc(t.roastTitle, locale)}
          description={tc(t.roastDescription, locale)}
          badge="🔥"
          onClick={() => onSelectTone("roast")}
        />
      </div>

      <Button size="lg" fullWidth onClick={onSubmit} data-testid="get-score-cta">
        {tc(t.cta, locale)}
      </Button>

      <MetaLabel size="xs" uppercase={false} className={styles.hint}>
        {tc(t.switchHint, locale)}
      </MetaLabel>
    </div>
  );
}

function ToneOption({
  selected,
  title,
  description,
  badge,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="tone-option"
      className={`${styles.option} ${selected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <span className={styles.optionTop}>
        <span className={styles.optionTitle}>
          {title}
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </span>
        <span className={`${styles.radio} ${selected ? styles.radioSelected : ""}`} aria-hidden="true" />
      </span>
      <span className={styles.optionDescription}>{description}</span>
    </button>
  );
}
