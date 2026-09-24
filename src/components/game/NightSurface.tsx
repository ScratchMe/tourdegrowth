import type { HTMLAttributes } from "react";
import styles from "./NightSurface.module.css";

export interface NightSurfaceProps extends HTMLAttributes<HTMLElement> {
  /** `section` (default) for a band of the page with its own heading; `div` otherwise. */
  as?: "section" | "div";
}

/**
 * The night world (DS v3 §5.3): everything inside reads the same semantic
 * tokens as on paper, rebound by world-night.css — a Card, a Tag, a Button
 * need no night variant. That is the whole contract: the attribute, plus
 * painting the world's own ground and text color, because both are
 * INHERITED from the paper body otherwise (a custom property rebinds, a
 * computed `color` does not follow it). No layout, no padding, no width:
 * those belong to the page that places the band.
 *
 * Paper can come back inside it: `<div data-world="paper">` rebinds the
 * paper world (and its page ground) for a press clipping or December — that
 * container paints its own ground the same way this one does.
 */
export function NightSurface({ as: Tag = "section", className, children, ...rest }: NightSurfaceProps) {
  return (
    <Tag data-world="night" className={[styles.surface, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tag>
  );
}
