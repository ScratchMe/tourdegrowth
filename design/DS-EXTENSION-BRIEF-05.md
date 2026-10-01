# Design system extension brief 05 — the stage chips

*Tour de Growth · from the codebase to Claude Design · 2026-10-01*

## Why this brief

On 2026-10-01 Antoine had the product read against the thirty
[Laws of UX](https://lawsofux.com/) (`design/LOIS-UX.md`). Every law held but
one. The law of **similarity** reads, in our words: *what looks clickable is,
and the reverse.* `result/PillarChip` breaks it.

A chip is one stage's score: `18/20 Acquisition`, five of them on every result
and in the landing's preview of a result. It is a **value**. It is drawn as a
**secondary button**: the same 2px solid edge, the same 12px radius, about the
same height, a flat face, no shadow at rest. Put one next to a real
`Button variant="secondary"` and only the typeface and a shade of the edge
tell them apart (`closeup-chip-vs-button-en.png`). At night it gets worse: the two edges
resolve to the same colour.

What a person can actually do with a chip on the result page is tap its
**`?`**, a 16px dashed ring that opens the stage's definition. The rest of the
box does nothing. So the box promises an action it does not have, and the one
real action inside it is the smallest thing on it.

Antoine has decided this is yours: a chip that reads as **a value, not an
action**, in paper and at night, without losing what makes it useful (below).
We will port what comes back; we are not changing the component ourselves.

Screenshots in `design/ds-extension-05/`, from a real production build
(2026-10-01, `next build` then `next start`, built the way our CI builds it:
the game's flag is open, so the result's "In the game" card on the right is
not in production yet; everything else is). All 2×, the close-ups 3×. The
sample result's weakest stage is Retention, 8/20: its chip is the red one.

- `result-en-desktop.png`, `result-fr-desktop.png` — `/r/sample` at 1280px,
  scrolled to the route profile: the five chips in their column, the primary
  action on the right, and a real secondary button (the game card's "Play the
  level…") on the same screen.
- `result-en-mobile.png`, `result-fr-mobile.png` — the same at 390px: the
  two-up grid.
- `home-en-desktop.png`, `home-fr-desktop.png` — the landing at 1280px, top of
  the page. The hero's secondary button ("See a sample result") sits **on
  the same line** as the first row of the preview's chips, 2px off in height:
  the confusion in place.
- `home-en-mobile.png`, `home-fr-mobile.png` — the landing's preview card at
  390px.
- `closeup-chip-vs-button-en.png`, `closeup-chip-vs-button-fr.png` — the
  share card's real secondary Button ("Share this result" / « Partager ce
  résultat ») beside a normal chip and the weak one. The three nodes are
  cloned from the same production page, so the production CSS draws all of
  them; only the chips' width is set (220px).

## Where the chip lives today

| Where | How many | What it is | What can be tapped |
|---|---|---|---|
| The result (`/r/<id>`, `/r/sample`) | Five, AARRR order, under the route profile: a column of five on desktop (each 420px wide, `stretch`), a two-up grid on a phone | `PillarChip` `size="md"` `stretch`, with a `GlossaryTerm` in its `children` slot | **The `?` only.** The box is a `<span>` |
| The landing's preview of a result | Five, a two-up grid inside the hero card | `PillarChip` `size="sm"` `stretch`, no `?` | **The whole chip**: each one is wrapped in a link to its stage's glossary page (REVIEW-02 R2-13: the landing passed nothing to the term pages). No hover state of its own; its accessible name is the stage name alone |
| The synced system | `PillarChip` (stories `Chips`, `Stretch`, `Small`) and `GlossaryTerm` (story `InPillarChips`) | | |

In roast mode the lowest stage leaves the grid as `StampedPillar` (a red
stamp across the full row, out of scope here, but it sits in the same grid),
and the second-lowest takes the `weak` chip. On a level board (every stage
equal) no chip is red.

## What makes it read as a button

Measured in the production build, 2026-10-01.

| | `PillarChip` (normal) | `PillarChip` `weak` | `Button variant="secondary"` |
|---|---|---|---|
| Edge | 2px solid `--border-soft` (paper: `--ink-1` #5b5346) | 2px solid `--border-alert` (`--paint-red` #d2402c) | 2px solid `--border-hard` (paper: `--ink-0` #211c15) |
| Edge at night | `--night-line` #7d7260 | `--paint-red` | `--night-line` #7d7260 — **the same** |
| Fill | `--surface-card` (paper: `--paper-0`) | `--surface-alert` (paper: `--paint-red-wash`) | transparent |
| Radius | `--radius-button` (12px) | the same | `--radius-button` (12px) |
| Shadow | none | none | none at rest; a 3px hard shadow and a 2px lift on hover |
| Height | 54.5px desktop (`md`), 50px on a phone and at `sm` | the same | 47px (`md`), 55px (`lg`, the landing's hero) |
| Type | mono, `--meta-md` (13px) / `--meta-sm` (12px), score at 600 | the same, in `--text-alert` | Inter, `--label-button` (15px, 600) |
| Hover / cursor | none / default (a link's pointer on the landing) | the same | lifts / pointer |

Three things, in that order, make the resemblance:

1. **A closed box with the button's own radius.** 12px is the token named
   for buttons (`--radius-button`: "buttons, sunken example blocks"). A
   value has no reason to borrow it.
2. **A 2px solid edge all the way round.** The system's own word for a solid
   2px edge is "a real edge"; `--border-soft`, the chip's colour, is
   documented as "2px dashed — pending / secondary", and the chip uses it
   solid. On paper the chip's edge is a shade lighter than the button's; at
   night the world binds `--border-soft` and `--border-hard` to the same
   `--night-line`, and the difference is gone.
3. **A button's size and proportions.** 47 to 55px tall, a short label, the
   box sized to it (or stretched like a full-width button). On the landing at
   1280px the hero's "See a sample result" (55px) and the first row of chips
   (50px) start 2px apart on the same line.

The fill does not help: on the page (the result) the `--paper-0` face on the
`--paper-1` ground reads as a raised object; inside a card (the landing) the
fill equals the card's and the chip is just an edge — exactly what a
transparent secondary button is on that card.

## What must stay

1. **The score out of 20.** The figure and its `/20` always print (there is no
   prop that yields a bare "18"), in mono, score first. The chip's text is
   its whole reading for a screen reader.
2. **The red of the stage that stalls.** At most one chip is red, and the red
   is a **diagnosis**: in this system that means a red wash or a solid red
   edge, never dashed (dashed red is advice: `PriorityMove`, on the same
   screen). The route profile above the chips names the same stage in red; the
   chip has to agree with it.
3. **The `?` that opens the definition.** `GlossaryTerm` = `DefinitionTrigger`
   (a 16px dashed ring, muted, alert-red on the weak chip, ink once open) +
   `DefinitionPopover`, one popover open per screen. It sits right after the
   stage name.
4. **A 44px touch target** for anything that can be tapped — the `?` today
   (its 16px ring carries a transparent 44px disc; `e2e/targets.spec.ts`
   measures it and checks that no two discs overlap), and the whole chip on
   the landing, which is a link.
5. **AA contrast, checked by our CI with no exception left**
   (`e2e/accessibility.spec.ts` runs on `/r/sample`): text 4.5:1, every edge,
   ring and mark 3:1 against what is next to it, translucent colours measured
   composed on their real ground.

And, unless you tell us otherwise: **the meter** along the foot (design I + B,
retained by Antoine on 2026-09-28) — the score's share of 20, ink, red on the
weak stage, hidden from assistive technology. Its job is that five bars
compare, which is why the chips are stretched into equal cells: five
content-sized chips drew a 16/20 bar as long as an 18/20 one. Redraw it if
you like; keep the job.

## What we expect

A chip that reads as **a value**, not an action — something you read, like a
line of a score sheet or a reading on a gauge — **in paper and at night**,
with the `?` as the evident one thing to touch, and the red stage still the
first thing the eye finds among the five.

## Contrast today

The chips sit on the page on the result (paper `--paper-1`, night `--night-0`)
and inside a card on the landing (paper `--paper-0`, night `--night-1`). Night
is not drawn today: the result never appears at night. We want it drawn
anyway, as in brief 04, so that the first chip at night is a decision; the
tokens re-resolve there on their own.

| Pair | Paper | Night |
|---|---|---|
| Score (`--text-body`) on the chip's fill | 16.06 | 15.22 |
| `/20` and stage name (`--text-muted`) on the fill | 7.20 | 7.70 |
| Chip edge (`--border-soft`) against the page | 5.81 | 3.99 |
| Chip edge against a card | 7.20 | 3.70 |
| Weak text (`--text-alert`) on the wash (`--surface-alert`) | 5.28 | 5.56 (`--night-bad` on `--night-red-wash`) |
| Weak edge (`--border-alert`, the brand red) against the page | 3.57 | 4.04 |
| Weak edge against a card | 4.42 | 3.76 |
| Meter fill (`--viz-ink`) on the fill | 16.06 | 15.22 |
| Weak meter fill (`--viz-highlight`) on the wash | 3.47 | 5.56 |
| Meter track (`--viz-grid`) on the fill — decorative | 1.33 | 1.48 |
| `?` ring, muted / alert, on its fill | 7.20 / 5.28 | 7.70 / 5.56 |
| For comparison: the secondary button's edge (`--border-hard`) against the page | 12.97 | 3.99 |

The weak edge on the page (3.57) and the night edges (3.70 to 4.04) clear the
3:1 a component edge needs, not by much. If the box goes, whatever replaces
it as a mark still owes 3:1.

---

## Questions

**The value**

1. **What makes it a value?** Drop the closed box for something the system
   already uses for readings — a ruled row (`DataTable`'s solid rule under
   dashed rows), the route profile's own axis, a sunken fill
   (`--surface-sunken`, already the fill of the `Tag` pill, the sunken
   `Card` and `Disclosure` — careful), a bare figure with its meter — or
   keep a box and change what makes it a button (radius, edge,
   proportions)? Say which of the three causes above your answer removes.
2. **The red without the box.** If the edge goes, does the diagnosis live in
   the wash alone, a solid red rule on one side, the meter and the figure, or
   something else? It must stay a diagnosis and never read as advice.
3. **Density.** Five chips at 54.5px with 8px gaps make a column of about
   305px on desktop, under a route profile that already shows the same five
   numbers as a shape. Can the new form be shorter, or should the five read
   as one object (one panel, five rows) rather than five objects?

**The one thing to touch**

4. **The `?`.** Once the box stops looking tappable, is the 16px dashed ring
   enough to say "tap here", or does it change (ink, a filled state, its
   place)? Any change to `DefinitionTrigger` reaches the quiz too, where it
   sits inside question text: say if it does.
5. **The landing, where the whole chip is a link.** There, the chip **is** an
   action, to the stage's glossary page, with no hover state and no sign that
   it goes anywhere. Should a chip that is a link look different from one
   that is not (an underlined stage name, a `→`, a hover), or should the
   landing's chips become values too, with the link moved to the stage name
   or to a `?` like the result's? Its accessible name is the stage name
   alone today, so a screen reader hears "Acquisition, link" without the
   score; tell us what it should say, the fix is ours.

**Around it**

6. **The roast's `StampedPillar`** sits in the same grid, across a full row.
   Does it change to match, or is a stamp the right exception (it is an
   inked stamp, not a value)?
7. **Naming.** "Chip" is, in most systems, the name of a small interactive
   element. Keep `PillarChip`, or a name that says "value" (we mirror
   yours in `src/components/result/`)?
8. **Anything else this brief did not ask** that you see on the
   screenshots.

## The states we need

In **paper and night**, at **390px and 1280px**, in **both languages**:

- the five chips together, as on the result (column on desktop, two-up on a
  phone), with the weak one red, and on a level board (none red);
- the roast's grid: the stamp plus four chips, the second-lowest red;
- the `?`: closed, **hover** (pointer only — nothing may look selected on a
  stuck touch hover), **focus-visible**, and **open** with its popover;
- the landing's five, as links: rest, hover, focus-visible;
- one chip beside a `Button variant="secondary"` and the primary, so the
  difference can be seen, not argued.

## Both languages

Stage names stay in English on French screens ("Acquisition, Activation,
Retention, Referral, Revenue" in both: it keeps the acronym readable). What
changes length is around them. Real strings:

| | English | French |
|---|---|---|
| A chip | 18/20 Acquisition ? | 18/20 Acquisition ? |
| The weak chip | 8/20 Retention ? | 8/20 Retention ? |
| The `?`'s accessible name | Definition: Retention | Définition : Retention |
| The popover's close / more | Close · Learn more → | Fermer · En savoir plus → |
| The route profile above (set in capitals) | Route profile · height = points missing out of 20 | Profil du parcours · hauteur = points manquants sur 20 |
| The secondary button beside them (result) | Share this result | Partager ce résultat |
| The secondary button beside them (landing) | See a sample result | Voir un résultat d'exemple |

---

## Constraints that are not up for discussion

1. **Tokens only.** Any new value is a new token in `tokens/*.css`, never a
   hex inline; components read semantic names, never a `--night-*` primitive
   (a test holds that). The typography tokens are `font` **shorthands**.
2. **Contrast is checked in CI with no remaining exceptions** (above).
3. **44px targets** on everything that can be tapped, and none overlapping its
   neighbour's.
4. **Red means one of three things, never a fourth**: solid red fill = the
   primary action; red wash or solid red edge = a diagnosis; dashed red =
   advice. The chip is a diagnosis.
5. **One signature effect per element**: hard shadow *or* dashed border, never
   both. Dashed already means "not yet" (and, in red, advice).
6. **One loud thing per screen.** The score card is the raised one on the
   result, the hero card on the landing; the chips must not out-shout it, nor
   the primary action.
7. **No icons, no images.** The glyphs are `🔥` (roast only), `→`, `←`, `№`,
   and the `?` of the definition.
8. **Bilingual from the same component** — never two layouts for two
   languages.
9. **Readable without JavaScript.** The chip is rendered on the server; its
   phone size comes from CSS alone (`md` shrinks below 760px on its own). The
   `?` is the only part that needs the client.
10. **The text is the reading.** Whatever carries the value visually (a bar, a
    shape), the score and its `/20` stay in the text, and decoration stays
    hidden from assistive technology.

## What already exists that you may reuse

`viz/StatTile` (a flat tile for one reading, "a dashboard is a row of flat
`StatTile`s"), `viz/StageProfile` (the same five scores as a shape, right
above the chips), `viz/BulletChart`, `core/DataTable` (the ruled table),
`core/Tag` (the mono pill), `brand/MetaLabel`, `glossary/GlossaryTerm`, and
the night world's `NightSurface`. Prefer a composition where one works, and
say so.

## What we need back

Same shape as extension 04's return (`design/ds-extension-04-return/`), so
the port is mechanical:

- a `README.md` with a "What is in the bundle" table and an answer to each
  numbered question above, then the constraints one by one, the night, and
  the contrast measured composed on the real ground;
- `components/result/PillarChip/` (or the new name) as React + `.d.ts` +
  `.prompt.md` + CSS — the `.prompt.md` usage rules are the part we rely on
  most: when it is a value, when it is a link, what never to do;
- a `*.delta.md` for any other component that changes (`DefinitionTrigger`,
  `StampedPillar`, `Button`…), or a line saying none does;
- any new tokens in `tokens/*.css`;
- the board: `board/index.html`, and `board/board.html?world=&lang=&w=`
  (`paper`/`night`, `en`/`fr`, `390`/`1280`) with every state above. **Keep
  it openable from its own source in the folder**: last time the rendered
  PNGs and the built `board.js` could not be copied back to the repo, so we
  replay the board from its source;
- inline styles are fine; we port to CSS Modules.

## Handoff back

Write the return under `design/ds-extension-05-return/` in this project; we
copy it into the repo, file by file, at the same paths. The port into
`src/components/`, the tests and the screenshots against the real build are on
our side.
