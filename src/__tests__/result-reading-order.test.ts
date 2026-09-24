import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * What the mobile reading order costs, computed for every variant of the
 * result page — including the ones an e2e cannot reach.
 *
 * On a phone the two columns step out of the box tree (`display: contents`)
 * and `order` places their children, so the visual sequence is not the
 * source sequence. `order` moves boxes, not the document: a screen reader
 * and the Tab key follow the source. `e2e/result-composition.spec.ts`
 * measures that in a real browser — but only on `/r/sample`, which carries
 * no `id` and no `breakdown` prop and is therefore structurally always the
 * visitor variant. The owner's own result renders `slotBreakdown`, and a
 * completed Deep dive renders `slotCredit`; neither can be rendered without
 * Firestore, which CI does not have. The game card (`slotGame`) is there or
 * not depending on the bottleneck and on the game's flag.
 *
 * So this reads the two orders out of the real files — source order from the
 * JSX, visual order from the stylesheet — and computes the displacement for
 * all eight combinations. It is the only place the bound is checked for the
 * variants the owner actually sees.
 */
const SRC = join(process.cwd(), "src");
const VIEW = readFileSync(join(SRC, "app/(app)/r/[id]/ResultView.tsx"), "utf8");
const CSS = readFileSync(join(SRC, "app/(app)/r/[id]/ResultView.module.css"), "utf8");

/** Source order: first appearance of each slot class in the JSX. `slotCta` appears twice (owner and visitor rows) — same position either way. */
const SOURCE_ORDER = [...new Set([...VIEW.matchAll(/styles\.(slot[A-Za-z]+)/g)].map((m) => m[1]!))];

/** Visual order: the `order` value each slot carries on mobile (the unindented, one-line rules). */
const VISUAL_ORDER = Object.fromEntries(
  [...CSS.matchAll(/^\.(slot[A-Za-z]+) \{ order: (\d+); \}/gm)].map((m) => [m[1]!, Number(m[2])]),
);

/** The desktop block — where `.slotGame` takes a different value (see the stylesheet). */
const DESKTOP_CSS = CSS.slice(CSS.indexOf("@media (min-width: 761px)"));
const DESKTOP_OVERRIDES = Object.fromEntries(
  [...DESKTOP_CSS.matchAll(/\.(slot[A-Za-z]+)\s*\{\s*order:\s*(\d+);\s*\}/g)].map((m) => [m[1]!, Number(m[2])]),
);
const DESKTOP_ORDER: Record<string, number> = { ...VISUAL_ORDER, ...DESKTOP_OVERRIDES };

/** Which desktop column each slot sits in, read from where it first appears in the JSX. */
function column(slot: string): "left" | "right" | "outside" {
  const at = VIEW.indexOf(`styles.${slot}`);
  const left = VIEW.indexOf("className={styles.left}");
  const right = VIEW.indexOf("className={styles.right}");
  const share = VIEW.indexOf("<ShareCard");
  if (at > left && at < right) return "left";
  if (at > right && at < share) return "right";
  return "outside";
}

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
    expect(SOURCE_ORDER.length, "no slot classes found in ResultView.tsx").toBe(11);
    expect(Object.keys(VISUAL_ORDER).length, "no order values found in the stylesheet").toBe(11);
    expect(SOURCE_ORDER.every((s) => s in VISUAL_ORDER)).toBe(true);
  });

  /**
   * Exact numbers, not a ceiling: the point is to KNOW the cost, and any
   * change to it — better or worse — should be a deliberate edit here.
   *
   * The owner's variants are one worse than the visitor's because
   * `slotBreakdown` is the last thing in the right column's source order, so
   * it comes between the disclaimer and the share block, which is announced
   * one more place after it is shown. Moving the breakdown out of the column
   * alongside the share block does bring those down — it was built and
   * measured — but it puts the breakdown in its own grid row on desktop,
   * below the taller of the two columns, which opens ~230px of empty right
   * column under the disclaimer. A visible hole on every owner's desktop is a
   * worse trade than one block announced early on a phone.
   *
   * The game card adds one more, on every variant that shows it. Its two
   * places are a decision (orchestrator decision 1, 2026-09-24): on desktop in
   * the right column before the CTA row, on a phone right after the share
   * card. The first fixes where it sits in the SOURCE — the right column,
   * before the CTA — and the second puts it on screen after the share block,
   * which is itself last in the source; so on a phone the card is announced
   * before the CTA row and seen after the share card, and the share card moves
   * one place further from where it is read. Measured, not guessed: the worst
   * slot is `slotShare` in all four "with the card" variants.
   *
   * A visitor without the card — every shared link whose bottleneck has no
   * level yet — stays at 1.
   */
  const VARIANTS = [
    { name: "visitor", without: ["slotCredit", "slotBreakdown", "slotGame"], displacement: 1 },
    { name: "visitor with a Deep dive", without: ["slotBreakdown", "slotGame"], displacement: 1 },
    { name: "owner", without: ["slotCredit", "slotGame"], displacement: 2 },
    { name: "owner with a Deep dive", without: ["slotGame"], displacement: 2 },
    { name: "visitor with the game card", without: ["slotCredit", "slotBreakdown"], displacement: 2 },
    { name: "visitor with a Deep dive and the game card", without: ["slotBreakdown"], displacement: 2 },
    { name: "owner with the game card", without: ["slotCredit"], displacement: 3 },
    { name: "owner with a Deep dive and the game card", without: [], displacement: 3 },
  ];

  it.each(VARIANTS)("$name: worst displacement is $displacement", ({ without, displacement }) => {
    const { worst } = worstDisplacement(SOURCE_ORDER.filter((s) => !without.includes(s)));
    expect(worst).toBe(displacement);
  });

  it("the game card costs exactly one place, never more, on every variant", () => {
    // Said as a relation rather than only as numbers: if the card's slot
    // moved in the source or in the stylesheet, the absolute numbers above
    // would change and could be re-pinned without anyone noticing the card
    // had become the expensive thing on the page.
    for (const v of VARIANTS.filter((x) => x.without.includes("slotGame"))) {
      const withCard = worstDisplacement(SOURCE_ORDER.filter((s) => !v.without.includes(s) || s === "slotGame"));
      const without = worstDisplacement(SOURCE_ORDER.filter((s) => !v.without.includes(s)));
      expect(withCard.worst - without.worst, v.name).toBe(1);
    }
  });
});

describe("the desktop reading order", () => {
  it("finds the columns and the game card's override — otherwise the check below is vacuous", () => {
    expect(column("slotScore")).toBe("left");
    expect(column("slotGame")).toBe("right");
    expect(column("slotShare")).toBe("outside");
    expect(DESKTOP_OVERRIDES).toHaveProperty("slotGame");
  });

  /**
   * On desktop the columns are boxes again and `order` applies inside each.
   * The rule is that no column reorders its own content: each one reads in
   * source order. Equal `order` values keep source order (CSS Flexbox §5.4),
   * which is how `.slotGame` shares the credit's value and still lands
   * between it and the CTA row.
   */
  it.each(["left", "right"] as const)("the %s column reads in its source order", (col) => {
    const source = SOURCE_ORDER.filter((s) => column(s) === col);
    expect(source.length, `no slots found in the ${col} column`).toBeGreaterThan(1);
    const visual = [...source].sort((a, b) => DESKTOP_ORDER[a]! - DESKTOP_ORDER[b]! || source.indexOf(a) - source.indexOf(b));
    expect(visual).toEqual(source);
  });

  it("puts the game card between the evidence and the CTA row, never above the Deep dive offer", () => {
    const right = SOURCE_ORDER.filter((s) => column(s) === "right");
    expect(right.indexOf("slotGame")).toBeGreaterThan(right.indexOf("slotWeaknesses"));
    expect(right.indexOf("slotGame")).toBeLessThan(right.indexOf("slotCta"));
    // The Deep dive offer lives inside the action card at the top of this column.
    expect(right.indexOf("slotGame")).toBeGreaterThan(right.indexOf("slotMove"));
  });
});
