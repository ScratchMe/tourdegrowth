"use client";

import { Segmented } from "@/components/core/Segmented";
import styles from "./ToneToggle.module.css";

export type ToneToggleValue = "straight" | "roast";

export interface ToneToggleProps {
  value?: ToneToggleValue;
  onChange?: (value: ToneToggleValue) => void;
  /** Labels, localized by the caller. Defaults are English DS copy. */
  straightLabel?: string;
  roastLabel?: string;
  /** Accessible group label, localized by the caller. */
  groupLabel?: string;
  /**
   * `compact` is the header scale — 32px visual, 44px hit — and the only one
   * anything asks for today: the landing preview card, where the toggle
   * demonstrates the roast without adding a CTA (extension 03, §4). `md` is
   * `Segmented`'s own 44px default, carried through so this wrapper doesn't
   * narrow the primitive; it has no call site.
   */
  size?: "md" | "compact";
  className?: string;
}

/**
 * Switches the result copy between the two written tones as a single
 * segmented control. The 🔥 in "Roast me" is the only emoji the brand uses.
 * Switching tone must never change the score or the pillar breakdown — same
 * numbers, different words.
 *
 * Rebased on `core/Segmented` by design system extension 01, which made that
 * grammar a primitive; this wrapper stays so call sites do not carry the
 * option list.
 *
 * ONE place today: the landing preview card, at `compact` (extension 03) —
 * a demo you can poke is a stronger promise that a roast exists than a line
 * of copy saying so, and `compact` keeps it visibly subordinate to "Start
 * your Tour →".
 *
 * This used to claim two, naming the post-question-15 tone selector as the
 * `md` call site. That screen is `quiz/ToneSelector`, two cards built from
 * `Button` — a different component that has never used this one. Written
 * down because the mistake is easy to repeat: the two things are named
 * almost identically and do the same job at different moments.
 *
 * Still not wired into ResultView's CTA row: the shipped result screen
 * deliberately shows exactly 2 CTAs (Share / Take the Tour again in neutral,
 * Share my roast / Switch to straight up in roast) with no symmetric "switch
 * to roast" button on the neutral screen — see CLAUDE.md's "Page de résultat
 * (étape 7)" note, reaffirmed by Antoine when R-23 was closed. A segmented
 * toggle that always shows both options at once would reopen that decision.
 */
export function ToneToggle({
  value = "straight",
  onChange,
  straightLabel = "Straight up",
  roastLabel = "Roast me 🔥",
  groupLabel = "Tone",
  size = "md",
  className,
}: ToneToggleProps) {
  return (
    <Segmented<ToneToggleValue>
      size={size}
      label={groupLabel}
      value={value}
      onChange={(id) => onChange?.(id)}
      options={[
        { id: "straight", label: straightLabel },
        { id: "roast", label: roastLabel },
      ]}
      accent={(id) => id === "roast"}
      className={[styles.toggle, className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
