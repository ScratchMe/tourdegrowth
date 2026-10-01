"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { DataTable } from "@/components/core/DataTable";
import { Disclosure } from "@/components/core/Disclosure";
import { DotGrid, DotLegend } from "@/components/viz/DotGrid";
import { StatTile } from "@/components/viz/StatTile";
import { fillTemplate, joinList, lowerFirst } from "@/lib/engine/format";
import type { LeverId } from "@/lib/engine/types";
import {
  dotsInUse,
  funnelSteps,
  gainText,
  roundedMoney,
  gridAria,
  kpiAnnouncement,
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

/** How long a slider must rest before its figures are read (MWG accessibility §8: debounce a changing region). */
const ANNOUNCE_DELAY_MS = 500;

/**
 * « Et si ? », cumulated — Antoine, 2026-09-26: every lever at once, and the
 * effects compound. It used to be one stage at a time, with the peloton
 * redrawn beside it; now:
 *
 * - every lever the engine can move has its slider, the targets live in the
 *   state (`actions.setWhatIf`), so the deck prints one slide per lever and a
 *   file carries them;
 * - the funnel starts at the VISITORS — a better sign-up rate finally shows —
 *   and its grids grow past 100 dots, ringed, for what the what-ifs add (no red:
 *   a projected change is not a diagnosis — audit S-5, 2026-09-28);
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
  const kpis = kpiRows(scenario, ctx, strings, currency, { state, metrics });
  const moved = scenario.moved.length > 0;

  // What a screen reader hears, once a slider has settled (design audit S-4).
  // Nothing for the figures the panel opened with: opening it is not news
  // (and a ref, not a first-render flag, so React's development double
  // effect does not announce them either). Each change restarts the wait, so
  // dragging or holding an arrow key announces the figures once, where they
  // came to rest — never at every step. Back to today is a change too.
  const announcement = kpiAnnouncement(kpis, moved, strings);
  const [announced, setAnnounced] = useState("");
  const lastSeen = useRef(announcement);
  useEffect(() => {
    if (announcement === lastSeen.current) return;
    lastSeen.current = announcement;
    const timer = window.setTimeout(() => setAnnounced(announcement), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  if (knownLevers.length === 0) {
    return (
      <Callout tone="caveat" data-testid="engine-whatif-none">
        <p>{w.noLever}</p>
      </Callout>
    );
  }

  const unknownLevers = levers.filter((l) => l.today === null);
  const steps = funnelSteps(scenario, ctx, strings);
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
              // Self-serve's levers back to today; sales-assisted's targets, in the same map, stay (A7.3.c S3).
              <Button
                variant="quiet"
                onClick={() => set(Object.fromEntries(Object.entries(targets).filter(([id]) => !scenario.levers.some((l) => l.id === id))) as Targets)}
                data-testid="whatif-reset-all"
              >
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
                  {/* `aria-live="off"`: an <output> is a status region by default, and the
                      slider's own `aria-valuetext` already says the value at every step. */}
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
                    <Button variant="quiet" size="sm" onClick={() => set(withTarget(targets, l.id, null))} data-testid={`whatif-reset-${l.id}`}>
                      {w.reset}
                    </Button>
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
          {/* Not a live region: seven tiles re-read at every step of a slider was
              the audit's S-4. The one sentence below says what moved, once. */}
          <div className={styles.tiles}>
            {kpis.map((k) => (
              <Kpi key={k.id} kpi={k} better={w.better} worse={w.worse} todayTemplate={w.leverToday} />
            ))}
          </div>
          {!moved ? <p className={styles.note}>{w.noneMoved}</p> : null}
          <p className="tdg-visually-hidden" aria-live="polite" aria-atomic="true" data-testid="whatif-announce">
            {announced}
          </p>
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
                    extra: fillTemplate(view.strings.units.approx, { n: roundedMoney(gains.together - gains.sumAlone, currency, ctx) }),
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

/** One growth figure's tile — the sales-assisted panel's too (`testIdPrefix`: two panels can be on one screen). */
export function Kpi({
  kpi,
  better,
  worse,
  todayTemplate,
  testIdPrefix = "whatif-kpi",
}: {
  kpi: KpiView;
  better: string;
  worse: string;
  todayTemplate: string;
  testIdPrefix?: string;
}) {
  const common = { label: kpi.label, size: "auto" as const, "data-testid": `${testIdPrefix}-${kpi.id}` };
  if (kpi.projected === null) return <StatTile {...common} value={null} unknownLabel={kpi.unknown} />;
  // « aujourd'hui … » only once it differs: the same figure twice says nothing.
  const sub = kpi.today !== null && kpi.today !== kpi.projected ? fillTemplate(todayTemplate, { value: kpi.today }) : undefined;
  // Bold ink, neither green nor red, like the slides' « change » column: the sign and the word say
  // which way, and a projection is no verdict (Antoine, 2026-09-28 — green and red read as one).
  const delta =
    kpi.delta && kpi.direction && kpi.tone
      ? { text: `${kpi.delta} · ${kpi.tone === "better" ? better : worse}`, direction: kpi.direction, sentiment: "neutral" as const }
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
      <DotGrid grid={unknown ? { kind: "unknown", dots: [] } : grid} label={aria} className={styles.grid} />
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
      <DotLegend data-testid="whatif-legend" items={items.map((item) => ({ mark: item.dot, label: item.key ? strings[item.key] : range }))} />
      <p className={styles.note}>{strings.legendUnit}</p>
    </div>
  );
}
