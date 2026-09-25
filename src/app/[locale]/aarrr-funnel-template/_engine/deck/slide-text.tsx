import { Fragment, type ReactNode } from "react";
import styles from "./deck.module.css";

/**
 * Placing the deck's strings — never formatting them. Templates are filled
 * with `fillTemplate` from lib/engine/format.ts, the engine's one filler, so
 * a placeholder left unfilled stays visible (`{n}`) the same way everywhere.
 */

/**
 * An arrow drawn, never typed. Engine spec §10.4, measured in Chromium on
 * the build: "→" and "←" are in none of the three families, so a typed arrow
 * falls back to a system font — a different face on screen, and in the PDF
 * an embedded `DejaVuSans` or `LiberationSans`, the exact defect found in
 * the angles' `slide.pdf`. The copy that reaches a slide is written without
 * arrows; any that slips through becomes this shape.
 */
export function Arrow({ direction = "right", className }: { direction?: "right" | "left" | "down"; className?: string }) {
  const rotate = direction === "left" ? 180 : direction === "down" ? 90 : 0;
  return (
    <svg
      className={[styles.arrow, className ?? ""].filter(Boolean).join(" ")}
      viewBox="0 0 24 12"
      aria-hidden="true"
      focusable="false"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M1 6h19M15 1.5 20.5 6 15 10.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function withArrows(text: string, keyBase: string): ReactNode[] {
  return text.split(/(→|←)/).map((part, i) => {
    if (part === "→") return <Arrow key={`${keyBase}-${i}`} />;
    if (part === "←") return <Arrow key={`${keyBase}-${i}`} direction="left" />;
    return <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>;
  });
}

/**
 * A finished sentence, with its `**…**` accent in red and any arrow drawn.
 * `**` is the copy's convention for the accent a slide title carries
 * (engine-copy.ts header); outside a title it is simply removed, so a stray
 * pair never prints as asterisks.
 */
export function SlideText({ text, accent = true }: { text: string; accent?: boolean }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 && accent ? (
          <span key={i} className={styles.accent}>
            {withArrows(part, `a${i}`)}
          </span>
        ) : (
          <Fragment key={i}>{withArrows(part, `p${i}`)}</Fragment>
        ),
      )}
    </>
  );
}
