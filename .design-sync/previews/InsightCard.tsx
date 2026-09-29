import { InsightCard } from "tour-de-growth";

/*
 * One pillar, its score, and one sentence about it. The result screen shows
 * two of these as strengths and two as losses; the sentences come from the
 * copy library in Quick mode and from Gemini after a Deep dive.
 *
 * Which pillars appear is decided by RANK, never by trying to match a
 * sentence to a pillar name — the two lowest go under "Where you're losing
 * time", the two highest under "Strengths".
 *
 * Everything below is a Quick result as the product prints it: boards the
 * quiz can produce, the pillars `ResultView` picks for them, and each
 * sentence from `PILLAR_VERDICTS[pillar][band of its score].neutral`. The
 * score always prints over 20 — `total` defaults to 20 and no screen passes
 * anything else.
 */

const grid = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 } as const;

/** `strength` — plain paper. Board 20 · 13 · 9 · 16 · 16: its two highest, acquisition 20 and revenue 16 (first of the tie at 16 in reverse AARRR order, as `ResultView` ranks it). */
export const Strengths = () => (
  <div style={grid}>
    <InsightCard pillar="Acquisition" score={20} kind="strength">
      Channel identified, measured, and already benchmarked against alternatives — exactly the discipline expected at
      this stage.
    </InsightCard>
    <InsightCard pillar="Revenue" score={16} kind="strength">
      Pricing tested, LTV known, expansion playbook active — a Revenue stage that already holds up against much more
      established teams.
    </InsightCard>
  </div>
);

/** `weakness` — red wash, solid red edge. A diagnosis, not an error. Same board: its two lowest, lowest first — retention 9 (weak band), activation 13 (developing band). */
export const Weaknesses = () => (
  <div style={grid}>
    <InsightCard pillar="Retention" score={9} kind="weakness">
      No retention tracking and no identified churn cause — this is the most urgent thing to address before investing
      elsewhere.
    </InsightCard>
    <InsightCard pillar="Activation" score={13} kind="weakness">
      The key moment exists in broad strokes, but its completion rate isn&apos;t tracked yet — the next onboarding
      iteration should aim to measure it.
    </InsightCard>
  </div>
);

/**
 * When every pillar is in the strong band the two lowest are still strong, so
 * their sentences read as praise — which is why they keep the `strength`
 * treatment under a different heading ("Where there's still room") rather
 * than being painted red. Board 16 · 20 · 16 · 20 · 16: acquisition and
 * retention, the first two of the three 16s.
 */
export const LevelBoard = () => (
  <div style={grid}>
    <InsightCard pillar="Acquisition" score={16} kind="strength">
      Channel identified, measured, and already benchmarked against alternatives — exactly the discipline expected at
      this stage.
    </InsightCard>
    <InsightCard pillar="Retention" score={16} kind="strength">
      Retention tracked, churn cause known, re-engagement mechanism active — a solid pillar of your growth.
    </InsightCard>
  </div>
);
