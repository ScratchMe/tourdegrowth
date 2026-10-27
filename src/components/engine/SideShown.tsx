import type { ReactNode } from "react";
import { Field } from "@/components/core/Field";
import { Segmented } from "@/components/core/Segmented";
import styles from "./SideShown.module.css";

/** A marketplace's two sides: the buyers (demand) and the sellers (supply). Declared here, never imported from the model. */
export type Side = "demand" | "supply";

export interface SideShownProps {
  /** « Côté affiché » / "Side shown". Labels the Segmented. */
  label: ReactNode;
  /** Always demand, then supply — a fixed order, never by their figures. The options carry no figure and no colour. */
  sides: readonly [{ id: "demand"; label: string }, { id: "supply"; label: string }];
  /** The side shown. The board starts on "demand". */
  value: Side;
  onChange?: (side: Side) => void;
  /** The shown side's heading: « La demande : les acheteurs » / "Supply: the providers" (the vocabulary's words). */
  title: ReactNode;
  /** One line: the two sides are read apart (« Deux côtés, deux lectures… »). */
  note?: ReactNode;
  /** The heading's id is `<headingId>-title`, the label's `<headingId>-label`. */
  headingId?: string;
  className?: string;
  "data-testid"?: string;
}

const KEEP = () => {};

/**
 * The marketplace's side selector (« Côté affiché ») and the heading of the
 * side it shows — design system extension 10 (Q1, Q2). The hybrid's « Moteur
 * affiché », for the two sides of a marketplace (C70): one side at a time,
 * never both. Everything under it, down to the next rule, belongs to the side
 * it shows; everything above it (the engine bar, the total, the next step) is
 * shared.
 *
 * - a hard ink rule opens the side's part (`--market-side-rule`): the shared
 *   part ends here, where the board's other rules are dashed dividers;
 * - the label and the system's Segmented sit in a Field group (44px targets),
 *   then the side's heading, then one muted line;
 * - `sides` is demand then supply, whatever their figures: a fixed order is
 *   not a ranking, and the selector never reorders, never badges an option
 *   with a figure, a colour or a leak — a figure beside each option would put
 *   the two sides face to face;
 * - `title` names the side's people in the vocabulary's words (C65); the
 *   options stay « Demande » / « Offre » in both vocabularies.
 *
 * It writes no word of its own: every string comes through its props.
 */
export function SideShown({ label, sides, value, onChange, title, note, headingId = "side-shown", className, "data-testid": testId }: SideShownProps) {
  return (
    <section className={[styles.root, className ?? ""].filter(Boolean).join(" ")} aria-labelledby={`${headingId}-title`} data-testid={testId}>
      <Field group label={label} labelId={`${headingId}-label`}>
        {({ labelId }) => <Segmented<Side> labelledBy={labelId} value={value} options={sides} onChange={onChange ?? KEEP} />}
      </Field>
      <h2 id={`${headingId}-title`} className={styles.title}>
        {title}
      </h2>
      {note ? <p className={styles.note}>{note}</p> : null}
    </section>
  );
}
