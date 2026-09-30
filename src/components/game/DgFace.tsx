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
   * `call` = the whole call, 16:9, with the office behind him. `avatar` =
   * the head alone, cropped by the viewBox, for the CEO's line in the quarter
   * report and the journal (40px). What is in the picture, not how big it
   * is: so `framing`, not `size` (the variant names, S-16).
   */
  framing?: "call" | "avatar";
  /** The mouth moves while the caption types or the voice speaks. */
  speaking?: boolean;
  className?: string;
}

/**
 * The CEO, drawn (redrawn 2026-09-28, Antoine: « son visuel est un peu
 * raté »). A man in his fifties on a video call at night: neck, open collar,
 * a jacket with lapels, glasses, grey at the temples, the laptop's light on
 * his left cheek and shadow on the right, his office blurred behind him. The
 * expression still rides on the §5.10 strokes alone — the brows, the mouth,
 * the eyes' squint — and the drawing is fitted to them, so the table and P10
 * did not move. Angry, his cheeks colour instead of the whole face turning
 * salmon.
 *
 * Decorative for assistive technology (`aria-hidden`): what he says is always
 * in the caption text, and his mood is never the only carrier of information
 * — the report says the target was missed in words.
 *
 * Every colour comes from a class reading a --dg-* token (game.css): no hex
 * in JSX (game-no-hex.test.ts), and a mood is a `data-mood` switch in CSS,
 * not a second drawing.
 *
 * ONE `call` per page: the ids (the P10 strokes, and the frame's blur and
 * vignette) are unique only once. The `avatar` carries classes only and no
 * `<defs>`, so any number can sit beside the one frame.
 */
export function DgFace({ mood, framing = "call", speaking = false, className }: DgFaceProps) {
  const face = FACE_PATHS[mood];
  const frame = framing === "call";
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
      {frame && (
        <defs>
          <filter id="dgBlur" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <radialGradient id="dgVignette" cx="50%" cy="45%" r="75%">
            <stop offset="60%" className={styles.vignetteClear} />
            <stop offset="100%" className={styles.vignetteDark} />
          </radialGradient>
        </defs>
      )}
      <rect className={styles.wall} width="320" height="180" />
      {frame && (
        // The office, out of focus as a webcam would have it: a window on the city at night, a shelf, a plant.
        <g filter="url(#dgBlur)">
          <rect className={styles.wallLow} y="118" width="320" height="62" />
          <rect className={styles.window} x="14" y="14" width="96" height="92" rx="3" />
          <g className={styles.city}>
            <circle cx="30" cy="80" r="2" />
            <circle cx="44" cy="72" r="1.6" />
            <circle cx="58" cy="86" r="2.2" />
            <circle cx="76" cy="70" r="1.4" />
            <circle cx="92" cy="82" r="2" />
            <circle cx="38" cy="92" r="1.3" />
            <circle cx="84" cy="94" r="1.6" />
            <circle cx="66" cy="60" r="1.2" />
          </g>
          <rect className={styles.wallLow} x="14" y="58" width="96" height="2" />
          <rect className={styles.wallLow} x="61" y="14" width="2" height="92" />
          <rect className={styles.shelfBack} x="228" y="16" width="78" height="100" rx="2" />
          <rect className={styles.bookLight} x="236" y="24" width="10" height="36" />
          <rect className={styles.bookAmber} x="248" y="28" width="8" height="32" />
          <rect className={styles.bookLight} x="258" y="22" width="12" height="38" />
          <rect className={styles.bookAmber} x="284" y="30" width="14" height="30" />
          <rect className={styles.bookLight} x="236" y="70" width="40" height="36" />
          <path className={styles.plant} d="M288 106 q-6 -30 6 -34 q10 8 0 34z" />
        </g>
      )}
      {/* Jacket, lapels, open collar */}
      <path className={styles.suit} d="M62 180 C70 138 108 118 142 110 L160 132 L178 110 C212 118 250 138 258 180 Z" />
      <path className={styles.suitShade} d="M160 132 L178 110 C212 118 250 138 258 180 L196 180 Z" />
      <path className={styles.suitLight} d="M142 110 L160 132 L150 160 L128 118 Z" />
      <path className={styles.suitShade} d="M178 110 L160 132 L170 160 L192 118 Z" />
      <path className={styles.shirt} d="M146 104 L160 132 L174 104 Z" />
      <path className={styles.shirt} d="M146 104 L160 124 L151 131 L140 112 Z" />
      <path className={styles.shirtShade} d="M174 104 L160 124 L169 131 L180 112 Z" />
      {/* Neck, ears, head: light from his left (the screen), shadow on his right */}
      <path className={styles.skinShade} d="M148 86 L172 86 L174 108 L160 122 L146 108 Z" />
      <ellipse className={styles.skinShade} cx="131" cy="66" rx="4.5" ry="8.5" />
      <ellipse className={styles.skinShade} cx="189" cy="66" rx="4.5" ry="8.5" />
      <path className={styles.skin} d="M132 58 C132 36 146 27 160 27 C174 27 188 36 188 58 C188 78 181 93 160 98 C139 93 132 78 132 58 Z" />
      <path className={styles.skinTurn} d="M176 32 C186 40 188 50 188 58 C188 78 181 93 160 98 C172 91 180 78 180 62 C180 48 178 38 176 32 Z" />
      <path className={styles.skinLight} d="M138 44 C142 36 150 32 156 32 C148 38 142 46 140 56 Z" />
      <g className={styles.flush}>
        <ellipse cx="143" cy="77" rx="7" ry="4" />
        <ellipse cx="177" cy="77" rx="7" ry="4" />
      </g>
      <path className={styles.crease} d="M154 45 q6 -2 12 0" />
      {/* Hair: short, grey at the temples */}
      <path className={styles.hair} d="M131 60 C128 36 144 22 162 22 C180 22 193 34 189 58 C186 44 178 36 165 35 C154 34 146 38 139 45 C135 49 133 54 131 60 Z" />
      <path className={styles.hairGrey} d="M131 60 C130 52 132 47 135 44 L137 58 Z" />
      <path className={styles.hairGrey} d="M189 58 C190 51 188 46 185 43 L183 57 Z" />
      <path className={styles.nose} d="M160 66 L157 76 Q160 78 163 76" />
      <g className={styles.eyes}>
        <ellipse className={styles.eye} cx="148" cy="64" rx="2.6" ry="2.6" />
        <ellipse className={styles.eye} cx="172" cy="64" rx="2.6" ry="2.6" />
      </g>
      {/* Glasses, one notch under the brows so the angry ones can meet the rims */}
      <rect className={styles.lens} x="138.5" y="58.5" width="18" height="11.5" rx="3.5" />
      <rect className={styles.lens} x="163.5" y="58.5" width="18" height="11.5" rx="3.5" />
      <path className={styles.bridge} d="M156.5 62 Q160 60 163.5 62" />
      <path className={styles.glint} d="M141 61 l4 0" />
      <path id={frame ? "browL" : undefined} className={styles.brow} d={face.browL} />
      <path id={frame ? "browR" : undefined} className={styles.brow} d={face.browR} />
      <rect className={styles.mouth} x="153" y="83" width="14" height="2.5" rx="1.2" />
      <path id={frame ? "mouthShape" : undefined} className={styles.mouthLine} d={face.mouth} />
      {frame && <rect width="320" height="180" fill="url(#dgVignette)" />}
    </svg>
  );
}
