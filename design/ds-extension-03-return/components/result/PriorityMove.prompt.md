Use `PriorityMove` once per result, for everyone. Since ext-03 it carries the free, deterministic action from the 31-entry library; the Deep dive no longer unlocks the slot, it sharpens what is already in it.

```jsx
// visitor
<PriorityMove label="Next move" pillar="Retention" score={8}>
  Take one month's cohort of new users and count how many are still active thirty days later.
</PriorityMove>

// owner — same card, offer under the rule
<PriorityMove label="Next move" pillar="Retention" score={8}
  upgrade={<>
    <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: 0 }}>
      Make this specific to your business — 10 more questions, about a minute.
    </p>
    <Button variant="secondary">Make it specific to my business →</Button>
  </>}>
  Take one month's cohort of new users and count how many are still active thirty days later.
</PriorityMove>

// level — every pillar strong: no pillar, the one fixed sentence
<PriorityMove label="Next move">
  Nothing is stalling you — every stage is solid. The question now is which one you push, not which one you fix.
</PriorityMove>
```

**Position.** Directly after the score card: first element of the right column on desktop, right after the score card (before the pillar chips) on mobile. The reader goes numeral → bottleneck → action; strengths and weaknesses are the evidence below. Never after the CTAs.

**Sizing.** The action is one imperative sentence, 15–23 words, up to 144 characters in French — three lines in a 480px column, five at 350px. The card grows; nothing truncates.

**The rule inside the card is the upgrade seam.** It only appears for the owner and only with the `upgrade` slot. After the Deep dive, the same card shows `label="Priority move"`, the personalised sentence, and no `upgrade`. Do not add a second card, a locked state or a badge — the empty dashed "locked" card from before ext-03 is retired.

Dashed red stays advice, solid red stays diagnosis. No tone variants: an action that mocks you is not an action.
