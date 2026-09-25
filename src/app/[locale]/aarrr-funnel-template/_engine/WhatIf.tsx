"use client";

import { useId, useMemo, useState } from "react";
import { Card } from "@/components/core/Card";
import type { Locale } from "@/lib/i18n/locale";
import type { CandidateId, Comparator, Impact, Interval } from "@/lib/engine/types";
import type { EngineStrings } from "@/lib/engine/strings";
import { formatPercent } from "./format-stub";
import { fill, nearestIndex, targetLadder, whatIfTemplate } from "./visual-model";
import styles from "./WhatIf.module.css";

export interface WhatIfProps {
  metric: CandidateId;
  strings: EngineStrings;
  locale: Locale;
  /** The stage's current value, in percent. */
  from: Interval;
  /** The spec only shows "what if" once a comparator exists (§7 E3, point 7). */
  comparator: Comparator;
  /** The stage as the subject of "{stage} reaches {target}" — « l'activation ». */
  stageName: string;
  /**
   * `whatIf(state, metric, target, ctx, strings.units)` from `lib/engine/impact.ts`,
   * bound by the board. Passed in rather than imported so this component
   * only renders what the pure engine computed: the four lines are formatted
   * THERE, from the displayed numbers of the line before (§6.7), and the
   * slide `leak` prints the same `Impact` — screen and slide cannot word one
   * calculation two ways.
   */
  compute: (target: number) => Impact | null;
}

/**
 * « Et si » — engine spec §6.7, the drawer's slider.
 *
 * Moving the slider recomputes: every position calls `compute`, and the four
 * lines are re-rendered from the new `Impact` — never patched in place, so a
 * number on screen is always one the engine produced for THAT target.
 * The spec's own mock showed "38 × 20/18 = 42 (+4)" then "~+500 €"
 * (4 × 120 = 480): the chain was typed by hand. Here nothing is.
 *
 * Starting point (§6.7): the team's target; else the low end of the
 * reference when the value is below it; else the current value — and then
 * **no gain is shown until the user moves**: a chain from 18 % to 18 % is a
 * row of zeros that reads as a finding.
 *
 * The ladder is 0.1 point below 10 %, 1 point from 10 % up; churn only moves
 * down (a higher churn is not a "what if" anyone asks).
 */
export function WhatIf({ metric, strings, locale, from, comparator, stageName, compute }: WhatIfProps) {
  const w = strings.whatIf;
  const churn = metric === "ret.logo-churn";
  const sliderId = useId();

  const ladder = useMemo(
    () => (churn ? targetLadder(0.1, Math.max(from.hi, 0.1)) : targetLadder(Math.min(from.lo, 100), 100)),
    [churn, from.lo, from.hi],
  );

  const start = useMemo(() => {
    if (comparator.kind === "target") return comparator.lo;
    const below = churn ? from.lo > comparator.hi : from.hi < comparator.lo;
    if (below) return churn ? comparator.hi : comparator.lo;
    return churn ? from.hi : from.lo;
  }, [churn, comparator, from.lo, from.hi]);

  const startIsCurrent = start === (churn ? from.hi : from.lo);
  const [index, setIndex] = useState(() => nearestIndex(ladder, start));
  const [moved, setMoved] = useState(false);

  const target = ladder[Math.min(index, ladder.length - 1)] ?? start;
  const impact = useMemo(() => compute(target), [compute, target]);
  const showLines = moved || !startIsCurrent;
  const rendered = (i: Impact) =>
    i.lines.map((line) => {
      const { label, template } = whatIfTemplate(line, i, w, locale);
      return { key: line.key, label, text: fill(template, { stage: stageName, ...line.values }) };
    });

  return (
    <Card tone="outlineAlert" className={styles.card} data-testid="engine-whatif">
      <p className={styles.title}>{w.title}</p>

      <div className={styles.control}>
        <label htmlFor={sliderId} className={styles.label}>
          {fill(w.slider, { stage: stageName })}
          <span className={styles.value} data-testid="whatif-target">
            {formatPercent(target, locale)}
          </span>
        </label>
        <input
          id={sliderId}
          type="range"
          className={styles.slider}
          min={0}
          max={ladder.length - 1}
          step={1}
          value={index}
          aria-valuetext={formatPercent(target, locale)}
          onChange={(e) => {
            setIndex(Number(e.target.value));
            setMoved(true);
          }}
          data-testid="whatif-slider"
        />
      </div>

      {/* Polite: a recomputed chain is announced once the slider settles, not on every step. */}
      <div aria-live="polite" className={styles.result}>
        {!showLines ? <p className={styles.hint}>{strings.visual.whatIfMove}</p> : null}
        {showLines && impact ? (
          <div data-testid="whatif-lines">
            <dl className={styles.lines}>
              {rendered(impact)
                .filter((l) => l.label)
                .map((l) => (
                  <div key={l.key} className={styles.line} data-line={l.key}>
                    <dt className={styles.lineLabel}>{l.label}</dt>
                    <dd className={styles.lineText}>{l.text}</dd>
                  </div>
                ))}
            </dl>
            {/* The annual line and "less than one" conclude the chain rather than being a step of it. */}
            {rendered(impact)
              .filter((l) => !l.label)
              .map((l) => (
                <p key={l.key} className={styles.conclusion} data-line={l.key}>
                  {l.text}
                </p>
              ))}
          </div>
        ) : null}
      </div>

      {metric === "act.rate" ? <p className={styles.note}>{w.assumptionActivation}</p> : null}
      <p className={styles.note}>{w.multiplication}</p>
      <p className={styles.note}>{w.notForecast}</p>
    </Card>
  );
}
