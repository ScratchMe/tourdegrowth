import { Fragment, type ReactNode } from "react";
import styles from "./deck.module.css";

/**
 * Placing the deck's strings — never formatting them.
 *
 * `fill` only substitutes placeholders with values that arrive FINISHED
 * (lib/engine/format.ts made them). It does no number work, so it cannot
 * disagree with the formatter; an unknown placeholder is left visible
 * (`{n}`) rather than silently blanked, because a blank reads as a sentence
 * and a raw brace reads as a bug, which it is.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole,
  );
}

/**
 * An arrow drawn, never typed. Engine spec §10.4, measured in Chromium on
 * the build: "→" and "←" are in none of the three families, so a typed arrow
 * falls back to a system font — a different face on screen, and in the PDF
 * an embedded `DejaVuSans` or `LiberationSans`, the exact defect found in
 * the angles' `slide.pdf`. The copy may still write "→" (it reads well in a
 * template); this is where it becomes a shape.
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
 * A finished sentence, with its `**…**` accent in red and its arrows drawn.
 * `**` is the copy's convention for the one accent a slide title carries
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

/** The plain-text form of a title or line: accents dropped, arrows kept as characters (for aria labels and the Markdown). */
export function plainText(text: string): string {
  return text.replaceAll("**", "");
}
