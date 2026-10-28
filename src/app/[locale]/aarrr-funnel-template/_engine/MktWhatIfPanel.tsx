"use client";

import { useId } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Disclosure } from "@/components/core/Disclosure";
import { LeverSum } from "@/components/engine/LeverSum";
import { fillTemplate, joinList, lowerFirst } from "@/lib/engine/format";
import { buildMktScenario } from "@/lib/engine/mkt-scenario";
import type { LeverId, MktSide } from "@/lib/engine/types";
import { mktAssumptions, mktLeverSum, mktWhatIfGroups } from "./mkt-view";
import { leverRows, targetAt, withTarget } from "./scenario-view";
import type { EngineView } from "./view";
import { Figures } from "./WhatIfPanel";
import styles from "./WhatIfPanel.module.css";

type Targets = Partial<Record<LeverId, number>>;

/**
 * « Et si ? », one side of a marketplace (engine spec §22.6.2, A23 MKT-7b): the same panel as the other motions', on the side's
 * own levers — the buyers' eight (the sign-up rate, the referred share, the first order, the fill rate, churn, the order
 * frequency, the basket, the take rate) or the sellers' three (the conversion to a subscription, the paid sellers' churn, the
 * subscription price) — and, in place of the month's dots, none: the side's funnel is drawn once, under it.
 *
 * `view` carries the side's words (`marketplaceStrings(…, side)`, §22.8.1). The targets live in the SAME map as every motion's
 * (`state.whatIf`): each panel reads and writes its own side's levers there and leaves the other side's alone, so « tout remettre
 * à aujourd'hui » here never resets the other side. Every number comes from `mkt-scenario.ts` through `mkt-view.ts`: nothing is
 * computed here, and the panel, the card above it and the slides cannot disagree.
 */
export function MktWhatIfPanel({ view, side, onChange }: { view: EngineView; side: MktSide; onChange: (targets: Targets) => void }) {
  const { state, ctx, strings, metrics } = view;
  const w = strings.scenario;
  const currency = state.setup.currency;
  const idBase = useId();
  const targets = state.whatIf ?? {};

  const scenario = buildMktScenario(state, targets, ctx, side);
  const levers = leverRows(scenario, ctx, strings, currency, metrics);
  const knownLevers = levers.filter((l) => l.today !== null);
  const unknownLevers = levers.filter((l) => l.today === null);
  const figures = mktWhatIfGroups(view, side);
  const sum = mktLeverSum(view, side);
  const assumptions = mktAssumptions(view, side);
  const moved = scenario.moved.length > 0;
  const own = new Set<LeverId>(scenario.levers.map((l) => l.id));

  if (knownLevers.length === 0) {
    return (
      <Callout tone="caveat" data-testid="engine-whatif-mkt-none">
        <p>{w.noLever}</p>
      </Callout>
    );
  }

  /** This side's levers back to today; the other side's targets stay where they are. */
  const resetOwn = () => onChange(Object.fromEntries(Object.entries(targets).filter(([id]) => !own.has(id as LeverId))) as Targets);
  function move(id: LeverId, position: number) {
    const lever = scenario.levers.find((l) => l.id === id);
    if (!lever) return;
    onChange(withTarget(targets, id, targetAt(lever, position)));
  }

  return (
    <div className={styles.panel} data-testid="engine-whatif-mkt-panel" data-side={side}>
      <p className={styles.intro}>{w.intro}</p>

      <div className={styles.top}>
        <section className={styles.levers} aria-labelledby={`${idBase}-levers`}>
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-levers`} className={styles.sectionTitle}>
              {w.leversTitle}
            </h3>
            {moved ? (
              <Button variant="quiet" onClick={resetOwn} data-testid="whatif-mkt-reset-all">
                {w.resetAll}
              </Button>
            ) : null}
          </div>
          <ul className={styles.leverList}>
            {knownLevers.map((l) => (
              <li key={l.id} className={styles.lever} data-lever={l.id} data-moved={l.moved ? "true" : "false"}>
                <div className={styles.leverHead}>
                  <label htmlFor={`${idBase}-${l.id}`} className={styles.leverName}>
                    {l.name}
                  </label>
                  <output htmlFor={`${idBase}-${l.id}`} className={styles.leverValue} aria-live="off" data-testid={`whatif-value-${l.id}`}>
                    {l.valueText}
                  </output>
                </div>
                <input
                  id={`${idBase}-${l.id}`}
                  type="range"
                  className={styles.slider}
                  min={l.min}
                  max={l.max}
                  step={l.step}
                  value={l.position}
                  aria-label={fillTemplate(w.sliderLabel, { lever: l.name })}
                  aria-valuetext={l.valueText}
                  onChange={(e) => move(l.id, Number(e.target.value))}
                  data-testid={`whatif-slider-${l.id}`}
                />
                <div className={styles.leverFoot}>
                  <span>{l.today}</span>
                  {l.moved ? (
                    <Button variant="quiet" size="sm" onClick={() => onChange(withTarget(targets, l.id, null))} data-testid={`whatif-reset-${l.id}`}>
                      {w.reset}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {unknownLevers.length > 0 ? (
            <p className={styles.note} data-testid="whatif-mkt-unknown-levers">
              {fillTemplate(w.unknownLevers, { list: joinList(unknownLevers.map((l) => lowerFirst(l.name)), strings.grammar) })}
            </p>
          ) : null}
        </section>

        <section className={styles.kpis} aria-labelledby={`${idBase}-kpis`} data-testid="whatif-mkt-kpis">
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-kpis`} className={styles.sectionTitle}>
              {w.kpisTitle}
            </h3>
            <span className={styles.sectionMeta}>{moved ? w.kpiIf : w.kpiToday}</span>
          </div>
          <Figures groups={figures.groups} moved={figures.moved} strings={w} testId="whatif-mkt-figures" />
          {!moved ? <p className={styles.note}>{w.noneMoved}</p> : null}
        </section>
      </div>

      {/* The compounding of THIS side's levers, drawn (extension 09): the other side's are the band's, never here (D2). */}
      {sum ? <LeverSum title={sum.title} rows={sum.rows} sum={sum.sum} together={sum.together} extra={sum.extra ?? undefined} data-testid="whatif-mkt-alone" /> : null}

      {assumptions.length > 0 ? (
        <Disclosure summary={w.assumptionsTitle} size="sm" data-testid="whatif-mkt-assumptions">
          <ul className={styles.assumptions}>
            {assumptions.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </div>
  );
}
