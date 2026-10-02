"use client";

import { LeverCard } from "@/components/engine/LeverCard";
import { shapeOf } from "@/lib/engine/catalog-shape";
import type { LeverView } from "@/lib/engine/scenario";
import type { LeverId, MetricId, Motion } from "@/lib/engine/types";
import { diagnosisOf } from "./BoardNumbers";
import { namedStages } from "./number-list";
import {
  funnelSteps,
  kpiRows,
  leverRows,
  scenarioFor,
  slgKpiRows,
  slgLeverRows,
  slgScenarioFor,
  targetAt,
  withTarget,
  type KpiView,
  type LeverRowView,
} from "./scenario-view";
import { fill } from "./text";
import type { EngineView } from "./view";

type Targets = Partial<Record<LeverId, number>>;

/**
 * The lever the card shows (design system extension 07, `LeverCard`): the
 * one of the stage a team target names (C1) — the named number itself when
 * it is a lever, else the first typed lever of that stage; with no target,
 * the first typed lever in the funnel's order. `byStage` says which, for the
 * title. Null: no lever is typed, and the card is not drawn.
 */
export function cardLever(rows: readonly LeverRowView[], named: readonly MetricId[]): { row: LeverRowView; byStage: boolean } | null {
  const known = rows.filter((r) => r.today !== null);
  if (known.length === 0) return null;
  const exact = known.find((r) => named.includes(r.id as MetricId));
  if (exact) return { row: exact, byStage: true };
  const stages = new Set(named.map((id) => shapeOf(id).stage));
  const inStage = known.find((r) => stages.has(shapeOf(r.id as MetricId).stage));
  if (inStage) return { row: inStage, byStage: true };
  return { row: known[0]!, byStage: false };
}

/**
 * « Et si ? » on the board through one lever (design system extension 07,
 * A18 T2.c), in front of the full panel — every lever moving together, the
 * calculation's assumptions printed — which « Les {n} leviers » opens. The
 * card writes the same targets the panel does (`state.whatIf`), through the
 * same `withTarget` and `targetAt`, and reads its two figures from the same
 * calculation: MRR in twelve months, and the month's new paying customers in
 * self-serve (per 100 sign-ups without the month's count), the quarter's new
 * customers in sales-assisted.
 */
export function BoardLever({ view, motion, onChange, onAll }: { view: EngineView; motion: Motion; onChange: (targets: Targets) => void; onAll: () => void }) {
  const { state, ctx, strings, metrics } = view;
  const l = strings.lever;
  const currency = state.setup.currency;
  const targets: Targets = state.whatIf ?? {};
  const diagnosis = diagnosisOf(view, motion);
  const named: readonly MetricId[] = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];
  // A target names a stage: the card says « the stage that holds you back » only when its lever is that stage's.
  const holds = namedStages(diagnosis).size > 0;

  let rows: LeverRowView[];
  let levers: LeverView[];
  let anyMoved: boolean;
  let kpis: KpiView[];
  let second: { label: string; value: string; today: string | null };
  if (motion === "plg") {
    const scenario = scenarioFor(state, targets, ctx);
    rows = leverRows(scenario, ctx, strings, currency, metrics);
    levers = scenario.levers;
    anyMoved = scenario.moved.length > 0;
    kpis = kpiRows(scenario, ctx, strings, currency, { state, metrics });
    const paying = funnelSteps(scenario, ctx, strings).find((s) => s.id === "paying")!;
    second = { label: scenario.today.funnel.perHundred ? l.payingPerHundred : strings.scenario.paying, value: paying.numeral, today: paying.today };
  } else {
    const scenario = slgScenarioFor(state, targets, ctx);
    rows = slgLeverRows(scenario, ctx, strings, currency, metrics);
    levers = scenario.levers;
    anyMoved = scenario.moved.length > 0;
    kpis = slgKpiRows(scenario, ctx, strings, currency, { state, metrics });
    const won = kpis.find((k) => k.id === "won")!;
    second = { label: won.label, value: won.projected ?? won.today ?? "?", today: won.today };
  }

  const chosen = cardLever(rows, named);
  if (!chosen) return null;
  const { row } = chosen;
  const lever = levers.find((x) => x.id === row.id)!;
  const mrr12 = kpis.find((k) => k.id === "mrr12")!;
  const today = (value: string | null) => (anyMoved ? fill(strings.scenario.leverToday, { value: value ?? "?" }) : undefined);
  const known = rows.filter((r) => r.today !== null).length;

  return (
    <LeverCard
      eyebrow={strings.board.whatIfTitle}
      title={
        row.moved
          ? fill(l.moved, { lever: row.name, from: row.todayValue ?? "", to: row.valueText })
          : chosen.byStage
            ? l.untouched
            : holds
              ? l.untouchedOther
              : l.untouchedNoStage
      }
      lever={{
        id: `engine-lever-${row.id.replace(/\./g, "-")}`,
        label: fill(l.label, { lever: row.name, today: row.today ?? "" }),
        min: row.min,
        max: row.max,
        step: row.step,
        value: row.position,
        valueText: row.valueText,
        onChange: (position) => onChange(withTarget(targets, row.id, targetAt(lever, position))),
      }}
      figures={[
        { label: mrr12.label, value: mrr12.projected ?? mrr12.today ?? "?", today: today(mrr12.today) },
        { label: second.label, value: second.value, today: today(second.today) },
      ]}
      allLabel={known > 1 ? fill(l.all, { n: known }) : l.allOne}
      onAll={onAll}
      resetLabel={strings.scenario.reset}
      onReset={() => onChange(withTarget(targets, row.id, null))}
      moved={row.moved}
      data-testid="engine-lever"
    />
  );
}
