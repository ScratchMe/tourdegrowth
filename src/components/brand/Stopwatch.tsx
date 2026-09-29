import styles from "./Stopwatch.module.css";

/** The face, in the 300 × 310 drawing: its centre and its radius. */
const CX = 150;
const CY = 172;
const R = 116;

/** Where the hand stands, in turns: 42 seconds in, a run under way. */
const SWEEP = 0.7;
const HAND = R - 32;

const round = (n: number) => Math.round(n * 10) / 10;
/** A point on the face, `turn` of the way round from the top, `r` from the centre. */
const at = (turn: number, r: number) =>
  `${round(CX + Math.sin(turn * 2 * Math.PI) * r)} ${round(CY - Math.cos(turn * 2 * Math.PI) * r)}`;

/** Sixty ticks, every fifth one longer: two paths, since the two widths differ. */
const ticks = (major: boolean) =>
  Array.from({ length: 60 }, (_, k) => k)
    .filter((k) => (k % 5 === 0) === major)
    .map((k) => `M${at(k / 60, major ? R - 34 : R - 25)}L${at(k / 60, R - 18)}`)
    .join("");

const MINOR = ticks(false);
const MAJOR = ticks(true);
/** The time run so far, a wedge from twelve o'clock to the hand. */
const WEDGE = `M${CX} ${CY}L${CX} ${CY - HAND}A${HAND} ${HAND} 0 1 1 ${at(SWEEP, HAND)}Z`;
const HAND_PATH = `M${CX} ${CY}L${at(SWEEP, HAND)}`;

export interface StopwatchProps {
  className?: string;
  "data-testid"?: string;
}

/**
 * The engine's stopwatch — design I + B, retained by Antoine on 2026-09-28.
 *
 * The engine is the race's time trial (« Contre-la-montre », `SpaceBand`),
 * and this is its emblem drawn large beside the page's intro: the same
 * stopwatch the band's pictogram reduces to 34 × 22, in ink with the
 * engine's ultramarine on its bezel, its buttons and the time already run.
 *
 * An illustration and nothing else: hidden from assistive technology, never
 * a control, no word on it. The page decides where it stands and when it
 * leaves (the engine's intro drops it under 1100px, where it would push the
 * title into a narrow column). Every colour is a token — the face is a card,
 * the lines are the hard border, the accent is `--space-engine-accent` — so
 * it reads on paper and nowhere else.
 */
export function Stopwatch({ className, "data-testid": testId }: StopwatchProps) {
  return (
    <svg
      className={[styles.svg, className ?? ""].filter(Boolean).join(" ")}
      viewBox="0 0 300 310"
      aria-hidden="true"
      focusable="false"
      data-testid={testId}
    >
      <circle className={styles.shadow} cx={CX + 7} cy={CY + 7} r={R} />
      <rect className={styles.button} x={CX - 17} y={18} width={34} height={18} rx={5} />
      <rect className={styles.stem} x={CX - 6} y={34} width={12} height={16} />
      <rect
        className={styles.button}
        x={CX - 8}
        y={CY - R - 18}
        width={16}
        height={14}
        rx={4}
        transform={`rotate(40 ${CX} ${CY})`}
      />
      <circle className={styles.face} cx={CX} cy={CY} r={R} />
      <circle className={styles.bezel} cx={CX} cy={CY} r={R - 8} />
      <path className={styles.wedge} d={WEDGE} />
      <path className={styles.minor} d={MINOR} />
      <path className={styles.major} d={MAJOR} />
      <path className={styles.hand} d={HAND_PATH} />
      <circle className={styles.hub} cx={CX} cy={CY} r={8} />
    </svg>
  );
}
