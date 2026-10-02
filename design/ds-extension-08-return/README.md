# Brief 08 — the sticky header, compact once the page scrolls · return

*Tour de Growth · Claude Design → the codebase · 2026-10-02 · answers
DS-EXTENSION-BRIEF-08*

In a landscape window, as soon as the page scrolls, the header becomes
**one line of 48px over a 6px stripe of the space's colour: 54px instead of
118px** (50px instead of 74px on a page without a band). On a laptop that is
7.5% of the screen instead of 16.4%; on a phone held sideways, 13.8% instead
of 30.3%. A phone held upright keeps today's header, untouched.

- **Where you are** stays in three places: the wordmark, the race — now in
  the line, right after the wordmark, this leg filled in its space's colour
  with its pictogram and short name — and the stripe of that colour under
  the line.
- **The page keeps its own controls** in the line: the language switch, the
  landing's primary, the result's two tags, the quiz's progress. Only the
  landing's two quiet links leave (the footer carries them).
- **The glass stays as it is** (paper at 92%), so every contrast figure of
  today holds.
- **The header's box never changes height.** Only layers inside it move,
  by transform; the page never jumps and the state cannot feed back.
- **The motion is a state change** (370ms in all, existing tokens only):
  what leaves goes first and faster, the surfaces fold together, the race
  arrives last. Reduced motion: the same states, instantly.

`SiteHeader` and `SpaceBand` change (SpaceBand only to export its race).
One line changes in `core/Segmented` (its `sm` targets were 42px wide), and
two rules go in `globals.css`. No new colour, no new duration.

Three small things to confirm when porting:

- the compact race's clicks are tracked with the detail
  `space_band_compact` (the band's stay `space_band`), to see whether
  anyone uses it; if your tracking plan lists the details, add it, or pass
  `space_band` to keep one;
- the `Segmented` line makes every `sm` segmented control 4px wider (84 →
  88px for the language switch), on a phone held upright too — the only
  pixel that changes there;
- the `globals.css` focus rule changes today's behaviour too (for the
  better: a Tab into the header no longer scrolls the page up).

---

## What is in the bundle

| Path | What |
|---|---|
| `README.md` | This file: the bundle, the eight answers, what must stay, the seven mechanics, the heights, the contrast |
| `MOTION.md` | **The motion as a spec**: every element, property, from → to, duration and easing by token, delay, trigger, both directions; interruptions; reduced motion; no script |
| `tokens/header.css` | The new tokens: the header's measures in both states (`--header-line` 48px, `--header-edge-band` 6px, `--header-height-band-compact` 54px, `--header-height-plain-compact` 50px…). No colour, no duration |
| `components/brand/SiteHeader/` | `SiteHeader.js` (the component, server-safe), `SiteHeaderCompactor.js` (its one client piece), `compactHeader.js` (the behaviour, free of React), `SiteHeader.css`, `SiteHeader.d.ts`, **`SiteHeader.prompt.md`** (what compact keeps, what a page may add, what never to do) |
| `components/brand/SpaceBand/` | `SpaceBand.js` (the band unchanged; its race exported as `SpaceRace`, with a `compact` variant), `SpaceBand.css`, `.d.ts`, `.prompt.md` |
| `components/core/Segmented/Segmented.delta.md` | Delta: `sm` options `min-width: 42px` (was 40px), so the language switch's targets are 44 × 44 |
| `styles/globals.delta.md` | Delta: `--sticky-offset` follows the compact state; the scroll padding is off while focus is in the header |
| `board/index.html` | Every page × window × language, full and compact, plus the transition and the named states |
| `board/board.html?page=&lang=&w=&h=` | One page that **really scrolls**. `page` landing · result · quiz · deepdive · engine · game · reading; `lang` fr · en; `w`/`h` the window. Options: `at=scrolled` (and `y=`), `focus=1`, `hover=pill\|primary`, `motion=reduce`, `slow=10`, `play=1`, `enhance=off`, `closed=engine\|game`. When your window is not `w × h`, the page is drawn in a frame of exactly that size, with buttons to scroll it down, back up, or play both ways. **Runs from its own source**: no build, no PNG, nothing fetched from outside the project (serve the project over http: ES modules do not load from `file://`) |
| `board/board.js`, `pages.js`, `board.css` | The board's own source: the stand-in pages (enough text to scroll, a card, its hard shadow, a block of ink: the glass's grounds), each page's right-hand side as it is today, the engine's sticky figures |
| `board/globals-compact.css`, `board/deltas.css` | The two deltas above, as the board applies them |
| `board/sys/` | The synced system as the components import it (`"tour-de-growth"`, `"tour-de-growth/space"`): stand-ins with the bundle's class names. Board only |
| `board/system-snapshot.css` | The tokens and the CSS of the components used, copied from `_ds_bundle.css`. Board only |
| `board/react-lite.js` | The board's stand-in for React. Board only |
| `board/check.cjs` | The checking script (Playwright): 252 states (7 pages × 2 languages × 9 windows × top/scrolled) for the sticky offset, what is painted, 44px targets and overlaps, the races exposed, nothing hidden yet focusable, no horizontal scroll; then the keyboard, the sticky figures, reduced motion and no script |

The components are plain React without JSX, so the board runs the very
files you port. Port `SiteHeader.css` and `SpaceBand.css` to their CSS
Modules (the flat class names are the compiled ones, as in returns 04–07).

---

## The answers

### 1. Which windows compact?

**Every landscape window, phones included; portrait never** — your lean.
`@media (orientation: landscape)` gates every compact rule and the compact
`--sticky-offset`; the script sets the state everywhere and the CSS ignores
it in portrait. A height threshold under 900px would leave the 1920 × 1080
screen alone (10.9%, fine), but also the 1440 × 900 laptop (13.1%), and it
would have to be tuned again for every new screen; orientation says what
Antoine said, and a 1920 × 1080 screen gains 64px of reading too.

The edges, as drawn: a tablet held upright, or a desktop window made
narrower than tall, keeps today's header. One thing to keep an eye on: if
the site ever sets `interactive-widget=resizes-content`, a phone held
upright with its keyboard open can report landscape; then
`compactHeader.js` should also check `screen.orientation`. Today's default
(`resizes-visual`) does not do this.

### 2. What triggers it, and what brings the full header back?

**Position** — your lean. Compact as soon as `scrollY > 0`, full again at
`scrollY = 0`. Plus one more way back: **keyboard focus inside the header**
(mechanic 6). Not direction: a header that grows when the reader scrolls
back up moves while they read, and covers what they went back for.

"Once the header covers the page" is the first pixel scrolled (the moment
today's plain rule appears), so the threshold is 0; and because the
header's box never changes, it needs no hysteresis. It is set by the
script (an attribute, on the next frame), not by
`scroll-state(stuck: top)`: that query could fold the header's own layers
in Chromium, but nothing outside the header can read it — not
`--sticky-offset`, so the engine's figures would stay 64px low — and
Firefox and Safari lack it. One state for every browser, set by the script,
also keeps mechanic 2 literal: no script, today's header.

### 3. A state or a scrub?

**A state** — your lean, for your three reasons, and a fourth: the race
cannot be half in the band and half in the line. One boolean
(`data-compact`), one set of transitions each way (MOTION.md).

### 4. What the compact header keeps, page by page

One line, **48px**, then the 6px stripe: **54px**, under your 56. In it,
left to right:

| page | the compact line | leaves |
|---|---|---|
| landing | wordmark · race (linked) · language · **Démarre ton Tour →** | Glossaire, Comment ça marche |
| result | wordmark · race (linked) · language · Deep dive · 🔥 Roast Mode | — |
| quiz | wordmark (not a link) · race (not linked) · progress | — |
| Deep dive | wordmark (not a link) · race (not linked) · Deep dive | — |
| engine | wordmark · race (linked) · language | — |
| game hub and levels | wordmark · race (linked) · language | — |
| reading pages | wordmark · language, over the dashed rule | — |

**The race is the space.** Your lean put "pictogram and name in its
colour" and "the race as numbers" side by side; they are the same thing
once the current leg's pill carries them: `[▬ 1 · DIAGNOSTIC] (2) (3)` —
this leg filled with its space's colour, its pictogram and short name; the
others a number (their names still there for screen readers); a closed leg
greyed and dashed. The band's long name (« Le diagnostic ») and its place
(« 1/3 · Plaine ») go with the band; the pill keeps the number and the
short name, which say the same.

On a narrow line the race gets shorter, never fewer than three legs: under
a 640px row the current leg's name goes (pictogram and number stay), under
560px its pictogram too (a 568 × 320 phone on its side with the quiz's
progress). Both stay for screen readers.

**The landing's primary stays** (must stay 3): A15.15 holds as it is.

### 5. The row and the band

**The row absorbs the space; the band folds into its colour.** The race
moves into the row's line; the band folds up under the glass, and what is
left of it is its colour, 4px, over its own 2px ink edge — the edge the
band already has. The row slims from 72 to 48px around the same controls
(they are drawn 28–37px tall and keep their 44px targets through their hit
strips).

**A page with no band** slims the same way, and **the dashed rule stays its
edge**: it rises with the line (50px). Where the browser can tell the header
is stuck, today's rule and the compact one are the same line handed over in
place.

### 6. The glass

**It stays the frosted paper at 92%**, in both states. Reasons:

- every control in the line was designed on paper: the red primary, the
  ink language switch, the result's tags, the muted progress. On a
  coloured bar each would need a new version: the red primary against ink
  is 3.46:1, against ultramarine 1.99:1, against ochre 2.01:1; the ink
  switch against ultramarine 1.74:1; the quiz's muted progress on ink
  2.23:1;
- the space already has its colour in the line twice — the filled pill and
  the stripe — which is what tells you where you are;
- 92% is the contrast bound; keeping it keeps today's numbers (below).

### 7. The motion

Both ways, 370ms in all, existing tokens only (MOTION.md has every value):

- **Compacting** — *leaving*: the landing's two links (opacity, 8px up,
  `--dur-close`). *In place*: the glass shrinks from the top (`scaleY`),
  the row rises to the middle of the line, the band folds up under the
  glass hanging from its edge, the edge rises (all `--dur-state`, together).
  *Arriving*: the race comes into the line (opacity, 8px up to its place,
  `--dur-open`, after `--dur-fast`), and the language switch closes up on
  the primary (`--dur-state`, after `--dur-fast`).
- **Expanding** — *leaving*: the compact race (`--dur-close`). *In place*:
  everything above in reverse, and the switch moves back first, to open
  the room. *Arriving*: the two links (`--dur-open`, after `--dur-fast`).

Which is the leaving? **Neither direction as a whole**: in each direction
something leaves and something arrives. What leaves is always the thing
that would be in the way of what comes, so it goes first and faster; the
surfaces in between change in place. No overshoot: `--ease-stamp` is for an
entrance to be noticed, and this one happens on every scroll.

Because the band hangs from the edge and slides under the glass, what
shows of it at any moment is exactly the room between the line and the
edge: no gap where the page shows through, and nothing crosses the
wordmark.

### 8. Anything else

Seen while measuring today's header (all reproduced on the board):

1. **A Tab into the sticky header scrolls the page back up**, today: the
   focused control sits inside `scroll-padding-top` (the header's height +
   12px), so the browser "reveals" it — from 800px down, three Tabs land at
   the top (Chromium). With the compact header it would be worse (the Tab
   that opens the header would also throw the reader to the top).
   **Fixed** by one rule (`globals.delta.md` §2).
2. **The language switch's targets are 42 × 44px**, not 44: the `sm`
   option's `min-width` is 40px and its hit layer covers only the 2px
   border on its outer side. **Fixed** by one line (`Segmented.delta.md`).
3. **Under a 560px band, the race's three number pills overlap their
   targets**: 28px pills 4px apart, each with a 44px hit strip → 32px
   across each. That is the phone held upright (and a 568px phone on its
   side, full). **Not changed** — must stay 2 — but the compact race spaces
   its pills 16px apart for exactly this reason, and the band could take
   the same 16px when it is next touched.
4. **A dead rule in SpaceBand.css**: `.SpaceBand_inner { padding-block:
   7px }` sits in `@container (max-width: 560px)`, but `.SpaceBand_inner`
   is the container: an element cannot query itself, so it never applies.
   Harmless; delete it or move it to a child.
5. **`--sticky-offset` is generous below 760px and on the quiz**: 118px
   where the header is 114px (4px), and 118px over the quiz's 93px header
   (25px: anchors and focus land 25px lower than they need to). Harmless;
   the compact offset is measured, so it is exact.
6. **The result's header on the screenshots shows no state tags** (only the
   language switch): the tags appear on a Deep dive or Roast Mode result.
   The board draws both, as asked (the widest right-hand side).

---

## What must stay

| | how |
|---|---|
| 1. Where you are | Wordmark; the race in the line, this leg filled in its space's colour with pictogram and short name; the space's colour as the stripe under the line. On a page without a space: the wordmark and the page itself, as today |
| 2. A phone held upright | Unchanged: every compact rule is under `(orientation: landscape)`, and the compact race is `display: none` in portrait (it cannot widen the page). Checked at 390 × 844 and 320 × 568, top and scrolled: today's header, today's offsets. The one exception is not this brief's header but the `Segmented` delta: the language switch is 4px wider there too (84 → 88px), for its 44px targets. Drop that delta if "unchanged" is to the pixel |
| 3. The landing's primary | Stays in the compact line, at the right, where it is. A15.15 holds |
| 4. The language switch | Stays in the compact line on every page that has it (all but the quiz and the Deep dive, as today) |
| 5. The race, a map of three legs | Always three pills in order, this one filled, a closed one greyed and dashed with « bientôt »; links where they are links today (not in the quiz or the Deep dive) |
| 6. 44px targets, never overlapping | Every control in the compact line measures ≥ 44 × 44px with nothing on top, on all 7 pages × 2 languages × 7 landscape windows (`board/check.cjs`). The race's pills are 16px apart so their 44px strips abut. Exceptions: today's, listed in Q8 (3) |
| 7. AA contrast | The glass is unchanged, so are its numbers; the new marks are measured below |

---

## The mechanics, one by one

**1. Nothing under the header moves.** The header's box keeps its full
height (118 / 93 / 74px) in both states; it is the layers inside it that
move, by transform: the glass (`scaleY`, from the top), the row
(`translateY`), the band and the edge (`translateY`). The page is never
reflowed, so the scroll position cannot cross back over the threshold.
The part of the box under the line lets clicks through
(`pointer-events: none` on the header, `auto` on the glass and the line's
controls). No strain.

**2. Without JavaScript, or without the feature: today's header.** The
server renders `data-compact="false"`; every compact rule needs
`data-compact="true"` (set by the script) *and* a landscape window. Without
`backdrop-filter`: solid paper, as today. Without `scroll-state()`: the
plain rule always drawn, as today. Without `:has()`: `--sticky-offset` stays
full (sticky things sit 64px lower than they need to, never under the
header). A page restored halfway down shows today's header until
hydration, then the compact line at once, without motion (transitions are
switched on two frames after the first state). The board's
`enhance=off` shows it.

**3. Reduced motion.** Your guard is enough: the header compacts and
expands, the sticky figures move with it, all instantly. Nothing
scroll-linked to switch off.

**4. The motion scale.** `--dur-state`, `--dur-open`, `--dur-close`,
`--dur-fast`, `--ease-out`, `--dist-step` — nothing new. `transform` and
`opacity` only on the header's parts (`visibility` flips at the start or
the end). The one property that is not a transform: `top`, on what sticks
*under* the header (5). It moves only the sticky element, by the 64px the
header gives back, at the header's speed.

**5. What sticks under the header follows it.** `--sticky-offset` becomes
the compact height while compact, landscape only:

```css
@media (orientation: landscape) {
  html:has(.SiteHeader_header[data-compact=true]) {
    --sticky-offset: var(--sticky-offset-compact, 54px);
  }
}
```

The script measures and sets `--sticky-offset-compact` (54px with a band,
50px without). The engine's figures and the game's column add
`transition: top var(--dur-state) var(--ease-out)` and glide 134 → 70px and
back (measured on the board). Anchors and focus follow through
`scroll-padding-top`, which reads the same variable.

**6. Keyboard.** Your lean: **the header returns full while keyboard focus
is inside it** (`focusin` with `:focus-visible`; a mouse click does not),
and compacts again when focus leaves. Nothing hidden is ever focusable:
what leaves is `visibility: hidden`; the compact race's links are
`tabIndex -1` (a keyboard user always gets the full header and the band's
race). The skip link is still the first stop. With the
`globals.delta.md` rule, Tab into the header no longer scrolls the page
(checked: from 800px down, Tab → skip link → wordmark → EN → FR → links →
primary → the band's race → the page, the scroll staying at 800px).
One strain: Shift+Tab from the page lands on the last *visible* control
(the primary); the band's race, hidden at that instant, is skipped once,
and the next Tab reaches it.

**7. One component, both languages.** One `SiteHeader`; each page passes
its own right-hand side, in today's order, marking what may leave with
`data-header-compact="leave"`. The race shortens by the line's width
(container queries), never by language. The longest strings — « 1 ·
DIAGNOSTIC », « Démarre ton Tour → », « Q 1 / 15 — 3 min restantes » — fit
at every landscape size drawn; the tightest gap is the result in French at
844px: 24px between the race and the language switch.

---

## Heights

The header's **box** keeps its full height; what is **painted** (and what
`--sticky-offset` says) is:

| window | with a band (landing, result, engine, game) | without (reading pages) | quiz |
|---|---|---|---|
| 1280 × 720 | 118 → **54** (16.4% → **7.5%**) | 74 → **50** (10.3% → **6.9%**) | 93 → **54** (12.9% → **7.5%**) |
| 1366 × 768 | 118 → **54** (15.4% → **7.0%**) | 74 → **50** (9.6% → **6.5%**) | 93 → **54** (12.1% → **7.0%**) |
| 1440 × 900 | 118 → **54** (13.1% → **6.0%**) | 74 → **50** (8.2% → **5.6%**) | 93 → **54** (10.3% → **6.0%**) |
| 1920 × 1080 | 118 → **54** (10.9% → **5.0%**) | 74 → **50** (6.9% → **4.6%**) | 93 → **54** (8.6% → **5.0%**) |
| 1024 × 768 | 118 → **54** (15.4% → **7.0%**) | 74 → **50** (9.6% → **6.5%**) | 93 → **54** (12.1% → **7.0%**) |
| **844 × 390** | 118 → **54** (30.3% → **13.8%**) | 74 → **50** (19.0% → **12.8%**) | 93 → **54** (23.8% → **13.8%**) |
| 568 × 320 (board) | 114 → **54** (35.6% → **16.9%**) | 70 → **50** (21.9% → **15.6%**) | 88 → **54** (27.5% → **16.9%**) |
| 390 × 844 | 114, unchanged (13.5%) | 70, unchanged (8.3%) | 106, unchanged (12.6%) |

The Deep dive's header (not in the brief's table) is 101px on the board's
stand-in; compact, 54px like every page with a band. The compact line is
always 48px: it does not depend on the row's height today (72, 68, or the
quiz's 47px). `--header-height-band-compact` and
`--header-height-plain-compact` carry the two numbers for your tests.

---

## Contrast, composed on the real ground

The glass does not change: `--surface-card` (#fbf9f2) at 92% over the
worst ground, solid ink (#211c15), composes to **#eae7e0**. Over the
engine's ultramarine, the game's ochre or the red primary it is lighter;
ink is the worst for everything below.

| in the compact line | on | ratio | needs |
|---|---|---|---|
| Wordmark, body text, race numbers (`--text-body`) | glass over ink | **13.7:1** | 4.5 |
| Muted text: quiz progress, a closed leg (`--text-muted`) | glass over ink | **6.15:1** (today's 6.14) | 4.5 |
| Red link text (`--text-link`) | glass over ink | **5.74:1** (today's 5.73) | 4.5 |
| Wordmark's red « GROWTH » (19px bold: large) | glass over ink | **3.78:1** | 3 |
| Race pill edges (`--border-hard`), current pill's ink edge | glass over ink | **13.7:1** | 3 |
| Closed leg's dashed edge (`--border-soft`) | glass over ink | **6.15:1** | 3 |
| Current leg, Tour: paper on ink | its own fill | **16.1:1** | 4.5 |
| Current leg, engine: paper on ultramarine | its own fill | **9.23:1** | 4.5 |
| Current leg, game: ink on ochre | its own fill | **6.93:1** | 4.5 |
| Tour pictogram (`--space-tour-mark`, red) on ink | its own fill | **3.63:1** | 3 |
| Ochre pill fill against the glass | glass over ink | 1.98:1 — carried by its **ink edge, 13.7:1** | 3 |
| The stripe: 4px of the space's colour **over 2px of ink** | glass / page | the ink edge carries 3:1 everywhere; the colour says which space (ultramarine 7.9:1, ochre 2.0:1 on the glass) | 3 |
| Hovered pill: ink on `--mark-hover-bg` | its own fill | **11.7:1** | 4.5 |
| Primary: paper on red | its own fill | **4.65:1** (unchanged) | 4.5 |
| Plain edge, the dashed rule | — | decorative, as today | — |

---

## The board

Serve the project over http (`python3 -m http.server` from the project
root) and open `design/ds-extension-08-return/board/index.html`. Every link
opens a page that scrolls; scroll it yourself, or use the frame's buttons.
`slow=10` stretches every token ten times to watch the order; `play=1`
scrolls down and up on its own.

`node design/ds-extension-08-return/board/check.cjs` (with
`BASE=http://localhost:8000/design/ds-extension-08-return/board`) checks
252 states and prints the keyboard walk; last run: 0 issues, 50 targets
set aside — all of them today's band under 560px (Q8, 3).

The board's pages are stand-ins (text, a card, a block of ink) under the
real header: your screenshots against the build stay the reference.
