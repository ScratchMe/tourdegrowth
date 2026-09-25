import { STATUS_KEY } from "@/lib/engine/strings";
import type { DerivedId, MetricId, MirrorVerdict } from "@/lib/engine/types";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText, fill } from "./slide-text";
import styles from "./deck.module.css";

/** Blind spots first: they are why this slide would be shown at all (§8.5, D13). */
const VERDICT_ORDER: readonly MirrorVerdict[] = ["blind-spot", "blind-spot-light", "better", "known-gap", "coherent"];

const VERDICT_KEY = {
  "blind-spot": "blindSpot",
  "blind-spot-light": "blindSpotLight",
  better: "better",
  "known-gap": "knownGap",
  coherent: "coherent",
} as const satisfies Record<MirrorVerdict, string>;

/**
 * Slide 5 — "what we declare, what we measure" (§9.3). Opt-in: the deck
 * screen shows it unchecked, with the reason (D13) — the Tour is a
 * self-assessment, and this slide is only worth projecting when the gap IS
 * the argument.
 *
 * The counts come first, blind spots leading; then one row per bridge that
 * is not coherent, quoting the Tour's answer word for word next to what was
 * actually found. A coherent bridge is a count, not a row: the slide is about
 * the gaps.
 */
export function SlideMirror({ slide, context }: SlideProps) {
  const { strings, derived, bridges, metrics, derivedCopy, state } = context;
  const mirror = derived.mirror;
  const entries = state.snapshots[0]?.metrics ?? {};

  const nameOf = (id: MetricId | DerivedId) =>
    metrics.find((m) => m.id === id)?.name ?? derivedCopy.find((d) => d.id === id)?.name ?? id;

  const foundOf = (id: MetricId | DerivedId): string => {
    const entry = entries[id as MetricId];
    if (entry) return strings.status[STATUS_KEY[entry.status]];
    // A computed figure has no status of its own: it is found when it can be computed.
    const computed = id === "rev.ltv" ? derived.unit.ltv : id === "rev.cac-payback" ? derived.unit.payback : derived.unit.ltvCac;
    return strings.status[computed.kind === "known" ? "measured" : "missing"];
  };

  const rows = (mirror?.rows ?? [])
    .filter((row) => row.verdict !== null && row.verdict !== "coherent")
    .sort((a, b) => VERDICT_ORDER.indexOf(a.verdict!) - VERDICT_ORDER.indexOf(b.verdict!));

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.mirror}>
        <ul className={styles.mirrorCounts}>
          {VERDICT_ORDER.filter((v) => (mirror?.counts[v] ?? 0) > 0).map((verdict) => (
            <li key={verdict} className={styles.mirrorCount} data-verdict={verdict}>
              <span className={styles.mirrorCountValue}>{mirror!.counts[verdict]}</span>
              <span className={styles.mirrorCountLabel}>{strings.mirror[VERDICT_KEY[verdict]]}</span>
            </li>
          ))}
        </ul>

        {rows.length > 0 ? (
          <ul className={styles.mirrorRows}>
            {rows.map((row) => {
              const bridge = bridges.find((b) => b.questionId === row.questionId);
              // The Tour's answer, quoted as the team gave it — never paraphrased —
              // through the copy's own template, which carries the quotation marks
              // and their spacing for each language.
              const answer = bridge?.options.find((o) => o.points === row.declaredPoints)?.label ?? "";
              return (
                <li key={row.questionId} className={styles.mirrorRow} data-verdict={row.verdict}>
                  <span className={styles.mirrorVerdict}>{strings.mirror[VERDICT_KEY[row.verdict!]]}</span>
                  <span className={styles.mirrorMetric}><SlideText text={nameOf(row.metric)} accent={false} /></span>
                  <span className={styles.mirrorAnswer}>
                    {fill(strings.mirror.card, { answer, points: row.declaredPoints, found: foundOf(row.metric) })}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </SlideFrame>
  );
}
