import { Card } from "@/components/core/Card";
import { linkSentence, totalBlocks, totalSums } from "@/lib/engine/deck-motions";
import type { SlideTitle } from "@/lib/engine/types";
import { Verdict } from "./Verdict";
import type { EngineView } from "./view";
import styles from "./Board.module.css";

/**
 * « Deux moteurs, un total » — the hybrid board's band (engine spec §18.7 E2,
 * §18.6.2-§18.6.3). The verdict in stencil is the `total` slide's title
 * (`deck-motions.ts#totalTitle`), then two text blocks, self-serve then
 * sales-assisted — the MRR and the new MRR of the month — with the link
 * between them, its arrow drawn (an SVG, never a glyph) and its sentence
 * saying what it is not: an attribution. Then the sums.
 *
 * Text only, on purpose (§18.6.4, rule 3): no bar, no gauge, nothing that
 * puts the two motions on one axis. A sum is a sum; the two blocks are never
 * ranked, and their order never follows their values.
 */
export function TotalBand({ view, verdict }: { view: EngineView; verdict: SlideTitle }) {
  const { strings, state, ctx, derived } = view;
  const total = derived.total;
  if (!total) return null;
  const blocks = totalBlocks(total, state, strings, ctx);
  const link = linkSentence(total, state, strings, ctx);
  const sums = totalSums(total, state, strings, ctx);
  const t = strings.total;

  const block = (b: (typeof blocks)[number]) => (
    <div key={b.motion} className={styles.totalBlock} data-testid={`engine-total-${b.motion}`}>
      <h3 className={styles.totalMotion}>{strings.hybrid.motionName[b.motion]}</h3>
      <dl className={styles.totalFigures}>
        <div>
          <dt>{t.mrr}</dt>
          <dd data-testid={`engine-total-mrr-${b.motion}`}>{b.mrr || strings.slide.noNumber}</dd>
        </div>
        <div>
          <dt>{t.newMrr}</dt>
          <dd>{b.newMrr || strings.slide.noNumber}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <Card elevation="raised" className={styles.totalBand} data-testid="engine-total-band">
      <p className={styles.totalEyebrow}>{t.title}</p>
      <Verdict title={verdict} strings={strings} />
      <div className={styles.totalBlocks}>
        {block(blocks[0]!)}
        <div className={styles.totalLink} data-testid="engine-total-link">
          <svg className={styles.totalArrow} viewBox="0 0 28 12" aria-hidden="true" focusable="false">
            <path d="M0 6 H25 M19 1 L26 6 L19 11" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {link ? (
            <>
              <p className={styles.totalLinkText}>{link}</p>
              <p className={styles.totalLinkNote}>{t.linkNote}</p>
            </>
          ) : null}
        </div>
        {block(blocks[1]!)}
      </div>
      {sums.length ? (
        <ul className={styles.totalSums} data-testid="engine-total-sums">
          {sums.map((sum) => (
            <li key={sum.key}>{sum.text}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
