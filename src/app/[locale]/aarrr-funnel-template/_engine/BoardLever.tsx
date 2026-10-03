"use client";

import { LeverCard } from "@/components/engine/LeverCard";
import { MrrCurve } from "@/components/engine/MrrCurve";
import { shapeOf } from "@/lib/engine/catalog-shape";
import type { LeverView } from "@/lib/engine/scenario";
import type { DiagnosisState, LeverId, MetricId, Motion } from "@/lib/engine/types";
import { diagnosisOf } from "./BoardNumbers";
import { leverMoneyView } from "./money-view";
import { namedStages } from "./number-list";
import {
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

/** The card's first figure: its value, or — unknown with the what-ifs — what is missing, in words (`scenario.kpiUnknown`). */
type Figure = { label: string; value: string; unknown: boolean; today: string | null };

function figureOf(kpi: KpiView): Figure {
  const value = kpi.projected ?? kpi.today;
  return { label: kpi.label, value: value ?? kpi.unknown, unknown: value === null, today: kpi.today };
}

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

type TitleKey = "moved" | "movedWithOthers" | "untouched" | "untouchedShared" | "untouchedNoStage" | "untouchedOther" | "untouchedWithOthers";

/**
 * The card's title (the copy review of A18 T2.c): never a sentence the
 * diagnosis beside it contradicts. A stage named by a target, and the card's
 * lever is its: « the stage that holds you back », or « one of the stages »
 * when several hold back as much (`shared`). Fewer than two stages with a
 * target (`not-enough`): how to get one named. Nothing holds back (`level`),
 * or the named stage has no lever with a value: just the invitation. A lever
 * moved in the full panel counts in the figures: the title says so.
 */
export function titleKey(c: { moved: boolean; others: boolean; byStage: boolean; stagesNamed: number; state: DiagnosisState }): TitleKey {
  if (c.moved) return c.others ? "movedWithOthers" : "moved";
  if (c.others) return "untouchedWithOthers";
  if (c.byStage) return c.stagesNamed > 1 ? "untouchedShared" : "untouched";
  return c.state === "not-enough" ? "untouchedNoStage" : "untouchedOther";
}

/**
 * « Et si ? » on the board through one lever (design system extension 07,
 * A18 T2.c), in front of the full panel — every lever moving together, the
 * calculation's assumptions printed — which « Les {n} leviers » opens. The
 * card writes the same targets the panel does (`state.whatIf`), through the
 * same `withTarget` and `targetAt`, and reads its figures from the same
 * calculation.
 *
 * Extension 09 (A20.d T3.a): the curve of the MRR month by month, the MRR
 * and the ARR in twelve months (the month's new paying customers stay in the
 * panel's funnel), the one-customer line when the board shows a loss, and in
 * the hybrid both engines' MRR in twelve months — `money-view.ts#leverMoneyView`.
 */
export function BoardLever({
  view,
  motion,
  hybrid = false,
  onChange,
  onAll,
}: {
  view: EngineView;
  motion: Motion;
  hybrid?: boolean;
  onChange: (targets: Targets) => void;
  onAll: () => void;
}) {
  const { state, ctx, strings, metrics } = view;
  const l = strings.lever;
  const currency = state.setup.currency;
  const targets: Targets = state.whatIf ?? {};
  const diagnosis = diagnosisOf(view, motion);
  const named: readonly MetricId[] = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];
  // A target names a stage: the card says « the stage that holds you back » only when its lever is that stage's —
  // « one of the stages » when several hold back as much.
  const stagesNamed = namedStages(diagnosis).size;

  let rows: LeverRowView[];
  let levers: LeverView[];
  let moved: readonly LeverId[];
  let kpis: KpiView[];
  if (motion === "plg") {
    const scenario = scenarioFor(state, targets, ctx);
    rows = leverRows(scenario, ctx, strings, currency, metrics);
    levers = scenario.levers;
    moved = scenario.moved;
    kpis = kpiRows(scenario, ctx, strings, currency, { state, metrics });
  } else {
    const scenario = slgScenarioFor(state, targets, ctx);
    rows = slgLeverRows(scenario, ctx, strings, currency, metrics);
    levers = scenario.levers;
    moved = scenario.moved;
    kpis = slgKpiRows(scenario, ctx, strings, currency, { state, metrics });
  }

  const chosen = cardLever(rows, named);
  if (!chosen) return null;
  const { row } = chosen;
  const lever = levers.find((x) => x.id === row.id)!;
  const mrr12 = figureOf(kpis.find((k) => k.id === "mrr12")!);
  const money = leverMoneyView(view, motion, targets, row.id, hybrid);
  // « aujourd'hui … » once anything moved, and only under a figure known today: never « aujourd'hui ? ».
  const today = (figure: Figure) => (moved.length > 0 && figure.today ? fill(strings.scenario.leverToday, { value: figure.today }) : undefined);
  const known = rows.filter((r) => r.today !== null).length;
  // The figures come from the whole scenario: a lever moved in the full panel counts in them too.
  const others = moved.some((id) => id !== row.id);
  const movedText = (template: string) => fill(template, { lever: row.name, from: row.todayValue ?? "", to: row.valueText });

  return (
    <LeverCard
      eyebrow={strings.board.whatIfTitle}
      title={
        row.moved
          ? movedText(l[titleKey({ moved: true, others, byStage: chosen.byStage, stagesNamed, state: diagnosis.state })])
          : l[titleKey({ moved: false, others, byStage: chosen.byStage, stagesNamed, state: diagnosis.state })]
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
      curve={
        money.curve ? (
          <MrrCurve
            id={`engine-lever-curve-${motion}`}
            today={money.curve.today}
            whatif={money.curve.whatif}
            keys={money.curve.keys}
            start={money.curve.start}
            xLabels={money.curve.xLabels}
            summary={money.curve.summary}
            data-testid="engine-lever-curve"
          />
        ) : undefined
      }
      figures={[
        { key: "mrr12", label: mrr12.label, value: mrr12.value, unknown: mrr12.unknown, today: today(mrr12) },
        { key: "arr12", label: money.arr12.label, value: money.arr12.value, unknown: money.arr12.unknown, today: money.arr12.today ?? undefined },
      ]}
      worth={money.worth ?? undefined}
      total={money.total ?? undefined}
      allLabel={known > 1 ? fill(l.all, { n: known }) : l.allOne}
      onAll={onAll}
      resetLabel={strings.scenario.reset}
      onReset={() => onChange(withTarget(targets, row.id, null))}
      moved={row.moved}
      data-testid="engine-lever"
    />
  );
}
