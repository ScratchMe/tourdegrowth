import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * What the mobile reading order costs, computed for every variant of the
 * result page — including the two an e2e cannot reach.
 *
 * On a phone the two columns step out of the box tree (`display: contents`)
 * and `order` places their children, so the visual sequence is not the
 * source sequence. `order` moves boxes, not the document: a screen reader
 * and the Tab key follow the source. `e2e/result-composition.spec.ts`
 * measures that in a real browser — but only on `/r/sample`, which carries
 * no `id` and no `breakdown` prop and is therefore structurally always the
 * visitor variant. The owner's own result renders `slotBreakdown`, and a
 * completed Deep dive renders `slotCredit`; neither can be rendered without
 * Firestore, which CI does not have.
 *
 * So this reads the two orders out of the real files — source order from the
 * JSX, visual order from the stylesheet — and computes the displacement for
 * all four combinations. It is the only place the bound is checked for the
 * variant the owner actually sees.
 */
const SRC = join(process.cwd(), "src");
const VIEW = readFileSync(join(SRC, "app/(app)/r/[id]/ResultView.tsx"), "utf8");
const CSS = readFileSync(join(SRC, "app/(app)/r/[id]/ResultView.module.css"), "utf8");

/** Source order: first appearance of each slot class in the JSX. `slotCta` appears twice (owner and visitor rows) — same position either way. */
const SOURCE_ORDER = [...new Set([...VIEW.matchAll(/styles\.(slot[A-Za-z]+)/g)].map((m) => m[1]!))];

/** Visual order: the `order` value each slot carries on mobile. */
const VISUAL_ORDER = Object.fromEntries(
  [...CSS.matchAll(/^\.(slot[A-Za-z]+) \{ order: (\d+); \}/gm)].map((m) => [m[1]!, Number(m[2])]),
);

function worstDisplacement(present: string[]): { worst: number; where: string } {
  const source = SOURCE_ORDER.filter((s) => present.includes(s));
  const visual = [...source].sort((a, b) => VISUAL_ORDER[a]! - VISUAL_ORDER[b]!);
  let worst = 0;
  let where = "";
  visual.forEach((slot, visualIndex) => {
    const delta = Math.abs(visualIndex - source.indexOf(slot));
    if (delta > worst) {
      worst = delta;
      where = slot;
    }
  });
  return { worst, where };
}

describe("the mobile reading order, for every variant", () => {
  it("reads both orders out of the real files", () => {
    // If either extraction silently returns nothing, every assertion below
    // passes while measuring an empty list.
    expect(SOURCE_ORDER.length, "no slot classes found in ResultView.tsx").toBe(10);
    expect(Object.keys(VISUAL_ORDER).length, "no order values found in the stylesheet").toBe(10);
    expect(SOURCE_ORDER.every((s) => s in VISUAL_ORDER)).toBe(true);
  });

  /**
   * Exact numbers, not a ceiling: the point is to KNOW the cost, and any
   * change to it — better or worse — should be a deliberate edit here.
   *
   * The owner's two variants are 2 rather than 1 because `slotBreakdown` is
   * the last thing in the right column's source order, so it comes between
   * the disclaimer and the share block, which is announced two places after
   * it is shown. Moving the breakdown out of the column alongside the share
   * block does bring every variant to 1 — it was built and measured — but it
   * puts the breakdown in its own grid row on desktop, below the taller of
   * the two columns, which opens ~230px of empty right column under the
   * disclaimer. A visible hole on every owner's desktop is a worse trade
   * than one block announced two places early on a phone, so the layout
   * stands and the number is recorded instead of rounded down.
   *
   * A visitor — every shared link, and therefore the case the growth loop
   * runs on — stays at 1.
   */
  const VARIANTS = [
    { name: "visitor", without: ["slotCredit", "slotBreakdown"], displacement: 1 },
    { name: "visitor with a Deep dive", without: ["slotBreakdown"], displacement: 1 },
    { name: "owner", without: ["slotCredit"], displacement: 2 },
    { name: "owner with a Deep dive", without: [], displacement: 2 },
  ];

  it.each(VARIANTS)("$name: worst displacement is $displacement", ({ without, displacement }) => {
    const { worst } = worstDisplacement(SOURCE_ORDER.filter((s) => !without.includes(s)));
    expect(worst).toBe(displacement);
  });

  it("the two variants a shared link produces are the ones that stay at one", () => {
    // Said separately because it is the claim that matters: a visitor is the
    // numerator of the whole sharing loop, and `/r/sample` — the only result
    // page an e2e can render — is structurally always a visitor.
    for (const v of VARIANTS.filter((x) => x.name.startsWith("visitor"))) {
      expect(v.displacement, v.name).toBe(1);
    }
  });
});
