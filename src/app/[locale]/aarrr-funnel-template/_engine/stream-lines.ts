import { APP_STREAMS, type AppMonetization, type AppStream } from "@/lib/engine/app-model";
import { shapesOf } from "@/lib/engine/catalog-shape";
import type { BusinessType, MetricId, Motion } from "@/lib/engine/types";

/** A consumer app sells self-serve only (§21.1 D1): the motions `shapesOf` reads for it. */
const APP_MOTIONS: Record<Motion, boolean> = { plg: true, slg: false };

/** What ticking or unticking one way of earning does to the numbers, counted as if that way changed alone (§21.6.2). */
export interface StreamChange {
  stream: AppStream;
  /** `true`: the way is now ticked (numbers appear); `false`: now unticked (entered numbers hide). */
  ticked: boolean;
  /** Unticked: the entered numbers that hide; ticked: the numbers that appear. */
  n: number;
}

/**
 * The line each changed way of earning says before the save (§21.6.2, decided by Antoine on 2026-10-07): every line
 * counts as if its way changed alone from `was`, so unticking two ways at once gives each its own count, and a number
 * only the two together would hide (the actives' retention) is counted on neither. Read off `shapesOf`, the lists of
 * numbers the engine shows. `entered`: the numbers the engine already holds a value for.
 */
export function streamChanges(type: BusinessType, was: AppMonetization, now: AppMonetization, entered: readonly MetricId[]): StreamChange[] {
  const listed = (monetization: AppMonetization) => shapesOf({ type, motions: APP_MOTIONS, monetization }).map((shape) => shape.id);
  const before = listed(was);
  return APP_STREAMS.flatMap((stream) => {
    if (was[stream] === now[stream]) return [];
    const after = listed({ ...was, [stream]: now[stream] });
    const n = was[stream]
      ? entered.filter((metric) => before.includes(metric) && !after.includes(metric)).length
      : after.filter((metric) => !before.includes(metric)).length;
    return [{ stream, ticked: now[stream], n }];
  });
}
