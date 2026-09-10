"use client";

import { useState } from "react";
import Link from "next/link";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Card } from "@/components/core/Card";
import { Bottleneck } from "@/components/result/Bottleneck";
import { PillarChip } from "@/components/result/PillarChip";
import { PriorityMove } from "@/components/result/PriorityMove";
import { ScoreDisplay } from "@/components/result/ScoreDisplay";
import { ToneToggle, type ToneToggleValue } from "@/components/result/ToneToggle";
import styles from "./page.module.css";

export interface PreviewChip {
  /** Already-translated pillar name. */
  label: string;
  score: number;
  href: string;
  weak: boolean;
}

export interface PreviewCardProps {
  /** Every string arrives already translated: this island must not pull the dictionary into the browser bundle (REVIEW-02.md R2-14). */
  caption: string;
  /** The score's own eyebrow, exactly as on the result page. */
  scoreLabel: string;
  toneLabels: { straight: string; roast: string; group: string };
  total: number;
  bottleneckLabel: string;
  bottleneckPillar: string;
  bottleneckScore: number;
  /** The sample headline, one per tone — the only thing the toggle swaps. */
  verdicts: Record<ToneToggleValue, string>;
  chips: PreviewChip[];
  moveLabel: string;
  move: string;
}

/**
 * The landing's preview of a real result — design system extension 03 §4.
 *
 * It mirrors the result screen so the promise matches the delivery: score →
 * bottleneck → pillars → next move, in the same components at `size="mobile"`.
 *
 * **Why the landing gets a tone control and the result page does not.** The
 * result screen shows exactly two CTAs and a third was refused (R-23). This
 * card is a demo, and a demo you can poke is a stronger promise that a roast
 * exists than a line of copy saying so. `compact` keeps it visibly
 * subordinate to "Start your Tour →", which stays the only filled red element
 * on the screen.
 *
 * The score's eyebrow sits on `ScoreDisplay` here, as it does on the result
 * page, rather than in the top row: this card is 448px wide and the compact
 * toggle takes 219 of them, so a top row carrying both the eyebrow and the
 * sample caption wrapped to three lines. The row now holds only what the
 * toggle has to sit beside.
 *
 * **Switching swaps the verdict sentence and paints the bottleneck name red —
 * nothing else.** The full roast treatment (red border, red stamped pillar
 * band) would put a red raised card next to the primary CTA and break the
 * one-primary rule; it would also promise a real roast result from a sample.
 * Neutral is the default here as everywhere (SPEC.md §6bis).
 */
export function PreviewCard({
  caption,
  scoreLabel,
  toneLabels,
  total,
  bottleneckLabel,
  bottleneckPillar,
  bottleneckScore,
  verdicts,
  chips,
  moveLabel,
  move,
}: PreviewCardProps) {
  const [tone, setTone] = useState<ToneToggleValue>("straight");

  return (
    <Card elevation="raised" className={styles.previewCard} data-testid="preview-card">
      <div className={styles.previewTopRow}>
        <MetaLabel size="xs">{caption}</MetaLabel>
        <ToneToggle
          size="compact"
          value={tone}
          onChange={setTone}
          straightLabel={toneLabels.straight}
          roastLabel={toneLabels.roast}
          groupLabel={toneLabels.group}
        />
      </div>

      <ScoreDisplay score={total} label={scoreLabel} size="mobile" />

      <Bottleneck
        data-testid="preview-bottleneck"
        size="mobile"
        sharpness="clear"
        label={bottleneckLabel}
        pillars={[{ pillar: bottleneckPillar, score: bottleneckScore }]}
        verdict={verdicts[tone]}
        tone={tone}
      />

      <div className={styles.previewTags}>
        {/* REVIEW-02.md R2-13: each chip is a link to its pillar's glossary
            page — the landing is the strongest page on the site and passed
            nothing to any term page. */}
        {chips.map((chip) => (
          <Link key={chip.href} href={chip.href} className={styles.previewChipLink} aria-label={chip.label}>
            <PillarChip pillar={chip.label} score={chip.score} size="mobile" weak={chip.weak} />
          </Link>
        ))}
      </div>

      {/* Sample action, no upgrade slot: there is nothing to own here. */}
      <PriorityMove
        data-testid="preview-move"
        className={styles.previewMove}
        label={moveLabel}
        pillar={bottleneckPillar}
        score={bottleneckScore}
      >
        {move}
      </PriorityMove>
    </Card>
  );
}
