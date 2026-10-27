import { shapesOf } from "@/lib/engine/catalog-shape";
import { mktCandidates } from "@/lib/engine/diagnose";
import { joinList } from "@/lib/engine/format";
import { candidatesFor } from "@/lib/engine/scenario-of";
import { activeMotions, isSellingMotion } from "@/lib/engine/setup-type";
import { knownSharedCount, settingsSharedCounts } from "@/lib/engine/shared-counts";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { CandidateId, EngineMotion, EngineSetup, EngineState, MktSide } from "@/lib/engine/types";
import type { SettingsNumbers } from "./Setup";
import { catalogFill, fill, metricById, midSentence } from "./text";

/** A marketplace's two sides, demand first (§22.2.1): the order its groups, its screens and its slides read in. */
const MKT_SIDES: readonly MktSide[] = ["demand", "supply"];

/** One group of target boxes: a selling motion's, or one side of a marketplace's (§22.6.1). */
export interface TargetGroup {
  motion: EngineMotion;
  /** A marketplace's only: its two sides are two groups of the one motion. */
  side?: MktSide;
  ids: readonly CandidateId[];
}

/**
 * The groups of target boxes a setup offers, in the order the screens show them: one per motion ticked, self-serve first;
 * for a marketplace, which ticks none, one per side, the demand's first, each with the candidates that side positions
 * (`mktCandidates`, so the sellers' subscription numbers are boxes only when the sellers pay). Read by « Cibles » at the
 * start and by the Settings, which show the same boxes.
 */
export function targetGroups(setup: EngineSetup): TargetGroup[] {
  return activeMotions(setup).flatMap((motion): TargetGroup[] => {
    if (isSellingMotion(motion)) return [{ motion, ids: candidatesFor(setup, motion) }];
    return MKT_SIDES.map((side) => ({ motion, side, ids: mktCandidates(side, setup) }));
  });
}

/**
 * What the settings show of the numbers (A18 T3.d), from the engine as it is
 * when the card opens:
 * - the targets of the numbers that can name a stage (C1), one group per
 *   motion ticked (`targetGroups`, a marketplace's one per side, titled), each
 *   box labelled by its number and its one-liner, as on the start's « Cibles »;
 * - the shared counts (`settingsSharedCounts`), each labelled as the
 *   catalogue labels it in its first number — its months filled as that
 *   number's screen fills them (`{period}`) — the numbers that use it said
 *   under it, mid-sentence (`midSentence`, as the number's screen says them).
 */
export function settingsNumbers(state: EngineState, metrics: ResolvedMetric[], strings: EngineStrings, locale: "en" | "fr", today: Date): SettingsNumbers {
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const { motions } = state.setup;
  const hybrid = motions.plg && motions.slg;
  // The numbers the engine shows (§21.6.2): a SaaS's by its motions, an app's by what it earns from, a marketplace's by its sellers' subscription.
  const shown = shapesOf(state.setup).map((shape) => shape.id);
  return {
    targets: targetGroups(state.setup).map(({ motion, side, ids }) => ({
      motion,
      ...(side ? { side } : {}),
      // The hybrid names its two engines; a marketplace always names its two sides (they are one group each, never one engine).
      title: side ? strings.mkt.side[`${side}Title`] : hybrid && isSellingMotion(motion) ? strings.hybrid.motionName[motion] : null,
      boxes: ids.map((id) => {
        const metric = metricById(metrics, id);
        return { id, label: metric.name, hint: metric.oneLiner, value: snapshot.targets[id] ?? null };
      }),
    })),
    shared: settingsSharedCounts(shown).map(({ count, slots }) => {
      const first = slots[0]!;
      return {
        count,
        label: catalogFill(metricById(metrics, first.metric).inputs?.[first.side] ?? "", {
          state,
          locale,
          strings,
          metrics,
          windowDays: null,
          period: { id: first.metric, today },
        }),
        hint: fill(strings.settings.sharedHint, {
          list: joinList(slots.map((slot) => midSentence(metricById(metrics, slot.metric).name, locale)), strings.grammar),
        }),
        value: knownSharedCount(snapshot, count)?.value ?? null,
      };
    }),
  };
}
