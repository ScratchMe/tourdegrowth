import { Button, PriorityMove } from "tour-de-growth";

/*
 * Dashed red is advice; solid red is diagnosis. Exactly one of these per
 * result screen, at the top of the right column — the reader goes numeral →
 * bottleneck → action.
 *
 * The free action is what `resolveNextMove` returns — the first question of
 * the stalled stage that did not earn full marks, read from
 * `content/next-moves.ts` (the library Antoine reviewed on 2026-09-09) — so a
 * card never shows advice the product would not actually give. The upgrade
 * slot is `UI_STRINGS.deepDive.upgradeText` and `upgradeCta`, as
 * `ResultView` renders it.
 */

/**
 * The free result: one action, named for the stage it belongs to. Retention
 * 9/20 answered 0 · 20 · 7, so the first gap is the first retention question
 * at 0 points.
 */
export const Free = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Next move" pillar="Retention" score={9}>
      Take one month&apos;s cohort of new users and count how many are still active thirty days later.
    </PriorityMove>
  </div>
);

/**
 * Owner-only: the Deep dive offer sits under a dashed rule inside the same
 * card. A visitor arriving by a shared link never receives it — the id in a
 * shared link is not proof of ownership (R-01). Acquisition 11/20 answered
 * 7 · 20 · 7: the first gap is the first acquisition question at 7 points.
 */
export const WithUpgrade = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove
      label="Next move"
      pillar="Acquisition"
      score={11}
      upgrade={
        <>
          <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: "0 0 12px" }}>
            Make this specific to your business — 10 more questions, about a minute.
          </p>
          <Button variant="secondary">Make it specific to your business →</Button>
        </>
      }
    >
      Put one number on your main channel this month — signups it brought, and what it cost.
    </PriorityMove>
  </div>
);

/**
 * After the Deep dive the same card carries Gemini's longer, specific
 * recommendation and the eyebrow changes — the slot is filled, not added.
 * The sentence is an example written for this card: Gemini writes it per
 * business (one or two sentences, `lib/gemini/prompt.ts`), so the product
 * has no fixed string to quote here.
 */
export const AfterDeepDive = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Priority move" pillar="Retention" score={9}>
      Instrument the second week specifically: your practitioners are leaving between day 8 and day 14, and no re-engagement
      touch exists in that window. One cohort report and one email is the whole first iteration.
    </PriorityMove>
  </div>
);

/** Nothing is behind: no stage is named, and the action is `LEVEL_MOVE`, which says so. */
export const Level = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Next move">
      Nothing is stalling you — every stage is solid. The question now is which one you push, not which one you fix.
    </PriorityMove>
  </div>
);
