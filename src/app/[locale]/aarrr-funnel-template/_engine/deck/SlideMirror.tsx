import { fillTemplate } from "@/lib/engine/format";
import type { EngineStrings } from "@/lib/engine/strings";
import type { MirrorVerdict, TrackingLevel } from "@/lib/engine/types";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** Blind spots first: they are why this slide would be shown at all (§8.5, D13) — the board's order. */
const VERDICT_ORDER: readonly MirrorVerdict[] = ["blind-spot", "blind-spot-light", "known-gap", "better", "coherent"];

const VERDICT_KEY: Record<MirrorVerdict, keyof EngineStrings["mirror"]> = {
  "blind-spot": "blindSpot",
  "blind-spot-light": "blindSpotLight",
  "known-gap": "knownGap",
  better: "better",
  coherent: "coherent",
};

/** The found side in words — the board's mapping (Mirror.tsx): tracked = found, approximate = estimated, unknown = missing. */
const FOUND_STATUS: Record<TrackingLevel, keyof EngineStrings["status"]> = {
  tracked: "measured",
  approximate: "estimated",
  unknown: "missing",
};

const isVerdict = (v: string): v is MirrorVerdict => (VERDICT_ORDER as readonly string[]).includes(v);
const isLevel = (v: string): v is TrackingLevel => v in FOUND_STATUS;

/**
 * Slide 5 — "what we declare, what we measure" (§9.3). Opt-in: the deck
 * screen offers it unchecked, with the reason (D13) — the Tour is a
 * self-assessment, and this slide is only worth projecting when the gap IS
 * the argument.
 *
 * The counts come first, blind spots leading; then one row per bridge that
 * is not coherent, quoting the Tour's answer word for word next to what was
 * actually found. A coherent bridge is a count, not a row: the slide is about
 * the gaps. The Tour's score appears in the footer, and only on this slide
 * (§9.1).
 */
export function SlideMirror({ slide, context }: SlideProps) {
  const { strings, bridges, metrics, derivedCopy } = context;
  const bridgeRows = rowsOf(slide, "bridge");
  const tourFooter = rowOf(slide, "tourFooter")?.text;

  const nameOf = (id: string) => metrics.find((m) => m.id === id)?.name ?? derivedCopy.find((d) => d.id === id)?.name ?? id;

  const counts = VERDICT_ORDER.map((verdict) => ({
    verdict,
    n: bridgeRows.filter((row) => row.verdict === verdict).length,
  })).filter((c) => c.n > 0);

  const gaps = bridgeRows
    .filter((row) => isVerdict(row.verdict) && row.verdict !== "coherent" && isLevel(row.found))
    .sort((a, b) => VERDICT_ORDER.indexOf(a.verdict as MirrorVerdict) - VERDICT_ORDER.indexOf(b.verdict as MirrorVerdict));

  return (
    <SlideFrame slide={slide} context={context} footer={tourFooter}>
      <div className={styles.mirror}>
        <ul className={styles.mirrorCounts}>
          {counts.map(({ verdict, n }) => (
            <li key={verdict} className={styles.mirrorCount} data-verdict={verdict}>
              <span className={styles.mirrorCountValue}>{n}</span>
              <span className={styles.mirrorCountLabel}>{strings.mirror[VERDICT_KEY[verdict]]}</span>
            </li>
          ))}
        </ul>

        {gaps.length > 0 ? (
          <ul className={styles.mirrorRows}>
            {gaps.map((row) => {
              const verdict = row.verdict as MirrorVerdict;
              // The Tour's answer, quoted as the team gave it — never paraphrased —
              // through the copy's own template, which carries the quotation marks.
              const answer = bridges.find((b) => b.questionId === row.questionId)?.options.find((o) => String(o.points) === row.points)?.label ?? "";
              const found = strings.status[FOUND_STATUS[row.found as TrackingLevel]];
              return (
                <li key={row.questionId} className={styles.mirrorRow} data-verdict={verdict}>
                  <span className={styles.mirrorVerdict}>{strings.mirror[VERDICT_KEY[verdict]]}</span>
                  <span className={styles.mirrorMetric}>
                    <SlideText text={nameOf(row.metric)} accent={false} />
                  </span>
                  <span className={styles.mirrorAnswer}>
                    {fillTemplate(strings.mirror.card, { answer, points: row.points, found: found.charAt(0).toLowerCase() + found.slice(1) })}
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
