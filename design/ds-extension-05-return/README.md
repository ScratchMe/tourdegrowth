# Extension 05 — the stage scores · return

*Tour de Growth · Claude Design → the codebase · 2026-10-02 · answers
DS-EXTENSION-BRIEF-05*

The chip becomes a **row of a score sheet**. Each stage is one line of a ruled
table: the score, a meter, the stage's name, and right after the name the
`?`. The five lines make one sheet, set right under the route profile as its
table. There is no box, no button radius and no edge all round. The only
control on a row is the `?`, now drawn as a control. The stage that stalls
takes a red wash and a solid red rule, which is the system's way of marking a
diagnosis.

## What is in the bundle

| Path | What |
|---|---|
| `tokens/scores.css` | The new tokens: row pitch, meter, the alert rule, the stamp, the trigger. Sizes on `:root`; colours derived per world |
| `components/result/StageScore/` | **StageScore**, one stage's row (replaces `PillarChip`): `.js` (React, no JSX), `.d.ts`, `.prompt.md` |
| `components/result/StageScores/` | **StageScores**, the sheet: the `<ol>` whose grid lines the five rows up. Its CSS holds the row's too (the row is a subgrid of the list) |
| `components/result/StampedPillar/` | The roast's stamp, redrawn as an inked stamp and made a row of the sheet: `.js`, `.css`, `.d.ts`, `.prompt.md`, `StampedPillar.delta.md` |
| `components/glossary/DefinitionTrigger/` | `DefinitionTrigger.delta.md` + reference CSS: the `?` turns solid, gets a hover, and opens to the inverse fill |
| `components/result/PillarChip/PillarChip.delta.md` | The retirement: every prop and where it goes |
| `board/index.html` | All eight boards side by side |
| `board/board.html?world=&lang=&w=` | One board: `paper`/`night`, `en`/`fr`, `390`/`1280` |
| `board/board.js`, `board/react-lite.js`, `board/board.css`, `board/system-snapshot.css` | The board's source. Nothing is built; see "The board" below |

**What does not change:** `Button`, `DefinitionPopover`, `GlossaryTerm`,
`StageProfile` and `StatTile` stay as they are.

**Why `.js` and not `.jsx`:** the board runs the components' own files with
no build step, and a browser cannot read JSX. The components are therefore
written as plain `React.createElement` calls (`const h = React.createElement`).
They port to `.tsx` as they are, or become JSX in the same move.

---

## The eight answers

### The value

**1. What makes it a value: a ruled row of a score sheet, which removes all
three causes.**

1. *The closed box with the button's radius.* Gone. A row has no box at all,
   so it borrows no radius; the only rounded shapes left are the meter's caps.
2. *The 2px solid edge all round.* Gone. The sheet is ruled the way
   `DataTable` is ruled: one solid rule on top, a dashed hairline between
   rows. Those are lines under content, not edges around a control.
3. *A button's size and proportions.* Gone. A row is a full-width line,
   48px tall (44px on a phone and on the landing), and holds a meter. It is
   not a short label in a box sized to it.

On the landing at 1280, the hero's secondary button now sits beside a sheet
of lines instead of a row of boxes of its height. The board's last section
shows it.

I rejected three alternatives:

- **The sunken fill** (`--surface-sunken`) is already the fill of `Tag`,
  which is a label. But it is also the fill of `Disclosure`, which is
  pressable, so it would trade one ambiguity for another.
- **`StatTile`** is a closed box with a solid edge and the panel radius, so
  it would bring causes 1 and 2 back.
- **A bare figure without a sheet** loses the five-way comparison the meter
  is there for.

**2. The red without the box: a wash across the row plus a solid 3px rule
down its start edge.** The row's figure, `/20`, name (at 600) and meter all
turn red, and the `?` takes `tone="alert"`. A wash and a solid red edge are
the system's two signs of a diagnosis, and the rule is the inked stamp width
(`--border-width-stamp`). Nothing is dashed, so it can never read as advice
(`PriorityMove`, on the same screen, is the dashed red). It is the first
thing the eye finds: the only filled band among five open lines. It also
agrees with the route profile above, which fills the same stage's climb with
the same wash and flags it.

The weak meter changes colour. It now uses `--viz-highlight-text` (the red
used for text) instead of `--viz-highlight` (the brand red). The brand red
measures 2.65:1 against its own track on the wash, the meter's real
neighbour. The text red measures 4.03 there and 5.28 against the wash.

**3. Density: one object, and shorter on a desktop.** The five are one sheet
(`StageScores`, an `<ol>`), not five objects. On the result:

- **Desktop:** 5 × 48px = 240px, against about 305px for the column of five
  chips.
- **Phone:** one column of 5 × 44px = 220px. It is a little taller than the
  two-up grid, but it is one sheet. There is no odd fifth cell (today
  Revenue sits alone on a third row), and the meters compare down a single
  column.
- **Meters:** every row's meter has exactly the same track. The sheet is
  the grid and each row a subgrid. Measured on the board: 223px on every
  row of a desktop sheet, 163px on a phone.

### The one thing to touch

**4. The `?` changes. Its place stays: right after the stage name.**

- **Rest:** solid, not dashed. In this system dashed means "not yet", and a
  dashed ring around a `?` reads as a loading spinner (look at it in
  `result-fr-mobile.png`). A solid 2px ring is the system's real edge, the
  sign of a control.
- **Hover:** ink (pointer only).
- **Open:** while its definition is open it takes **the inverse fill**: an
  ink disc with a paper `?`, amber at night. That is the system's one
  language for "this one".
- **Unchanged:** 16px drawn, 44px tapped. The rows are never closer than
  44px, so two discs touch and never overlap (measured: no overlap on any
  of the eight boards).

**This reaches the quiz**, where the trigger sits in question text. I think
it helps there for the same reason. See `DefinitionTrigger.delta.md`.

**5. The landing: its chips become values too, and the link moves to the
stage name.**

- **The link:** the name is underlined, in the row's ink, with a 44px strip
  of taps and no `?`. The link works without JavaScript (constraint 9), and
  the landing keeps passing visitors to the glossary pages (R2-13). On hover
  the underline thickens and the name goes to body ink; focus gets the ring.
- **Why not a `?` like the result's:** the popover needs the client, and the
  landing's job here is the link.
- **What a screen reader says:** `linkLabel` gives the link "Acquisition —
  definition" / « Acquisition — définition ». That name contains the visible
  one and says where the link goes. The row is read in full as part of the
  list: "18/20 Acquisition — definition, link". Tabbing alone gives the link
  without the score, which is right: the link goes to the definition, not to
  the score.
- **Not the whole row:** the row stays a value, so a whole-row link would
  bring back the problem this brief is about.

### Around it

**6. `StampedPillar` changes, and stays an exception.** A stamp is a verdict,
not a reading, so it keeps its exception: no meter, set in capitals, a degree
askew, across the full row. But today it is a **red-filled pill**, the
primary action's red (`--surface-accent`), on the one screen where the
primary action matters most. It becomes an inked rubber stamp: red ink on
the wash, a 3px solid red edge and 4px corners. That is the system's
diagnosis, drawn as a stamp. It also becomes a row of the sheet (an `<li>`)
in the weakest stage's place. See `StampedPillar.delta.md`.

**7. Naming: `StageScore` for the row and `StageScores` for the sheet.**
"Stage" is the system's word for the five (README: « étape » / "stage";
`StageProfile`, `StageProgress`), and "score" says it is a value. "Chip" goes.
I also propose renaming `StampedPillar` to `StageStamp` in the same family
move, so "pillar" leaves the result group. The props can stay.

**8. What the brief did not ask:**

1. **The stamp was the primary action's red** (answer 6).
2. **The weak meter failed against its own track**: 2.65:1 (answer 2).
3. **The sheet and the profile can disagree.** On a `shared` bottleneck,
   `StageProfile` flags every tied stage in red, while the rule "at most one
   chip is red" marks one. One screen then names two different things.
   `StageScore` takes `tone` per row, and I recommend that its red follow
   `Bottleneck`'s `sharpness`: one row on `clear`, the tied group on
   `shared`, none on `level`. That changes a rule the brief lists as "must
   stay", so it is written as a recommendation for Antoine. Until he
   decides, the prompt says to mark one row.
4. **The phone grid strands Revenue** alone on a third row. The single
   column fixes it.
5. **A link on the landing would turn red.** The global `a` colour is
   `--text-link` (the deep red). A plain `<a>` around a stage name puts red
   on five rows, where red belongs to one. `StageScore_link` inherits the
   row's ink instead.
6. **"08/20" or "8/20"?** PillarChip's own story writes "08/20", while
   production prints "8/20". `StageScore` prints the figure as given and
   sets it right in tabular figures, so 8/20 aligns under 18/20 without
   padding.

---

## The ten constraints, one by one

1. **Tokens only.** New values are in `tokens/scores.css`. The colours are
   derived from semantic tokens and redeclared on `[data-world]`. No hex
   appears and no primitive is read. Typography uses the existing shorthands
   (`font: var(--meta-md)`). The meter's length is a custom property set
   inline (`--score-share`); it is a value, not a colour.
2. **Contrast.** Every pair passes; see the table below. The only failing
   pair found, the weak meter on its track, is fixed.
3. **44px targets, none overlapping.** The `?` keeps its 44px disc and the
   landing's links take a 44px strip. The row pitch is ≥ 44px, so
   neighbours touch and never overlap. This is measured on the board: 44
   targets per frame, none under 44px, no overlap.
4. **Red means one of three things.** The stalling row is a wash plus a
   solid rule, which is a diagnosis. The stamp loses its action-red fill.
   Nothing on the sheet is dashed red. Links stay in the row's ink.
5. **One signature effect.** The sheet has no shadow and no dashed edge. The
   only dashes are the hairlines between rows (`DataTable`'s, under the
   content). The stamp has a solid edge and no shadow.
6. **One loud thing.** The sheet is flat lines on the page, quieter than the
   chips were. The score card stays the raised one on the result, and the
   hero card on the landing. The board puts a row beside the secondary and
   the primary button: the primary is clearly the loudest.
7. **No icons.** The marks are a rule, a wash and a bar. The glyphs are the
   `?` and `·` in the stamp.
8. **Bilingual from one component.** Every string comes from the caller. The
   stage names stay in English, and the French board uses the same layout.
9. **Readable without JavaScript.** The rows are server-rendered HTML and CSS.
   `md` shrinks below 760px by a media query (the phone line on the system's
   list). The landing's links are plain anchors. Only the `?` needs the
   client, as before.
10. **The text is the reading.** "18/20 Acquisition" is in the text, and the
    meter is `aria-hidden`. The stamp reads "Retention 8/20 dead last", with
    its dots hidden.

## The night

The sheet works in the night world without a single night-specific line. The
rules are `--night-line`, the meters are night text, and the stalling row is
the night's red wash with a `--night-bad` figure. The open `?` is the amber
disc, the night's selection. Two pairs are close to the line, and they pass:

- the red rule against the night card: 3.76, and against its own wash: 3.37;
- the top rule against a card: 3.70.

On the night boards, five bright meters read as the strongest marks on the
page. They are hidden from assistive technology and carry no new meaning, so
I left them. If a night result ever ships, `--score-meter-fill` is the one
token to soften.

## Contrast, measured composed on the real ground

The sheet sits on the page on the result (paper-1 / night-0) and in a card on
the landing (paper-0 / night-1). Translucent tokens are composed first.

| Pair | Paper: page / card | Night: page / card |
|---|---|---|
| Figure (`--text-body`) | 12.97 / 16.06 | 16.38 / 15.22 |
| `/20` and stage name (`--text-muted`) | 5.81 / 7.20 | 8.28 / 7.70 |
| Alert text on its wash (`--text-alert` on `--surface-alert`) | 5.28 | 5.56 |
| Alert rule (`--border-alert`) against the ground | 3.57 / 4.42 | 4.04 / 3.76 |
| Alert rule against its own wash | 3.47 | 3.37 |
| Top rule (`--border-hard`) | 12.97 / 16.06 | 3.99 / 3.70 |
| Meter fill (`--viz-ink`) against its track | 9.87 / 12.11 | 11.42 / 10.30 |
| Alert meter (`--viz-highlight-text`) against its track on the wash | 4.03 | 3.75 |
| *Was: the brand-red meter against its track on the wash* | *2.65* | — |
| Track (`--viz-grid`), decorative | 1.31 | — |
| `?` ring and glyph at rest, muted | 5.81 / 7.20 | 8.28 / 7.70 |
| `?` on the alert wash | 5.28 | 5.56 |
| `?` open: glyph on the disc | 16.06 | 10.13 |
| `?` open: disc against the ground | 12.97 | 10.13 |
| Stamp text on its wash | 5.28 | 5.56 |
| Landing link (`--text-muted`, underlined) on the card | 7.20 | 7.70 |

## The board

`board/` is all **source**: hand-written, multi-line, with no build and
nothing fetched from outside the project. The last return's built `board.js`
and its PNGs could not come back to the repo, so this one does not have
any.

- `board.html` loads the project's fonts (`../../../fonts/fonts.css`; without
  them it falls back to the system's font stacks), a text snapshot of the
  synced system's CSS, the new tokens and component CSS, and `board.js` as
  an ES module.
- The components `import React from "react"`. On the board, an import map
  points `"react"` at `react-lite.js`, a 70-line stand-in that renders
  `createElement`, `Fragment` and `useId` into the page. So the board runs the
  components' own files, unchanged. It is never ported.
- `index.html` shows the eight frames. Serve the folder over http (any
  static server, or the project's preview): ES modules and import maps do
  not load from `file://`.
- Hover and focus are forced by board-only classes in `board.css`, so they
  can be seen on a still frame. Each rule mirrors the component rule it
  stands for. The open `?` is real: click any `?` on the board.

**Checked on the eight frames (Chromium):**

- no horizontal scroll at 390, nor at 360;
- every target at least 44px, none overlapping;
- every row of a sheet with the same meter track;
- no script error.
