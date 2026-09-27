"use client";

import { useId } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { DataTable } from "@/components/core/DataTable";
import { Disclosure } from "@/components/core/Disclosure";
import { StatTile } from "@/components/viz/StatTile";
import { fillTemplate, formatMoney, joinList, lowerFirst } from "@/lib/engine/format";
import type { LeverId } from "@/lib/engine/types";
import {
  dotsInUse,
  funnelSteps,
  gainText,
  gridAria,
  kpiRows,
  leverGains,
  leverRows,
  scenarioFor,
  targetAt,
  withTarget,
  type FunnelStepView,
  type KpiView,
  type ScenarioDot,
} from "./scenario-view";
import type { EngineView } from "./view";
import styles from "./WhatIfPanel.module.css";

type Targets = Partial<Record<LeverId, number>>;

/**
 * « Et si ? », cumulated — Antoine, 2026-09-26: every lever at once, and the
 * effects compound. It used to be one stage at a time, with the peloton
 * redrawn beside it; now:
 *
 * - every lever the engine can move has its slider, the targets live in the
 *   state (`actions.setWhatIf`), so the deck prints one slide per lever and a
 *   file carries them;
 * - the funnel starts at the VISITORS — a better sign-up rate finally shows —
 *   and its grids grow past 100 dots, in red, for what the what-ifs add;
 * - the growth numbers (MRR in twelve months, new MRR, NRR, GRR, CAC, LTV,
 *   payback) move with the sliders, each saying whether a change is better
 *   or worse in words;
 * - with two levers or more, a table of what each brings alone, and the one
 *   sentence that shows the compounding.
 *
 * Every number comes from `lib/engine/scenario.ts` through `scenario-view.ts`:
 * nothing is computed here, so the panel and the slides cannot disagree.
 */
export function WhatIfPanel({ view, onChange }: { view: EngineView; onChange: (targets: Targets) => void }) {
  const { state, ctx, strings, metrics } = view;
  const w = strings.scenario;
  const currency = state.setup.currency;
  const idBase = useId();
  // The state is the one place the targets live: no copy here to keep in step with it.
  const targets = state.whatIf ?? {};
  const set = onChange;

  const scenario = scenarioFor(state, targets, ctx);
  const levers = leverRows(scenario, ctx, strings, currency, metrics);
  const knownLevers = levers.filter((l) => l.today !== null);

  if (knownLevers.length === 0) {
    return (
      <Callout tone="caveat" data-testid="engine-whatif-none">
        <p>{w.noLever}</p>
      </Callout>
    );
  }

  const unknownLevers = levers.filter((l) => l.today === null);
  const steps = funnelSteps(scenario, ctx, strings);
  const kpis = kpiRows(scenario, ctx, strings, currency, { state, metrics });
  const moved = scenario.moved.length > 0;
  const gains = scenario.moved.length >= 2 ? leverGains(state, scenario, ctx) : null;
  const inUse = dotsInUse(steps);
  const [visitors, ...columns] = steps;

  function move(id: LeverId, position: number) {
    const lever = scenario.levers.find((l) => l.id === id);
    if (!lever) return;
    set(withTarget(targets, id, targetAt(lever, position)));
  }

  return (
    <div className={styles.panel} data-testid="engine-whatif-panel">
      <p className={styles.intro}>{w.intro}</p>

      <div className={styles.top}>
        <section className={styles.levers} aria-labelledby={`${idBase}-levers`}>
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-levers`} className={styles.sectionTitle}>
              {w.leversTitle}
            </h3>
            {moved ? (
              <Button variant="quiet" onClick={() => set({})} data-testid="whatif-reset-all">
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
                  <output htmlFor={`${idBase}-${l.id}`} className={styles.leverValue} data-testid={`whatif-value-${l.id}`}>
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
                    <button type="button" className={styles.reset} onClick={() => set(withTarget(targets, l.id, null))} data-testid={`whatif-reset-${l.id}`}>
                      {w.reset}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {unknownLevers.length > 0 ? (
            <p className={styles.note} data-testid="whatif-unknown-levers">
              {fillTemplate(w.unknownLevers, { list: joinList(unknownLevers.map((l) => lowerFirst(l.name)), strings.grammar) })}
            </p>
          ) : null}
        </section>

        <section className={styles.kpis} aria-labelledby={`${idBase}-kpis`} data-testid="whatif-kpis">
          <div className={styles.sectionHead}>
            <h3 id={`${idBase}-kpis`} className={styles.sectionTitle}>
              {w.kpisTitle}
            </h3>
            <span className={styles.sectionMeta}>{moved ? w.kpiIf : w.kpiToday}</span>
          </div>
          {/* Polite: the figures are announced once a slider settles, never step by step. */}
          <div className={styles.tiles} aria-live="polite">
            {kpis.map((k) => (
              <Kpi key={k.id} kpi={k} better={w.better} worse={w.worse} todayTemplate={w.leverToday} />
            ))}
          </div>
          {!moved ? <p className={styles.note}>{w.noneMoved}</p> : null}
        </section>
      </div>

      <Card elevation="flat" className={styles.funnel}>
        <p className={styles.funnelTitle} data-testid="engine-whatif-funnel-title">
          {moved ? w.funnelIf : w.funnelToday}
        </p>
        {scenario.today.funnel.perHundred ? <p className={styles.note}>{w.perHundredNote}</p> : null}
        {visitors ? <Upstream step={visitors} /> : null}
        <div className={styles.columns}>
          {columns.map((step) => (
            <Column key={step.id} step={step} aria={gridAria(step, strings)} />
          ))}
        </div>
        <Legend inUse={inUse} strings={w} range={strings.peloton.legendRange} />
      </Card>

      {gains ? (
        <div className={styles.alone} data-testid="whatif-alone">
          <DataTable
            caption={w.aloneTitle}
            size="sm"
            columns={[
              { key: "lever", header: w.aloneLever },
              { key: "gain", header: w.aloneGain, numeric: true },
            ]}
            rows={gains.alone.map((g) => {
              const row = levers.find((l) => l.id === g.id)!;
              return {
                id: g.id,
                cells: {
                  lever: fillTemplate(w.aloneRow, { lever: row.name, from: row.todayValue ?? "", to: row.valueText }),
                  gain: g.gain === null ? w.unknownStep : gainText(g.gain, currency, ctx),
                },
              };
            })}
          />
          {gains.together !== null ? (
            <p className={styles.together} data-testid="whatif-together">
              {gains.sumAlone !== null && gains.together - gains.sumAlone >= 1
                ? fillTemplate(w.together, {
                    total: gainText(gains.together, currency, ctx),
                    extra: formatMoney(Math.round(gains.together - gains.sumAlone), currency, ctx.locale),
                  })
                : fillTemplate(w.togetherNoExtra, { total: gainText(gains.together, currency, ctx) })}
            </p>
          ) : null}
        </div>
      ) : null}

      {scenario.assumptions.length > 0 ? (
        <Disclosure summary={w.assumptionsTitle} size="sm" data-testid="whatif-assumptions">
          <ul className={styles.assumptions}>
            {scenario.assumptions.map((a) => (
              <li key={a}>{w.assumption[a]}</li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </div>
  );
}

function Kpi({ kpi, better, worse, todayTemplate }: { kpi: KpiView; better: string; worse: string; todayTemplate: string }) {
  const common = { label: kpi.label, size: "responsive" as const, "data-testid": `whatif-kpi-${kpi.id}` };
  if (kpi.projected === null) return <StatTile {...common} value={null} unknownLabel={kpi.unknown} />;
  // « aujourd'hui … » only once it differs: the same figure twice says nothing.
  const sub = kpi.today !== null && kpi.today !== kpi.projected ? fillTemplate(todayTemplate, { value: kpi.today }) : undefined;
  const delta =
    kpi.delta && kpi.direction && kpi.tone
      ? { text: `${kpi.delta} · ${kpi.tone === "better" ? better : worse}`, direction: kpi.direction, sentiment: kpi.tone === "better" ? ("good" as const) : ("bad" as const) }
      : undefined;
  return <StatTile {...common} value={kpi.projected} sub={sub} delta={delta} />;
}

/** The visitors, above the grids: 26 000 dots would say nothing, so a numeral and its change. */
function Upstream({ step }: { step: FunnelStepView }) {
  return (
    <div className={styles.upstream} data-testid="whatif-step-visitors">
      {/* An SVG, never a glyph: no arrow exists in Stardos Stencil (Peloton.module.css). */}
      <svg className={styles.arrow} viewBox="0 0 28 12" aria-hidden="true" focusable="false">
        <path d="M0 6 H25 M19 1 L26 6 L19 11" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className={styles.upstreamNumeral}>{step.numeral}</span>
      <span className={styles.upstreamLabel}>{step.label}</span>
      {step.delta ? (
        <span className={styles.delta} data-sign={step.deltaSign}>
          {step.delta}
        </span>
      ) : null}
    </div>
  );
}

function Column({ step, aria }: { step: FunnelStepView; aria: string }) {
  const grid = step.grid;
  const unknown = !grid || grid.kind === "unknown";
  return (
    <div className={styles.column} data-step={step.id} data-testid={`whatif-step-${step.id}`}>
      <div className={styles.numeral}>{step.numeral}</div>
      <div className={styles.label}>{step.label}</div>
      <div role="img" aria-label={aria} className={[styles.grid, unknown ? styles.unknownGrid : ""].filter(Boolean).join(" ")}>
        {unknown ? (
          <span className={styles.unknownMark} aria-hidden="true">
            ?
          </span>
        ) : (
          grid.dots.map((dot, i) => <span key={i} className={`${styles.dot} ${styles[dot]}`} data-dot={dot} aria-hidden="true" />)
        )}
      </div>
      {step.detail ? <p className={styles.detail}>{step.detail}</p> : null}
      {step.delta ? (
        <p className={styles.delta} data-sign={step.deltaSign}>
          {step.delta}
        </p>
      ) : null}
    </div>
  );
}

const LEGEND: readonly { dot: ScenarioDot; key: "legendThere" | "legendGained" | "legendLost" | null }[] = [
  { dot: "filled", key: "legendThere" },
  { dot: "gained", key: "legendGained" },
  { dot: "lost", key: "legendLost" },
  { dot: "range", key: null },
];

/** Names only the shapes drawn: a legend entry for a shape nobody sees is one more thing to read. */
function Legend({ inUse, strings, range }: { inUse: Set<ScenarioDot>; strings: EngineView["strings"]["scenario"]; range: string }) {
  const hasRange = inUse.has("range") || inUse.has("gainedRange");
  const items = LEGEND.filter((item) => (item.dot === "range" ? hasRange : inUse.has(item.dot) || (item.dot === "gained" && inUse.has("gainedRange"))));
  return (
    <div className={styles.legendWrap}>
      <ul className={styles.legend} data-testid="whatif-legend">
        {items.map((item) => (
          <li key={item.dot}>
            <span className={`${styles.swatch} ${styles[item.dot]}`} aria-hidden="true" />
            {item.key ? strings[item.key] : range}
          </li>
        ))}
      </ul>
      <p className={styles.note}>{strings.legendUnit}</p>
    </div>
  );
}
