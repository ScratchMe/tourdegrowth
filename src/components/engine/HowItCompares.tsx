import { useId, type ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Tag } from "@/components/core/Tag";
import { BulletChart } from "@/components/viz/BulletChart";
import styles from "./HowItCompares.module.css";

export interface HowItComparesProps {
  /** « Comment il se situe » / "How it compares". */
  title: ReactNode;
  /** The figure; null before it is typed, and for an estimate (no bar: the legend says the range). */
  value?: number | null;
  /** The chart's scale, from the caller. */
  domain: readonly [number, number];
  /** The published range, from the catalogue's reference: BulletChart's `band`, under the track. */
  band?: readonly [number, number];
  /** The team's target: the chart's red tick. Only on the numbers that can name a stage. */
  target?: number | null;
  /** The chart in words: value, reference and target. */
  chartLabel: string;
  /** One line under the chart, each mark drawn as the chart draws it: with no `value`, the « value » line has no swatch. */
  legend?: { kind: "value" | "band" | "target"; label: ReactNode }[];
  /** The reference's caveat, word for word, or « Pas de repère publiable : … ». */
  caveat?: ReactNode;
  /** Only against a TEAM TARGET (C1): below → the red of a diagnosis; at or above → neutral. Never from a reference. */
  verdict?: { tone: "below" | "ok"; label: ReactNode } | null;
  /** For a number that cannot name a stage: « Ce chiffre situe ; il ne désigne pas d'étape. » — or the position in words. */
  note?: ReactNode;
  /** The target box itself, on the numbers that can name a stage. */
  targetField?: ReactNode;
  headingId?: string;
  className?: string;
  "data-testid"?: string;
}

/**
 * Your figure, the published reference and your team's target, as one object
 * — design system extension 07 (brief 07 Q9 and Q12). One chart (the bar is
 * the figure, the red tick the target, the bracket under the track the
 * published range), one legend line, the caveat word for word, and the
 * target box where the value is in front of the person.
 *
 * The diagnosis rule (C1) lives here: the verdict tag exists only against a
 * team target. A reference never earns a tag, a colour or an edge; without a
 * target the figure still shows, the reference still situates, and no stage
 * is named. Nothing to draw (no figure, no range, no target): no chart, the
 * caveat and the target box remain.
 */
export function HowItCompares({
  title,
  value = null,
  domain,
  band,
  target = null,
  chartLabel,
  legend = [],
  caveat,
  verdict,
  note,
  targetField,
  headingId,
  className,
  "data-testid": testId,
}: HowItComparesProps) {
  const ownId = useId();
  const titleId = headingId ?? `${ownId}-title`;
  const drawable = value !== null || band !== undefined || target !== null;
  return (
    <section className={[styles.root, className ?? ""].filter(Boolean).join(" ")} aria-labelledby={titleId} data-testid={testId}>
      <div className={styles.head}>
        <MetaLabel as="h3" size="sm" tone="muted" id={titleId}>
          {title}
        </MetaLabel>
        {verdict ? (
          <Tag tone={verdict.tone === "below" ? "alert" : "neutral"} data-verdict={verdict.tone}>
            {verdict.label}
          </Tag>
        ) : null}
      </div>
      {drawable ? <BulletChart value={value} target={target} domain={domain} band={band} ariaLabel={chartLabel} size="md" /> : null}
      {legend.length ? (
        <ul className={styles.legend}>
          {legend.map((l) => (
            <li key={l.kind} className={[styles.key, styles[l.kind]].join(" ")}>
              {/* Each mark as the chart draws it: no bar (an estimate), no bar's swatch — the label says the range (A21.7). */}
              {l.kind === "value" && value === null ? null : <span className={styles.swatch} aria-hidden="true" />}
              {l.label}
            </li>
          ))}
        </ul>
      ) : null}
      {caveat ? <p className={styles.caveat}>{caveat}</p> : null}
      {note ? <p className={styles.note}>{note}</p> : null}
      {targetField ? <div className={styles.targetField}>{targetField}</div> : null}
    </section>
  );
}
