import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import styles from "./TotalBand.module.css";

export interface TotalBandProps {
  /** « Deux moteurs, un total ». */
  eyebrow: ReactNode;
  /** The hybrid's own title: the first slide's, from the engine's own function. */
  title: ReactNode;
  /**
   * Self-serve, then sales-assisted: always this order, whatever the values. `missing`: the value is words
   * (« pas de chiffre »), not a figure — set in the text face, muted, never in the figures' face.
   */
  engines: readonly { id: string; label: ReactNode; value: ReactNode; missing?: boolean; "data-testid"?: string }[];
  /** « MRR total ». `missing` as for an engine. */
  total: { label: ReactNode; value: ReactNode; missing?: boolean; "data-testid"?: string };
  /**
   * Extension 09: what adds up across the two engines, and only that — the ARR, the MRR in twelve months at today's
   * pace, the cash tied up. The LTV, the payback and the loss never add: each engine's money block carries its own.
   */
  totals?: readonly { key: string; label: ReactNode; value: ReactNode }[];
  /** The link (the opportunities from self-serve), the band's last line. */
  link?: ReactNode;
  headingId?: string;
  "data-testid"?: string;
}

/**
 * The hybrid's sum, once, at the top of its board — design system extension
 * 07 (brief 07 Q18, A18 T5). Two engines, one total (C4):
 *
 * - **a sum, never a comparison**: no bar, no share, no « bigger »;
 * - **a fixed order**, self-serve then sales-assisted, whatever the values;
 * - **no « + » nor « = »** between the figures (those glyphs are a
 *   disclosure's): the total is set off by a solid rule, as in an account;
 *   on a phone the three stack and the rule goes above the total.
 *
 * Extension 09 (A20.d T3.b): one line under the sum, set off by a hairline,
 * of what else adds up; on a phone the two engines sit side by side over
 * their total and the totals go two by two, so the band grows by a row.
 *
 * The link is its last line. Text only, and a definition list: a screen
 * reader hears each label with its figure.
 */
const valueClass = (missing?: boolean) => (missing ? `${styles.value} ${styles.missing}` : styles.value);

export function TotalBand({ eyebrow, title, engines, total, totals, link, headingId = "engine-total-title", "data-testid": testId }: TotalBandProps) {
  return (
    <section className={styles.root} aria-labelledby={headingId} data-testid={testId}>
      <MetaLabel size="xs" tone="muted">
        {eyebrow}
      </MetaLabel>
      {/* The board's heading when the band tops it: a person's move sends the focus here (R-19), never the Tab order. */}
      <h2 id={headingId} className={styles.title} tabIndex={-1}>
        {title}
      </h2>
      <dl className={styles.sum}>
        {engines.map((engine) => (
          <div key={engine.id} className={styles.term} data-testid={engine["data-testid"]}>
            <dt className={styles.label}>{engine.label}</dt>
            <dd className={valueClass(engine.missing)}>{engine.value}</dd>
          </div>
        ))}
        <div className={`${styles.term} ${styles.total}`} data-testid={total["data-testid"]}>
          <dt className={styles.label}>{total.label}</dt>
          <dd className={valueClass(total.missing)}>{total.value}</dd>
        </div>
      </dl>
      {totals && totals.length > 0 ? (
        <dl className={styles.totals} data-testid={testId ? `${testId}-totals` : undefined}>
          {totals.map((t) => (
            <div key={t.key} className={styles.term} data-testid={testId ? `${testId}-totals-${t.key}` : undefined}>
              <dt className={styles.label}>{t.label}</dt>
              <dd className={styles.value}>{t.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {link ? <div className={styles.link}>{link}</div> : null}
    </section>
  );
}
