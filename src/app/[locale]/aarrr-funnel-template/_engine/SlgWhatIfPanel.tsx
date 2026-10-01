"use client";

import { useId } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { DataTable } from "@/components/core/DataTable";
import { Disclosure } from "@/components/core/Disclosure";
import { fillTemplate, joinList, lowerFirst } from "@/lib/engine/format";
import type { LeverId } from "@/lib/engine/types";
import { quarterRows, slgKpiRows, slgLeverRows, slgScenarioFor, targetAt, withTarget } from "./scenario-view";
import type { EngineView } from "./view";
import { Kpi } from "./WhatIfPanel";
import styles from "./WhatIfPanel.module.css";

type Targets = Partial<Record<LeverId, number>>;

/**
 * « Et si ? », sales-assisted (engine spec §18.5.5, A7.3.c S3): the same
 * panel as self-serve's, on its own levers — the lead-to-opportunity rate,
 * the win rate, renewals, the new contracts' ACV, and in the hybrid the
 * opportunities that come from self-serve (C25 Q7), in whole opportunities.
 *
 * The targets live in the SAME map as self-serve's (`state.whatIf`): each
 * panel reads and writes its own levers there and leaves the other's alone,
 * so « tout remettre à aujourd'hui » here never resets the other motion.
 * In place of self-serve's month of dots, the quarter: the opportunities,
 * how many came from self-serve, the new customers. Every number comes from
 * `slg-scenario.ts` through `scenario-view.ts`; nothing is computed here.
 */
export function SlgWhatIfPanel({ view, onChange }: { view: EngineView; onChange: (targets: Targets) => void }) {
  const { state, ctx, strings, metrics } = view;
  const w = strings.scenario;
  const currency = state.setup.currency;
  const idBase = useId();
  const targets = state.whatIf ?? {};

  const scenario = slgScenarioFor(state, targets, ctx);
  const levers = slgLeverRows(scenario, ctx, strings, currency, metrics);
  const knownLevers = levers.filter((l) => l.today !== null);
  const kpis = slgKpiRows(scenario, ctx, strings, currency, { state, metrics });
  const quarter = quarterRows(state, scenario, ctx, strings);
  const moved = scenario.moved.length > 0;
  const own = new Set<LeverId>(scenario.levers.map((l) => l.id));

  if (knownLevers.length === 0) {
    return (
      <Callout tone="caveat" data-testid="engine-whatif-slg-none">
        <p>{w.noLever}</p>
      </Callout>
    );
  }

  /** This panel's levers back to today; the other motion's targets stay where they are. */
  const resetOwn = () => onChange(Object.fromEntries(Object.entries(targets).filter(([id]) => !own.has(id as LeverId))) as Targets);
  function move(id: LeverId, position: number) {
    const lever = scenario.levers.find((l) => l.id === id);
    if (!lever) return;
    onChange(withTarget(targets, id, targetAt(lever, position)));
  }
  const unknownLevers = levers.filter((l) => l.today === null);

  return (
    <div className={styles.panel} data-testid="engine-whatif-slg-panel">
      <p className={styles.intro}>{w.intro}</p>

      <div className={styles.top}>
        <section className={styles.levers} aria-labelledby={`${idBase}-levers`}>
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-levers`} className={styles.sectionTitle}>
              {w.leversTitle}
            </h3>
            {moved ? (
              <Button variant="quiet" onClick={resetOwn} data-testid="whatif-slg-reset-all">
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
                  // The link's slider already says what it moves; the others are « {lever}, target under test ».
                  aria-label={l.id === "link.pql-handoff" ? l.name : fillTemplate(w.sliderLabel, { lever: l.name })}
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
            <p className={styles.note} data-testid="whatif-slg-unknown-levers">
              {fillTemplate(w.unknownLevers, { list: joinList(unknownLevers.map((l) => lowerFirst(l.name)), strings.grammar) })}
            </p>
          ) : null}
        </section>

        <section className={styles.kpis} aria-labelledby={`${idBase}-kpis`} data-testid="whatif-slg-kpis">
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-kpis`} className={styles.sectionTitle}>
              {w.kpisTitle}
            </h3>
            <span className={styles.sectionMeta}>{moved ? w.kpiIf : w.kpiToday}</span>
          </div>
          <div className={styles.tiles}>
            {kpis.map((k) => (
              <Kpi key={k.id} kpi={k} better={w.better} worse={w.worse} todayTemplate={w.leverToday} testIdPrefix="whatif-slg-kpi" />
            ))}
          </div>
          {!moved ? <p className={styles.note}>{w.noneMoved}</p> : null}
        </section>
      </div>

      {quarter.length > 0 ? (
        <div className={styles.alone} data-testid="whatif-slg-quarter">
          <DataTable
            caption={moved ? w.quarterIf : w.quarterToday}
            size="sm"
            columns={[
              { key: "label", header: w.aloneLever },
              { key: "value", header: moved ? w.kpiIf : w.kpiToday, numeric: true },
            ]}
            rows={quarter.map((row) => ({
              id: row.id,
              cells: {
                label: row.label,
                value: row.projected ? `${row.projected} (${fillTemplate(w.leverToday, { value: row.today })})` : row.today,
              },
            }))}
          />
        </div>
      ) : null}

      {scenario.assumptions.length > 0 ? (
        <Disclosure summary={w.assumptionsTitle} size="sm" data-testid="whatif-slg-assumptions">
          <ul className={styles.assumptions}>
            {scenario.assumptions.map((a) => (
              <li key={a}>{w.slgAssumption[a]}</li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </div>
  );
}
