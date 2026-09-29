import { describe, expect, it } from "vitest";
import { stageProfile, type ProfileBox, type ProfileStage } from "../stage-profile";

/** The page's box: a 0–100 space in both directions, the road at the bottom edge. */
const BOX: ProfileBox = { width: 100, height: 100, top: 0, base: 100, floor: 4 };

const stages = (...scores: number[]): ProfileStage[] => scores.map((score) => ({ score, hot: false }));

/** Height above the road — what the reader actually compares. */
const heightOf = (peakY: number, box: ProfileBox = BOX) => Math.round((box.base - peakY) * 100) / 100;

describe("stageProfile", () => {
  it("draws one hill per stage, each in its own fifth of the width", () => {
    const p = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    expect(p.columns.map((c) => [c.x0, c.x1])).toEqual([
      [0, 20],
      [20, 40],
      [40, 60],
      [60, 80],
      [80, 100],
    ]);
    expect(p.columns.map((c) => c.peakX)).toEqual([10, 30, 50, 70, 90]);
  });

  it("makes each hill as high as the points the stage is missing, not as the points it has", () => {
    const p = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    expect(p.columns.map((c) => c.missing)).toEqual([8, 2, 12, 4, 6]);
    // floor + missing / total × (base − top − floor): 4 + m × 4.8
    expect(p.columns.map((c) => heightOf(c.peakY))).toEqual([42.4, 13.6, 61.6, 23.2, 32.8]);
    // The stage that stalls is the highest climb.
    const highest = p.columns.reduce((a, b) => (heightOf(b.peakY) > heightOf(a.peakY) ? b : a));
    expect(highest.missing).toBe(12);
  });

  it("keeps heights proportional to the missing points above the floor", () => {
    const p = stageProfile(stages(10, 15), 20, BOX);
    const [a, b] = p.columns.map((c) => heightOf(c.peakY) - BOX.floor!);
    expect(a! / b!).toBeCloseTo(10 / 5, 10);
  });

  it("draws a stage at full marks as flat road, and one at zero as the tallest climb the box allows", () => {
    const p = stageProfile(stages(20, 0), 20, BOX);
    expect(heightOf(p.columns[0]!.peakY)).toBe(BOX.floor);
    expect(p.columns[1]!.peakY).toBe(BOX.top);
  });

  it("clamps a score outside [0, total] so a bad input bends a hill, never the frame", () => {
    const p = stageProfile(stages(-6, 27), 20, BOX);
    expect(p.columns.map((c) => c.missing)).toEqual([20, 0]);
    expect(p.columns[0]!.peakY).toBe(BOX.top);
    expect(heightOf(p.columns[1]!.peakY)).toBe(BOX.floor);
  });

  it("passes the hot flag through, stage by stage", () => {
    const p = stageProfile(
      [
        { score: 12, hot: false },
        { score: 5, hot: true },
        { score: 5, hot: true },
        { score: 16, hot: false },
        { score: 20, hot: false },
      ],
      20,
      BOX,
    );
    expect(p.columns.map((c) => c.hot)).toEqual([false, true, true, false, false]);
  });

  it("starts and ends the ridge on the road, and closes the area down to the baseline", () => {
    const p = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    expect(p.ridge.startsWith(`M0 ${BOX.base - BOX.floor!} `)).toBe(true);
    expect(p.ridge.endsWith(` 100 ${BOX.base - BOX.floor!}`)).toBe(true);
    expect(p.area).toBe(`${p.ridge} L100 100 L0 100 Z`);
    // Each column's own area is its ridge closed to the road, for the red wash of a hot stage.
    for (const c of p.columns) expect(c.area).toBe(`${c.ridge} L${c.x1} 100 L${c.x0} 100 Z`);
  });

  it("joins the columns into one ridge — each column starts where the previous one ended", () => {
    const p = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    for (let i = 1; i < p.columns.length; i++) {
      const end = p.columns[i - 1]!.ridge.split(" ").slice(-2).join(" ");
      const start = p.columns[i]!.ridge.match(/^M(\S+ \S+)/)![1];
      expect(start).toBe(end);
    }
  });

  it("raises the valley between two climbs above the road, never above the lower of the two", () => {
    const p = stageProfile(stages(4, 4), 20, BOX);
    const valleyY = Number(p.columns[1]!.ridge.match(/^M\S+ (\S+)/)![1]);
    const valley = BOX.base - valleyY;
    expect(valley).toBeGreaterThan(BOX.floor!);
    expect(valley).toBeLessThan(heightOf(p.columns[0]!.peakY));
  });

  it("is deterministic: the same scores always draw the same path", () => {
    const a = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    const b = stageProfile(stages(12, 18, 8, 16, 14), 20, BOX);
    expect(a).toEqual(b);
    // Pinned, so a change to the drawing is a decision and not an accident:
    // the same geometry draws the page and the share image.
    expect(a.ridge).toMatchInlineSnapshot(`"M0 96 C5.6 96 6 57.6 10 57.6 C14 57.6 14.4 94.85 20 94.85 C25.6 94.85 26 86.4 30 86.4 C34 86.4 34.4 94.85 40 94.85 C45.6 94.85 46 38.4 50 38.4 C54 38.4 54.4 93.7 60 93.7 C65.6 93.7 66 76.8 70 76.8 C74 76.8 74.4 93.7 80 93.7 C85.6 93.7 86 67.2 90 67.2 C94 67.2 94.4 96 100 96"`);
  });

  it("scales to any box: the share image's pixels, with the plot starting below a margin", () => {
    const box: ProfileBox = { width: 600, height: 150, top: 40, base: 126, floor: 3 };
    const p = stageProfile(stages(20, 0, 10), 20, box);
    expect(p.columns.map((c) => c.peakX)).toEqual([100, 300, 500]);
    expect(heightOf(p.columns[0]!.peakY, box)).toBe(3);
    expect(p.columns[1]!.peakY).toBe(40);
    expect(heightOf(p.columns[2]!.peakY, box)).toBeCloseTo(3 + 0.5 * (126 - 40 - 3), 2);
  });

  it("draws flat road when there is nothing to draw", () => {
    const p = stageProfile([], 20, BOX);
    expect(p.columns).toEqual([]);
    expect(p.ridge).toBe("M0 100 L100 100");
  });
});
