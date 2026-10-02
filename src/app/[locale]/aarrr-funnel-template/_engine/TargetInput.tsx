"use client";

import { useState } from "react";
import { NumberField } from "@/components/core/NumberField";
import { isUnreadableNumber } from "@/lib/forms/number";
import type { MetricId } from "@/lib/engine/types";
import { percentUnit } from "./sources";
import { domId, fill, metricById } from "./text";
import type { EngineActions, EngineView } from "./view";

/**
 * A team target for one of the numbers that can name the stage holding you
 * back (C1) — written on blur, like the sheet's. On the « Cibles » screen at
 * the start (C40); the Settings receive the same boxes with A18 T3.d.
 */
export function TargetInput({ id, view, actions }: { id: MetricId; view: EngineView; actions: EngineActions }) {
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const target = snapshot.targets[id];
  const [value, setValue] = useState<number | null>(target ?? null);
  const metric = metricById(view.metrics, id);
  return (
    <NumberField
      id={`engine-step-target-${domId(id)}`}
      label={fill(view.strings.targetsStart.targetFor, { metric: metric.name })}
      hint={metric.oneLiner}
      value={value}
      onChange={setValue}
      onBlur={(event) => {
        // An unreadable box stays on screen with its message and writes
        // nothing: the stored target is not erased by a typo (A15.2).
        if (isUnreadableNumber(event.target.value, view.ctx.locale)) return;
        if ((value ?? undefined) !== target) actions.setTarget(id, value);
      }}
      locale={view.ctx.locale}
      digits={5}
      {...percentUnit(view.ctx.locale)}
      parseError={view.strings.workbench.notANumber}
    />
  );
}
