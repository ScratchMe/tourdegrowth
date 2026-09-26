"use client";

import { useState } from "react";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Segmented } from "@/components/core/Segmented";
import { comparatorOf, directionOf } from "@/lib/engine/diagnose";
import { formatPercent } from "@/lib/engine/format";
import { whatIf } from "@/lib/engine/impact";
import { buildPeloton } from "@/lib/engine/peloton";
import { PROJECTED_ON_FUNNEL, projectOnFunnel } from "@/lib/engine/projection";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import type { CandidateId, Comparator } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { Peloton } from "./Peloton";
import { fill, metricById } from "./text";
import type { EngineView } from "./view";
import { WhatIf } from "./WhatIf";
import styles from "./WhatIfPanel.module.css";

/** The stages whose change the engine can price (§6.6): the others have no money chain. */
const PRICED: readonly CandidateId[] = ["acq.signup-rate", "act.rate", "rev.paid-conversion", "ret.logo-churn"];

/**
 * « Et si ? » on the whole funnel — Antoine, 2026-09-25: the what-if used to
 * sit in the middle of each number's sheet, one stage at a time, in the
 * middle of typing. Here it is its own moment: pick a stage, move the
 * slider, and the peloton redraws with the target being tested
 * (`projectOnFunnel`), next to the money chain the slide prints (`whatIf`).
 *
 * The slider starts where it always did: the team's target, else the low end
 * of a reference the value is below, else today's value — and a stage with
 * neither a target nor a reference still gets a slider, starting at today:
 * testing a target is how a team finds one.
 */
export function WhatIfPanel({ view }: { view: EngineView }) {
  const { state, ctx, strings } = view;
  const s = strings.steps;
  const available = PRICED.filter((id) => knownIn(state, id, ctx).kind === "known");
  const [chosen, setChosen] = useState<CandidateId | null>(null);
  // Opens on the stage the diagnosis names when it can be priced — the one worth testing first.
  const named = available.find((c) => (view.derived.diagnosis.named as readonly string[]).includes(c));
  const id = chosen && available.includes(chosen) ? chosen : (named ?? available[0] ?? null);
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const cohortSignups = knownSharedCount(snapshot, "cohortSignups")?.value ?? null;

  if (!id) {
    return (
      <Callout tone="caveat" data-testid="engine-whatif-none">
        <p>{s.whatIfNone}</p>
      </Callout>
    );
  }

  const known = knownIn(state, id, ctx);
  if (known.kind !== "known") return null;
  // No target, no reference: start from today — the panel exists to try one.
  const comparator: Comparator = comparatorOf(state, id) ?? { kind: "reference", lo: known.value.lo, hi: known.value.hi, direction: directionOf(id) };
  const onFunnel = PROJECTED_ON_FUNNEL.includes(id);
  const compute = (target: number) => whatIf(state, id, target, ctx, strings.units);

  function funnelCard(target: number, moved: boolean) {
    const next = moved && id ? projectOnFunnel(state, id, target, ctx) : null;
    const projected = next ? buildPeloton(next, ctx) : null;
    const title = projected && id ? fill(s.funnelIf, { stage: strings.subject[id], target: formatPercent(target, ctx.locale) }) : s.funnelToday;
    return (
      <Card elevation="flat" className={styles.funnel}>
        <p className={styles.funnelTitle} data-testid="engine-whatif-funnel-title" aria-live="polite">
          {title}
        </p>
        <Peloton
          peloton={projected ?? view.derived.peloton}
          strings={strings}
          locale={ctx.locale}
          cohortMonth={snapshot.cohortMonth}
          paidWindowDays={state.setup.paidWindowDays}
          diagnosis={projected ? null : view.derived.diagnosis}
          cohortSignups={cohortSignups}
        />
        {!onFunnel && id ? <p className={styles.note}>{id === "ret.logo-churn" ? s.funnelIfChurn : s.funnelIfUpstream}</p> : null}
      </Card>
    );
  }

  return (
    <div className={styles.panel} data-testid="engine-whatif-panel">
      <p className={styles.intro}>{s.whatIfIntro}</p>
      {available.length > 1 ? (
        <Segmented
          label={s.whatIfStage}
          value={id}
          options={available.map((c) => ({ id: c, label: metricById(view.metrics, c).name }))}
          onChange={setChosen}
        />
      ) : null}
      <div className={styles.grid}>
        <WhatIf
          key={id}
          metric={id}
          strings={strings}
          locale={ctx.locale}
          from={known.value}
          comparator={comparator}
          stageName={strings.subject[id]}
          compute={compute}
          aside={funnelCard}
        />
      </div>
    </div>
  );
}
