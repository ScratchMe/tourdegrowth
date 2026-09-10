import { Button, PriorityMove } from "tour-de-growth";

/*
 * Dashed red is advice; solid red is diagnosis. Exactly one of these per
 * result screen, at the top of the right column — the reader goes numeral →
 * bottleneck → action.
 *
 * Action sentences are verbatim from `content/next-moves.ts` (the library
 * Antoine reviewed on 2026-09-09), so a card never shows advice the product
 * would not actually give.
 */

/** The free result: one action, named for the stage it belongs to. */
export const Free = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Next move" pillar="Retention" score={8}>
      Take one month&apos;s cohort of new users and count how many are still active thirty days later.
    </PriorityMove>
  </div>
);

/**
 * Owner-only: the Deep dive offer sits under a dashed rule inside the same
 * card. A visitor arriving by a shared link never receives it — the id in a
 * shared link is not proof of ownership (R-01).
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
            Make it specific to your business.
          </p>
          <Button variant="secondary">Answer 10 more questions →</Button>
        </>
      }
    >
      Pick the one channel you can already name, and measure what a customer from it costs you.
    </PriorityMove>
  </div>
);

/**
 * After the Deep dive the same card carries Gemini's longer, specific
 * recommendation and the eyebrow changes — the slot is filled, not added.
 */
export const AfterDeepDive = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Priority move" pillar="Retention" score={8}>
      Instrument the second week specifically: your practitioners are leaving between day 8 and day 14, and no re-engagement
      touch exists in that window. One cohort report and one email is the whole first iteration.
    </PriorityMove>
  </div>
);

/** Nothing is behind: no stage is named, and the action says so. */
export const Level = () => (
  <div style={{ maxWidth: 520 }}>
    <PriorityMove label="Next move">
      Nothing is stalling you — every stage is solid. The question now is which one you push, not which one you fix.
    </PriorityMove>
  </div>
);
