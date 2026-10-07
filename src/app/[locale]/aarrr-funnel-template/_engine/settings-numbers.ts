import { shapesOf } from "@/lib/engine/catalog-shape";
import { joinList } from "@/lib/engine/format";
import { candidatesFor } from "@/lib/engine/scenario-of";
import { knownSharedCount, settingsSharedCounts } from "@/lib/engine/shared-counts";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import type { SettingsNumbers } from "./Setup";
import { catalogFill, fill, metricById, midSentence } from "./text";

/**
 * What the settings show of the numbers (A18 T3.d), from the engine as it is
 * when the card opens:
 * - the targets of the numbers that can name a stage (C1), one group per
 *   motion ticked, each box labelled by its number and its one-liner, as on
 *   the start's « Cibles »;
 * - the shared counts (`settingsSharedCounts`), each labelled as the
 *   catalogue labels it in its first number — its months filled as that
 *   number's screen fills them (`{period}`) — the numbers that use it said
 *   under it, mid-sentence (`midSentence`, as the number's screen says them).
 */
export function settingsNumbers(state: EngineState, metrics: ResolvedMetric[], strings: EngineStrings, locale: "en" | "fr", today: Date): SettingsNumbers {
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const { motions } = state.setup;
  const hybrid = motions.plg && motions.slg;
  // The numbers the engine shows (§21.6.2): a SaaS's by its motions, an app's by what it earns from.
  const shown = shapesOf(state.setup).map((shape) => shape.id);
  return {
    targets: (["plg", "slg"] as const)
      .filter((m) => motions[m])
      .map((motion) => ({
        motion,
        title: hybrid ? strings.hybrid.motionName[motion] : null,
        boxes: candidatesFor(state.setup, motion).map((id) => {
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
