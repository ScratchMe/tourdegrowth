import type { Mood } from "@/lib/game/types";
import styles from "./DgFace.module.css";

/**
 * The strokes that carry the CEO's mood (GAME-BRIEF §5.10). These exact
 * paths are part of the contract: P10 reads the `d` of `#browL`, `#browR`
 * and `#mouthShape` at each call and compares them to this table — so it is
 * a table, not something derived.
 */
export const FACE_PATHS: Readonly<Record<Mood, { browL: string; browR: string; mouth: string }>> = {
  calm: { browL: "M140 55 L154 52", browR: "M166 52 L180 55", mouth: "M151 84 Q160 86 169 84" },
  firm: { browL: "M140 54 L154 54", browR: "M166 54 L180 54", mouth: "M151 84 L169 84" },
  angry: { browL: "M139 49 L155 57", browR: "M165 57 L181 49", mouth: "M151 86 Q160 81 169 86" },
  cold: { browL: "M140 56 L154 56", browR: "M166 56 L180 56", mouth: "M151 85 Q160 83 169 85" },
};

export interface DgFaceProps {
  mood: Mood;
  /**
   * `frame` = the whole call, 16:9, with the office behind him. `avatar` =
   * the head alone, cropped by the viewBox, for the CEO's line in the quarter
   * report and the journal (40px).
   */
  size?: "frame" | "avatar";
  /** The mouth moves while the caption types or the voice speaks. */
  speaking?: boolean;
  className?: string;
}

/**
 * The CEO, drawn. Decorative for assistive technology (`aria-hidden`): what
 * he says is always in the caption text, and his mood is never the only
 * carrier of information — the report says the target was missed in words.
 *
 * Every colour comes from a class reading a --dg-* token (game.css): no hex
 * in JSX (game-no-hex.test.ts), and a mood is a `data-mood` switch in CSS,
 * not a second drawing.
 *
 * ONE `frame` per page: the ids are required by P10, and ids repeat
 * otherwise. The `avatar` carries classes only, so any number can sit beside
 * the one frame.
 */
export function DgFace({ mood, size = "frame", speaking = false, className }: DgFaceProps) {
  const face = FACE_PATHS[mood];
  const frame = size === "frame";
  return (
    <svg
      className={[styles.face, frame ? styles.frame : styles.avatar, className ?? ""].filter(Boolean).join(" ")}
      viewBox={frame ? "0 0 320 180" : "110 20 100 100"}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-mood={mood}
      data-speaking={speaking ? "true" : undefined}
    >
      <rect className={styles.wall} width="320" height="180" />
      {frame && (
        <g>
          <rect className={styles.shelfBack} x="222" y="18" width="80" height="96" rx="3" />
          <rect className={styles.bookLight} x="230" y="26" width="14" height="40" />
          <rect className={styles.bookAmber} x="248" y="26" width="10" height="40" />
          <rect className={styles.bookLight} x="262" y="26" width="16" height="40" />
          <rect className={styles.bookLight} x="230" y="72" width="30" height="34" />
          <rect className={styles.bookAmber} x="264" y="72" width="12" height="34" />
          <rect className={styles.desk} x="0" y="118" width="320" height="62" />
        </g>
      )}
      <path className={styles.suit} d="M72 180 Q160 96 248 180Z" />
      <path className={styles.shirt} d="M143 104 L160 126 L177 104 Z" />
      <path className={styles.tie} d="M156 110 L160 150 L164 110 Z" />
      <ellipse className={styles.skin} cx="160" cy="66" rx="30" ry="36" />
      <path className={styles.hair} d="M130 56 Q160 14 190 56 Q182 38 160 36 Q138 38 130 56Z" />
      <path className={styles.hairSide} d="M118 60 Q118 44 132 40 L132 78 Q120 74 118 60Z" />
      <path className={styles.hairSide} d="M202 60 Q202 44 188 40 L188 78 Q200 74 202 60Z" />
      <g className={styles.eyes}>
        <ellipse className={styles.eye} cx="148" cy="64" rx="3.2" ry="3.2" />
        <ellipse className={styles.eye} cx="172" cy="64" rx="3.2" ry="3.2" />
      </g>
      <path id={frame ? "browL" : undefined} className={styles.brow} d={face.browL} />
      <path id={frame ? "browR" : undefined} className={styles.brow} d={face.browR} />
      <path id={frame ? "mouthShape" : undefined} className={styles.mouthLine} d={face.mouth} />
      <rect className={styles.mouth} x="153" y="83" width="14" height="2.5" rx="1.2" />
    </svg>
  );
}
