import type { ChargePillCopy } from "@/lib/game/copy";
import styles from "./ClickPill.module.css";

export interface ChargePillProps {
  /** lib/game/fit-phone.ts `trialCharge(ids).amount`, already formatted with its currency (`formatEuros`): « 7,99 € », « €59.99 ». It fills the `{amount}` of `labels.amount`. */
  amount: string;
  /** `trialCharge(ids).silent` — a trial that charges with no reminder; decided by the view, not re-derived here. */
  silent: boolean;
  /** `trialCharge(ids).addon` — an option ticked in advance is part of the charge. */
  addon: boolean;
  labels: ChargePillCopy;
  /** `sm` for the sticky action bar on a phone: same words, smaller type. */
  size?: "md" | "sm";
  /**
   * Whether the pill speaks for itself (`aria-live="polite"`). On by default;
   * off inside the level's island, which says a change in its one region
   * (plan E5) — exactly as `ClickPill`.
   */
  announce?: boolean;
  className?: string;
}

/**
 * « Prélevé à la fin de l'essai : 59,99 € · sans rappel avant le prélèvement »
 * under Gainix's phone (GAME-BRIEF §20.7) — the revenue level's « N clics pour
 * résilier »: what the end of the trial will charge, and whether anything
 * announces it. A measurable fact, never a judgement: no French text requires
 * a reminder before a trial ends, so the coral says a problem, never a law.
 * With a charge that comes with no reminder, or with an option ticked in
 * advance, the pill says so in words (the suffixes) and turns to the alert
 * colour, which only repeats them. Drawn with `ClickPill`'s own styles: the
 * pills are one object in every level.
 */
export function ChargePill({ amount, silent, addon, labels, size = "md", announce = true, className }: ChargePillProps) {
  const alert = silent || addon;
  return (
    <p
      className={[styles.pill, styles[size], alert ? styles.over : "", className ?? ""].filter(Boolean).join(" ")}
      data-testid="game-charge"
      data-silent={silent ? "true" : "false"}
      data-addon={addon ? "true" : "false"}
      aria-live={announce ? "polite" : undefined}
    >
      <Figure template={labels.amount} value={amount} />
      {silent ? <span className={styles.suffix}> · {labels.silentSuffix}</span> : null}
      {addon ? <span className={styles.suffix}> · {labels.addonSuffix}</span> : null}
    </p>
  );
}

/** The amount stands out in the sentence; the sentence stays one string from the copy file. */
function Figure({ template, value }: { template: string; value: string }) {
  const slot = "{amount}";
  const at = template.indexOf(slot);
  if (at < 0) return <>{template}</>;
  return (
    <>
      {template.slice(0, at)}
      <b className={styles.figure}>{value}</b>
      {template.slice(at + slot.length)}
    </>
  );
}
