import { APP_STREAMS, type AppMonetization, type AppStream } from "@/lib/engine/app-model";
import { shapesOf, type SetupShapes } from "@/lib/engine/catalog-shape";
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

/** What ticking or unticking the sellers' subscription does to the numbers (§22.6.1), counted as a way of earning is. */
export interface SellerSubscriptionChange {
  /** `true`: the box is now ticked (the subscription's numbers appear); `false`: now unticked (the entered ones hide). */
  ticked: boolean;
  /** Unticked: the subscription's numbers already entered, which hide; ticked: the numbers that appear, to fill in. */
  n: number;
}

/**
 * The line the sellers' subscription box says before the save (§22.6.1), on the pattern of `streamChanges` and with the
 * same phrases (`settings.streamOff*` and `streamOn*`): null when the box does not change. The numbers it counts are
 * the five of `shapesOf` that carry `sellerSubscription: true`, the ones the box shows (D9); `entered` is the numbers
 * the engine already holds a value for. Nothing else depends on the box, so there is no total to fear counting twice.
 */
export function sellerSubscriptionChange(setup: SetupShapes, was: boolean, now: boolean, entered: readonly MetricId[]): SellerSubscriptionChange | null {
  if (was === now) return null;
  const subscription = shapesOf({ ...setup, sellerSubscriptions: true })
    .filter((shape) => shape.sellerSubscription)
    .map((shape) => shape.id);
  return { ticked: now, n: now ? subscription.length : subscription.filter((id) => entered.includes(id)).length };
}
