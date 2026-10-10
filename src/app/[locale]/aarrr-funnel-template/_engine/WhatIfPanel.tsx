"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { LeverSum } from "@/components/engine/LeverSum";
import { WhatIfFigures } from "@/components/engine/WhatIfFigures";
import { DotGrid, DotLegend } from "@/components/viz/DotGrid";
import { fillTemplate, joinList, lowerFirst } from "@/lib/engine/format";
import { isApp, monetizationOf } from "@/lib/engine/setup-type";
import type { LeverId } from "@/lib/engine/types";
import { dotsInUse, funnelSteps, gridAria, kpiAnnouncement, kpiRows, leverRows, scenarioFor, targetAt, withTarget, type FunnelStepView, type ScenarioDot } from "./scenario-view";
import type { EngineView } from "./view";
import { leverSumView, moneyAssumptions, whatIfFigureGroups, type FigureGroup } from "./whatif-figures";
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
 * - the growth numbers move with the sliders, each saying whether a change
 *   is better or worse in words — since design system extension 09 (A20.d
 *   T3.b), three tables by meaning (`WhatIfFigures`: growth, one new
 *   customer, cash), the MRR and the ARR in twelve months being the card's,
 *   right above;
 * - with two levers or more, the compounding drawn (`LeverSum`): each lever
 *   alone, the solo gains added up, together, and the one sentence.
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
  // An app without subscriptions has no paying customers: the funnel of the month stops at day 30 (§21.6.4).
  const noPaying = isApp(state.setup) && !monetizationOf(state.setup)!.subscriptions;
  const steps = funnelSteps(scenario, ctx, strings).filter((step) => !(noPaying && step.id === "paying"));
  const figures = whatIfFigureGroups(view, "plg", targets);
  const sum = leverSumView(view, targets);
  const money = moneyAssumptions(view, "plg", targets);
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
          <Figures groups={figures.groups} moved={figures.moved} strings={w} testId="whatif-figures" />
          {!moved ? <p className={styles.note}>{w.noneMoved}</p> : null}
          <p className="tdg-visually-hidden" aria-live="polite" aria-atomic="true" data-testid="whatif-announce">
            {announced}
          </p>
        </section>
      </div>

      {/* The compounding, drawn (extension 09), under the two columns: in the figures' sticky column it would
          make it taller than the screen beside the last levers (the return drew it there, without the sticky). */}
      {sum ? (
        <LeverSum
          title={sum.title}
          rows={sum.rows}
          sum={sum.sum}
          together={sum.together}
          extra={sum.extra ?? undefined}
          data-testid="whatif-alone"
        />
      ) : null}

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

      {scenario.assumptions.length > 0 || money.length > 0 ? (
        <Disclosure summary={w.assumptionsTitle} size="sm" data-testid="whatif-assumptions">
          <ul className={styles.assumptions}>
            {scenario.assumptions.map((a) => (
              <li key={a}>{w.assumption[a]}</li>
            ))}
            {/* The money's own rules, for the figures the tables print (extension 09). */}
            {money.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </div>
  );
}

/** The three tables — the sales-assisted panel's too (`testId`: two panels can be on one screen). */
export function Figures({ groups, moved, strings, testId }: { groups: FigureGroup[]; moved: boolean; strings: EngineView["strings"]["scenario"]; testId: string }) {
  return (
    <WhatIfFigures
      groups={groups}
      moved={moved}
      columns={{ figure: strings.colFigure, today: strings.colToday, whatif: strings.colWhatif, change: strings.colChange }}
      todayLine={(value) => fillTemplate(strings.leverToday, { value: String(value) })}
      data-testid={testId}
    />
  );
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
