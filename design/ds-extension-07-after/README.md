# Brief 07 — the growth engine, simpler · after the port

*Tour de Growth · the codebase · 2026-10-03 · `CHANTIERS.md` A18 T7*

The return of brief 07 ([`../ds-extension-07-return/`](../ds-extension-07-return/README.md)), ported
to the product (A18, T0 to T6), captured and measured with the script that took
the brief's screens (`scripts/engine-density.capture.ts`). Same data (the §6.0
example; "returning" is that example with four numbers back to "to do",
last touched twelve days earlier), the same clock (24 September 2026), and a
production build with the engine open.

The screens are numbered as in [`../ds-extension-07/`](../ds-extension-07/), where a screen
survived. The ones that are gone, and what took their place:

- **04** (the base: cohort and month) is gone (C40). Each number now asks
  for its own counts, and a shared count typed once is written everywhere.
- **07** (the step-by-step's what-if) is now **07, the requests**, all on
  one screen. **08** (the steps' "done") is now **08, the lever** on the
  board.
- **10** opens a number from its row in "Your numbers", on its own screen.
  Before, it opened under a stage tab.
- **11** ("To go and get", folded under the board) is now **11, the next
  step**, at the top of the board.

`CATALOGUE.md` is not repeated here. Extracted again from the ported page,
it is identical to [`../ds-extension-07/CATALOGUE.md`](../ds-extension-07/CATALOGUE.md),
character for character, in both languages: the 41 cards the page prints
for search engines did not change.

## Measured

CSS pixels, English unless marked, read the way the return read its own
proposal (`board/measure.cjs`):
- the tool is `#engine`;
- a control is a visible button, link, box, select or summary, and not
  inside a closed `<details>`.

| | Before (B10) | The return | The port |
|---|---|---|---|
| Where the tool starts, first visit, at 1280 / 390 | 1,267 / 1,849 | 735 / 956 | 811 / 955 (fr: 757 / 952) |
| The first card: height at 1280 / 390, and controls | the setup card: 1,431, and 36 controls | 618 / 781, and 7 | 618 / 781, and 7 (fr: 663 / 784) |
| Screens to the first number | 4 | 2 | 3 (the "Targets" screen is kept, C40) |
| Screens from "Start" to the requests | 21 for the whole step-by-step | — | 8: start, targets, five numbers, the requests |
| Where the tool starts, returning, at 1280 / 390 | 1,267 / 1,849 | 287 / 288 | 356 / 298 |
| Controls in the first screen, returning, at 1280 / 390 | — | 5 / 3 | 4 / 3 |
| Bottom of the one primary, returning, at 1280 / 390 | — | 768 / 788 | 832 / 821 |
| The board: height at 1280 / 390, and controls | 2,463 / 3,597, and 75 | 3,136 / 3,627, and 27 | 3,463 / 4,132, and 27 |
| A number untouched, at 1280 / 390, and controls | — | 1,113 / 1,422, and 15 | 1,169 / 1,488, and 15 |
| A number with "Where to find it" open, at 1280 / 390 | 1,667 at 1280 (a stage tab's sheet) | 1,689 / 2,206 | 1,807 / 2,361 |
| The same, every fold open, and controls | — | — | 2,256 / 2,830, and 28 |

Where the port differs from the return, and why:

- **The returning tool starts lower** (356, not 287, at 1280). The page's
  short version keeps the H1, the promise line and the duration above the
  tool, as T4 measured.
- **The board is about 330px taller at 1280.** It holds three things the
  board drew without:
  - the save reminder, inside the next step;
  - the two folds at its foot, "All the levers together" and "Enter as a table";
  - the Tour's card.
- **The first number is one screen further** because of the "Targets"
  screen, which Antoine kept (C40).

## Held by the suite

`e2e/engine-screens.spec.ts` walks these screens, both languages:
- **Screens**: the start card and its full setup, the targets, a number
  untouched and with every fold open, the requests, the board with its menu
  shut and open, the settings, and the hybrid board.
- **At 1280 and 390**: no serious or critical axe violation (contrast
  included), a 44px tap through every control, and nothing sideways.
- **At 320**: contrast and taps are held, and the width is measured. It
  measured 0 on every screen on 2026-10-03.

Its first run found the fields 42px tall to a finger in a 48px box (38 in
44). The fix is in `core/Field.module.css`, and it draws nothing
differently.
