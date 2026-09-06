import * as React from "react";
import type { DisclosureProps } from "../core/Disclosure";

export interface BreakdownAnswer {
  question: string;
  /** The option the owner picked, verbatim. */
  answer: string;
  /** 20 · 7 · 0 */
  points: number;
}

export interface BreakdownPillar {
  id: string;
  /** Pillar name as shown, e.g. "Acquisition". */
  name: string;
  /** Sum of the three answers, out of 60. */
  raw: number;
  /** Pillar score out of 20. */
  score: number;
  answers: BreakdownAnswer[];
}

export interface BreakdownStrings {
  summary?: string;
  intro?: string;
  note?: string;
  pts?: (n: number) => string;
  maths?: (raw: number, score: number) => string;
}

/**
 * Owner-only breakdown of the score: per pillar, the maths line and the three answers behind a nested disclosure.
 * @startingPoint section="Result" subtitle="Closed · open with one pillar expanded" viewport="720x600"
 */
export interface ScoreBreakdownProps extends Omit<DisclosureProps, "summary" | "children"> {
  pillars: BreakdownPillar[];
  /** Localised strings; defaults are the EN copy from UI_STRINGS.result.breakdown. */
  strings?: BreakdownStrings;
}

export declare function ScoreBreakdown(props: ScoreBreakdownProps): JSX.Element;
