import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import styles from "./TotalBand.module.css";

export interface TotalBandProps {
  /** « Deux moteurs, un total ». */
  eyebrow: ReactNode;
  /** The hybrid's own title: the first slide's, from the engine's own function. */
  title: ReactNode;
  /** Self-serve, then sales-assisted: always this order, whatever the values. */
  engines: readonly { id: string; label: ReactNode; value: ReactNode; "data-testid"?: string }[];
  /** « MRR total ». */
  total: { label: ReactNode; value: ReactNode; "data-testid"?: string };
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
 * The link is its last line. Text only, and a definition list: a screen
 * reader hears each label with its figure.
 */
export function TotalBand({ eyebrow, title, engines, total, link, headingId = "engine-total-title", "data-testid": testId }: TotalBandProps) {
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
            <dd className={styles.value}>{engine.value}</dd>
          </div>
        ))}
        <div className={`${styles.term} ${styles.total}`} data-testid={total["data-testid"]}>
          <dt className={styles.label}>{total.label}</dt>
          <dd className={styles.value}>{total.value}</dd>
        </div>
      </dl>
      {link ? <div className={styles.link}>{link}</div> : null}
    </section>
  );
}
