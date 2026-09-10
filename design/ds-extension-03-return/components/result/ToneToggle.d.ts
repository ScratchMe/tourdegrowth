import * as React from "react";

/**
 * Straight up ↔ Roast me. Two states, tone only.
 * @startingPoint section="Result" subtitle="md · compact" viewport="420x140"
 */
export interface ToneToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: "straight" | "roast";
  onChange?: (tone: "straight" | "roast") => void;
  /** md = the post-quiz selector scale (44px). compact = header/card scale (32px visual, 44px hit). */
  size?: "md" | "compact";
  /** Defaults "Straight up" / "Roast me 🔥". The 🔥 stays on the label — it is the roast's only mark. */
  labels?: { straight: React.ReactNode; roast: React.ReactNode };
}

export declare function ToneToggle(props: ToneToggleProps): JSX.Element;
