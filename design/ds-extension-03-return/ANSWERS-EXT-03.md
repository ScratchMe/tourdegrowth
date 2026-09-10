# Extension 03 — answers to the brief

Board: `Tour de Growth ext-03.dc.html`. Page arrangements: `guidelines/compositions-ext-03.md`.

## §1 Bottleneck — new component `result/Bottleneck`

It goes **inside the score card, under the numeral, and replaces the verdict line**. The verdict already named the bottleneck; the fix is to give it the position it deserves rather than to add a second element saying the same thing. Reading order: numeral → dashed rule → sharpness label (mono, red) → pillar name in the stencil face (36px desktop / 30px mobile, one step down from the numeral) with its score /20 → verdict sentence. Pillar chips stay where they are.

Sharpness states: `clear` names one pillar; `shared` stacks two at the same size (never one big, one small); `level` shows no name, label in muted ink, verdict only. No gauge, bar, badge or emoji.

Copy assumption: three labels, ≤ 32 characters uppercase, one line at 390px. Placeholders used: "One stage holding you back" / "Two stages holding you back" / "Nothing is stalling you".

## §2 Next action — `result/PriorityMove` changed

The free action **fills the former locked slot**, and the slot moves to the **top of the right column** (first element after the score card on mobile), so the reader goes numeral → bottleneck → action without scrolling past the strengths. Visitors see it; the empty locked card is retired.

Owner only: an `upgrade` slot under a dashed rule inside the same card — one sentence and a secondary button ("Make it specific to my business →", placeholder). After the Deep dive the same card shows `label="Priority move"` and the personalised sentence; the seam disappears.

Sized for 144 characters in French: three lines at 480px, five at 350px. No tone variant.

Level state: no pillar, no score, the fixed "Nothing is stalling you…" sentence in the same card.

## §3 Share card — new `result/ShareCard` + new `share/ShareImage`

`ShareCard` sits under the pillar chips (left column desktop; after the primary CTA on mobile): sunken paper frame, the real og:image, one secondary "Share this result" button and a "Save image" link. "Share this result" leaves the CTA row, which now holds the primary alone.

`ShareImage` is the Satori layout. **What gives: the five pillar rows.** The right column carries the next move in a dashed-red card, same grammar as `PriorityMove`. Numeral, header, dashed rule, bottom hook and URL do not move. The longest library entry (144 chars FR) fits in five lines at Inter 600 28px/1.3. Roast keeps the 6px red frame and the badge; the action has no roast variant.

## §4 Landing preview card — composition + `result/ToneToggle` changed

4a. The card mirrors the result: `ScoreDisplay` mobile → `Bottleneck` mobile → chips → `PriorityMove` (sample action, no upgrade).

4b. **Toggle on the card.** `ToneToggle size="compact"` (rebased on `Segmented`, 32px, mono), top-right of the card in the slot the "Stage 5/5" label vacated. It swaps the sample verdict and paints the pillar name `--paint-red`; the frame, shadow, chips and action do not change (a stamped card would promise a real roast result from a sample). Default `straight`. Shown on mobile too: it lives in the card, not the header. The 🔥 stays on the label, as on the post-Q15 selector. The primary CTA remains the only filled red element on the screen.

## §5 Problem statement — composition

Two lines in `--body-lg`, `--text-body`, max 34em, **above the preview card on both widths**: claim, then proof. H1 and CTA pair do not move.

## Open questions

1. Replaces the verdict line inside the score card.
2. Fills the locked slot; slot moves to the top of the right column; Deep dive offer under it, owner only.
3. Action in the right column; the five pillar rows go.
4. Toggle.
5. Verdict sentence + pillar name in red; nothing else.
6. Yes, on mobile too, inside the card.
7. On the label.
8. Above the card, both widths.

## Tokens

`--ratio-share: 1200 / 630`, `--pad-share-frame: 14px`. No new hex.

## Copy still to write

Three Bottleneck labels (both languages); the upgrade seam sentence and button; ShareCard caption and "Save image"; ShareImage hook lines for the level state.
