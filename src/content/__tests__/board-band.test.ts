import { describe, expect, it } from "vitest";
import { boardBand } from "../copy-library";
import { PILLARS } from "@/lib/scoring/pillars";

/**
 * REVIEW-03 follow-up — the axis `SUMMARY_HEADLINES` was missing.
 *
 * The trap this exists to prevent: banding on the NAMED pillar's own score
 * fixes nothing, because [0,0,0,0,0] and [0,20,20,20,20] both have their
 * weakest in the weak band. It is the OTHERS that decide whether "solid
 * engine overall" is a true sentence.
 */
const board = (scores: number[]) => PILLARS.map((pillar, i) => ({ pillar, score: scores[i]! }));

describe("boardBand", () => {
  it("is solid only when every other stage is strong", () => {
    expect(boardBand(board([0, 20, 20, 16, 20]), "acquisition")).toBe("solid");
    // One other merely developing is enough to lose the claim.
    expect(boardBand(board([0, 20, 20, 13, 20]), "acquisition")).toBe("mixed");
  });

  it("is floor when nothing else reaches the strong band", () => {
    expect(boardBand(board([0, 5, 5, 5, 5]), "acquisition")).toBe("floor");
    expect(boardBand(board([0, 0, 0, 0, 0]), "acquisition")).toBe("floor");
    expect(boardBand(board([0, 13, 13, 13, 13]), "acquisition")).toBe("floor");
  });

  it("does not read the named pillar's own score", () => {
    // Same others, wildly different named score — the band must not move.
    expect(boardBand(board([0, 20, 20, 20, 20]), "acquisition")).toBe("solid");
    expect(boardBand(board([13, 20, 20, 20, 20]), "acquisition")).toBe("solid");
  });

  /* The exact pair from the analysis: identical under a named-pillar band,
     opposite under this one. This is the whole reason the axis is shaped
     this way, so it gets its own test rather than living in a comment. */
  it("separates the two boards a named-pillar band would have merged", () => {
    expect(boardBand(board([0, 0, 0, 0, 0]), "acquisition")).toBe("floor");
    expect(boardBand(board([0, 20, 20, 20, 20]), "acquisition")).toBe("solid");
  });

  it("reads whichever pillar it is given, not a fixed one", () => {
    // Revenue is the only strong stage; naming it leaves four weak others.
    expect(boardBand(board([5, 5, 5, 5, 20]), "revenue")).toBe("floor");
    // Naming a weak one leaves revenue strong among the others.
    expect(boardBand(board([5, 5, 5, 5, 20]), "acquisition")).toBe("mixed");
  });
});
