# Segmented — delta (design system extension 08)

**Why.** The language switch stays in the compact line on every page but
the quiz and the Deep dive, so its targets are part of must-stay 6 (44px,
not overlapping). Measured on today's `sm` switch: each option is 40px wide
(`min-width: 40px`), and its hit layer reaches over the 2px border on its
outer side only — **42–43 × 44px**. Two pixels short.

**Change, one line:**

```css
.Segmented_sm .Segmented_option {
  min-width: 42px;   /* was 40px: + the 2px border its hit layer covers = 44 */
}
```

The switch grows from 84 to 88px wide, in every window — a phone held
upright included, the one place brief 08 otherwise leaves untouched; its
height, type and look are unchanged. Every other `sm` Segmented in the
product gets the same 44px targets. `md` is untouched (its options are 44px tall and wider than 44).

The board applies it (`board/deltas.css`), so every state shown is measured
with it: 44 × 44px for EN and for FR.
