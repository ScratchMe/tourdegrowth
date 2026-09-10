import { InsightCard } from "tour-de-growth";

/*
 * One pillar, its score, and one sentence about it. The result screen shows
 * two of these as strengths and two as losses; the sentences come from the
 * copy library in Quick mode and from Gemini after a Deep dive.
 *
 * Which pillars appear is decided by RANK, never by trying to match a
 * sentence to a pillar name — the two lowest go under "Where you're losing
 * time", the two highest under "Strengths".
 */

const grid = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 } as const;

/** `strength` — plain paper. */
export const Strengths = () => (
  <div style={grid}>
    <InsightCard pillar="Revenue" score={20} kind="strength">
      Pricing has been tested against real willingness to pay, which is further than most get.
    </InsightCard>
    <InsightCard pillar="Acquisition" score={18} kind="strength">
      You know where your customers come from and what they cost — that is the hard half.
    </InsightCard>
  </div>
);

/** `weakness` — red wash, solid red edge. A diagnosis, not an error. */
export const Weaknesses = () => (
  <div style={grid}>
    <InsightCard pillar="Retention" score={8} kind="weakness">
      Users arrive and leave without anyone noticing — nothing downstream can compensate for that.
    </InsightCard>
    <InsightCard pillar="Activation" score={12} kind="weakness">
      There is an onboarding, but no measured moment where a new user first gets the point.
    </InsightCard>
  </div>
);

/**
 * When every pillar is in the strong band the two lowest are still strong, so
 * their sentences read as praise — which is why they keep the `strength`
 * treatment under a different heading ("Where there's still room") rather
 * than being painted red.
 */
export const LevelBoard = () => (
  <div style={grid}>
    <InsightCard pillar="Activation" score={16} kind="strength">
      Solid, and the closest thing you have to a next lever.
    </InsightCard>
    <InsightCard pillar="Referral" score={16} kind="strength">
      Working, without being something you have deliberately built yet.
    </InsightCard>
  </div>
);

/** `total` prints the denominator. */
export const WithTotal = () => (
  <div style={grid}>
    <InsightCard pillar="Retention" score={8} total={20} kind="weakness">
      Users arrive and leave without anyone noticing.
    </InsightCard>
  </div>
);
