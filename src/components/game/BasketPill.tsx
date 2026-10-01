import type { BasketPillCopy } from "@/lib/game/copy";
import styles from "./ClickPill.module.css";

export interface BasketPillProps {
  /** lib/game/shop-phone.ts `basketFor(ids).extra`, already formatted with its currency (`formatEur`): « 29 € », « €48 ». */
  amount: string;
  /** Whether the basket adds anything at all — `basketFor(ids).extra > 0`, decided by the view. */
  extra: boolean;
  /** `basketFor(ids).fees`: mandatory fees outside the displayed price — the one case that reads as a legal problem. */
  fees: boolean;
  labels: BasketPillCopy;
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
 * « +29 € au panier » under Pédalix's phone (GAME-BRIEF §17.7) — level 2's
 * « N clics pour résilier »: what the basket adds to the price the product
 * page showed. A measurable fact the law frames, never a judgement. With a
 * service fee outside the displayed price, the pill says so in words (« des
 * frais obligatoires hors du prix affiché ») and turns to the alert colour,
 * which only repeats them. Drawn with `ClickPill`'s own styles: the two
 * pills are one object in two levels.
 */
export function BasketPill({ amount, extra, fees, labels, size = "md", announce = true, className }: BasketPillProps) {
  return (
    <p
      className={[styles.pill, styles[size], fees ? styles.over : "", className ?? ""].filter(Boolean).join(" ")}
      data-testid="game-basket"
      data-fees={fees ? "true" : "false"}
      aria-live={announce ? "polite" : undefined}
    >
      {extra ? <Figure template={labels.extra} value={amount} /> : labels.none}
      {fees ? <span className={styles.suffix}> · {labels.feesSuffix}</span> : null}
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
