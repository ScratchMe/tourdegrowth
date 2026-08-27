import { describe, expect, it } from "vitest";
import { PILLARS } from "../pillars";
import { findWeakestPillar } from "../score";
import type { PillarScore } from "../score";
import { rankPillarsAscending } from "../rank";

function score(pillar: PillarScore["pillar"], value: number): PillarScore {
  return { pillar, rawPoints: value * 3, score: value };
}

describe("rankPillarsAscending", () => {
  it("sorts lowest score first", () => {
    const pillars = [score("acquisition", 18), score("activation", 12), score("retention", 8), score("referral", 16), score("revenue", 20)];
    const ranked = rankPillarsAscending(pillars);
    expect(ranked.map((p) => p.pillar)).toEqual(["retention", "activation", "referral", "acquisition", "revenue"]);
  });

  it("does not mutate the input array", () => {
    const pillars = [score("acquisition", 18), score("activation", 12)];
    const copy = [...pillars];
    rankPillarsAscending(pillars);
    expect(pillars).toEqual(copy);
  });

  it("agrees with findWeakestPillar on the single lowest pillar, including ties", () => {
    const tied = PILLARS.map((p) => score(p, 10));
    expect(rankPillarsAscending(tied)[0]?.pillar).toBe(findWeakestPillar(tied));

    const partialTie = [
      score("acquisition", 15),
      score("activation", 8),
      score("retention", 8),
      score("referral", 15),
      score("revenue", 20),
    ];
    expect(rankPillarsAscending(partialTie)[0]?.pillar).toBe(findWeakestPillar(partialTie));
  });
});
