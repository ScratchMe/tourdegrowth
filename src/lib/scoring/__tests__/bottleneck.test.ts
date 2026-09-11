import { describe, expect, it } from "vitest";
import { LEVEL_MOVE } from "@/content/next-moves";
import { QUESTIONS } from "@/content/copy-library";
import { CLEAR_GAP, primaryBottleneck, resolveBottleneck } from "../bottleneck";
import { resolveNextMove } from "../next-move";
import { computeScore, findWeakestPillar, type AnswerIndex, type Answers } from "../score";
import { PILLARS } from "../pillars";

/** The five pillars in canonical AARRR order, at the scores given. */
function scored(scores: readonly number[]) {
  return PILLARS.map((pillar, i) => ({ pillar, score: scores[i]! }));
}

/**
 * Every pillar score reachable from three answers worth 20, 7 or 0 — derived
 * rather than typed out, so it stays true if the copy library's point values
 * ever change.
 */
const ACHIEVABLE = (() => {
  const points = [0, 7, 20];
  const set = new Set<number>();
  for (const a of points)
    for (const b of points) for (const c of points) set.add(Math.round(((a + b + c) / 60) * 20));
  return [...set].sort((x, y) => x - y);
})();

describe("resolveBottleneck (design system extension 03, §1)", () => {
  it("names one stage when it sits at least four points below the next", () => {
    const view = resolveBottleneck(scored([16, 20, 5, 16, 13]));

    expect(view.sharpness).toBe("clear");
    expect(view.pillars.map((p) => p.pillar)).toEqual(["retention"]);
  });

  it("refuses to single one out when the bottom is crowded", () => {
    // 7 and 9 are two points apart: calling either "the" bottleneck would be
    // a claim the numbers do not support.
    const view = resolveBottleneck(scored([9, 20, 7, 16, 16]));

    expect(view.sharpness).toBe("shared");
    expect(view.pillars.map((p) => p.pillar)).toEqual(["retention", "acquisition"]);
  });

  it("puts the boundary exactly where the prompt does: four points, not three", () => {
    // "clear only when the lowest pillar is at least 4 points behind the
    // next" (Bottleneck.prompt.md). Pinned on both sides, because the sweep
    // below derives its expectation from CLEAR_GAP and so cannot catch a
    // wrong value for it.
    expect(resolveBottleneck(scored([9, 13, 5, 16, 20])).sharpness).toBe("clear"); // 5 → 9, gap 4
    expect(resolveBottleneck(scored([9, 13, 5, 16, 7])).sharpness).toBe("shared"); // 5 → 7, gap 2
    expect(CLEAR_GAP).toBe(4);
  });

  it("names every stage in the bottom group, not just the first two", () => {
    // The bundle's prop doc caps `shared` at two names. Three pillars tied at
    // the same score is common on a nine-value scale, and naming two of them
    // would credit canonical AARRR order for a distinction the scores do not
    // make. See the deviation note in bottleneck.ts.
    const view = resolveBottleneck(scored([7, 20, 7, 16, 7]));

    expect(view.sharpness).toBe("shared");
    expect(view.pillars.map((p) => p.pillar)).toEqual(["acquisition", "retention", "revenue"]);
  });

  it("names nothing when every stage is strong", () => {
    const view = resolveBottleneck(scored([16, 20, 16, 20, 16]));

    expect(view.sharpness).toBe("level");
    expect(view.pillars).toEqual([]);
    expect(primaryBottleneck(view)).toBeNull();
  });

  it("stands down on a strong-but-uneven board rather than naming a leader", () => {
    // 16 is four points below 20 — a `clear` gap by arithmetic. It is still
    // the strong band, so there is no bottleneck to name.
    const view = resolveBottleneck(scored([20, 20, 16, 20, 20]));

    expect(view.sharpness).toBe("level");
  });

  it("puts the lowest first, and breaks ties the way the rest of the app does", () => {
    const pillars = scored([7, 20, 7, 16, 16]);
    const view = resolveBottleneck(pillars);

    expect(view.pillars[0]!.pillar).toBe(findWeakestPillar(pillars.map((p) => ({ ...p, rawPoints: 0 }))));
    expect(primaryBottleneck(view)).toBe("acquisition");
  });

  it("does not throw on an empty board", () => {
    expect(resolveBottleneck([])).toEqual({ sharpness: "level", pillars: [] });
  });

  it("holds its invariants across every reachable board", () => {
    // 9^5 boards — the whole space, not a sample.
    let clear = 0;
    let shared = 0;
    let level = 0;

    const walk = (acc: number[]) => {
      if (acc.length === PILLARS.length) {
        const view = resolveBottleneck(scored(acc));
        const min = Math.min(...acc);
        const label = acc.join(",");

        if (view.sharpness === "level") {
          level++;
          expect(min, label).toBeGreaterThanOrEqual(16);
          expect(view.pillars, label).toEqual([]);
          return;
        }

        expect(min, label).toBeLessThan(16);
        expect(view.pillars[0]!.score, label).toBe(min);
        /* Ascending, and exactly the pillars inside the window that are not
           themselves strong. The strong exclusion is the narrower half: a
           board of 13,13,13,13,16 used to name the 16 as a bottleneck because
           it sat 3 points from the lowest, so the same card announced it as a
           stage holding you back AND read it out under "Strengths". */
        expect(view.pillars.map((p) => p.score), label).toEqual(
          [...acc].sort((x, y) => x - y).filter((s) => s - min < CLEAR_GAP && s < 16),
        );
        // Nothing named is ever in the band the same screen calls a strength.
        for (const named of view.pillars) expect(named.score, label).toBeLessThan(16);
        if (view.sharpness === "clear") {
          clear++;
          expect(view.pillars.length, label).toBe(1);
        } else {
          shared++;
          expect(view.pillars.length, label).toBeGreaterThan(1);
        }
        return;
      }
      for (const s of ACHIEVABLE) walk([...acc, s]);
    };
    walk([]);

    // Every state is actually reachable — an invariant sweep that only ever
    // exercised one branch would pass while proving nothing.
    expect(clear).toBeGreaterThan(0);
    expect(shared).toBeGreaterThan(0);
    expect(level).toBeGreaterThan(0);
    expect(clear + shared + level).toBe(ACHIEVABLE.length ** PILLARS.length);
  });
});

describe("the bottleneck block and the next move agree", () => {
  /** Every question at `points`, then whatever `overrides` says. */
  function answersWith(points: number, overrides: Record<string, number> = {}): Answers {
    const answers = {} as Answers;
    for (const q of QUESTIONS) {
      const want = overrides[q.id] ?? points;
      answers[q.id] = q.options.findIndex((o) => o.points === want) as AnswerIndex;
    }
    return answers;
  }

  it("stands down together, or names a stage together — never one without the other", () => {
    // The failure this pins: a page that says "nothing is stalling you" in
    // the action card while stamping a pillar name above it, or the reverse.
    const boards: Answers[] = [
      answersWith(20),
      answersWith(20, { "ret-3": 7 }),
      answersWith(20, { "ret-1": 0, "ret-2": 0, "ret-3": 0 }),
      answersWith(7),
      answersWith(0),
      answersWith(7, { "acq-1": 20, "acq-2": 20, "acq-3": 20 }),
    ];

    for (const answers of boards) {
      const { pillars, weakestPillar } = computeScore(answers);
      const view = resolveBottleneck(pillars);
      const move = resolveNextMove("en", pillars, weakestPillar, answers);

      expect(view.sharpness === "level", JSON.stringify(pillars.map((p) => p.score))).toBe(
        move === LEVEL_MOVE.en,
      );
    }
  });

  it("hands back the very objects it was given — it is a resolver, not a boundary", () => {
    // Written after this exact assumption cost a payload leak. The function
    // is generic so the OG image can pass its own lighter shape, which means
    // a caller passing the stored `PillarScore` gets `PillarScore` objects
    // back, `rawPoints` included. Narrowing has to happen at the caller
    // (`toPillarViews`), and this test exists so nobody reads the signature
    // and assumes otherwise.
    const stored = [
      { pillar: "acquisition", score: 16, rawPoints: 47 },
      { pillar: "activation", score: 5, rawPoints: 14 },
      { pillar: "retention", score: 20, rawPoints: 60 },
      { pillar: "referral", score: 20, rawPoints: 60 },
      { pillar: "revenue", score: 20, rawPoints: 60 },
    ] as const;

    const view = resolveBottleneck(stored);

    expect(view.sharpness).toBe("clear");
    expect(view.pillars[0]).toBe(stored[1]);
    expect(Object.keys(view.pillars[0]!)).toContain("rawPoints");
  });
});
