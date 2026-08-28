import type { HTMLAttributes } from "react";
import styles from "./ToneToggle.module.css";

export interface ToneToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: "straight" | "roast";
  onChange?: (value: "straight" | "roast") => void;
  /** Labels, localized by the caller. Defaults are English DS copy. */
  straightLabel?: string;
  roastLabel?: string;
  /** Accessible group label, localized by the caller. */
  groupLabel?: string;
}

/**
 * Switches the result copy between the two written tones as a single
 * segmented control. The 🔥 in "Roast me" is the only emoji the brand uses.
 * Switching tone must never change the score or the pillar breakdown — same
 * numbers, different words.
 *
 * Not currently wired into ResultView's CTA row: the shipped result screen
 * deliberately shows exactly 2 CTAs (Share / Take the Tour again in
 * neutral, Share my roast / Switch to straight up in roast) with no
 * symmetric "switch to roast" button on the neutral screen — see
 * CLAUDE.md's "Page de résultat (étape 7)" note. A segmented toggle that
 * always shows both options at once would reopen that decision, so this
 * component is ported for the design system's completeness / future reuse
 * rather than dropped into that CTA row.
 */
export function ToneToggle({
  value = "straight",
  onChange,
  straightLabel = "Straight up",
  roastLabel = "Roast me 🔥",
  groupLabel = "Tone",
  className,
  ...rest
}: ToneToggleProps) {
  const options: { id: "straight" | "roast"; label: string }[] = [
    { id: "straight", label: straightLabel },
    { id: "roast", label: roastLabel },
  ];

  return (
    <div role="group" aria-label={groupLabel} className={[styles.group, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {options.map((option) => {
        const on = value === option.id;
        const onClass = on ? (option.id === "roast" ? styles.onRoast : styles.onStraight) : "";
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange?.(option.id)}
            className={[styles.option, onClass].filter(Boolean).join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
