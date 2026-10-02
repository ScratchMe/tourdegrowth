# Design brief 08 — the sticky header, compact once the page scrolls

*Tour de Growth · from the codebase to Claude Design · 2026-10-02*

## Why this brief

Antoine, on 2026-10-02 (translated): *the sticky top bar is rather pleasant
on a phone held upright. But on a desktop, which is landscape by nature, it
takes a lot of room. We should find a way to make it smaller when the page
scrolls on desktop. Of course it must keep what tells you where you are in
the app, but its height can come down. It should be done with an elegant
transition and motion.* He asked for it to be drawn here.

The header is `brand/SiteHeader` with, on most pages, `brand/SpaceBand`
hanging from it (both synced). It sticks to the top of the window on every
page of the site. Measured on a production build of 2026-10-02, header
height and its share of the window:

| Window | Header with the band (landing, result, engine, game) | Header without (glossary, How it works…) | Quiz |
|---|---|---|---|
| 1280 × 720 (a laptop) | 118 px, **16.4 %** | 74 px, 10.3 % | 93 px, 12.9 % |
| 1366 × 768 | 118 px, 15.4 % | 74 px, 9.6 % | 93 px, 12.1 % |
| 1440 × 900 | 118 px, 13.1 % | 74 px, 8.2 % | 93 px, 10.3 % |
| 1920 × 1080 | 118 px, 10.9 % | 74 px, 6.9 % | 93 px, 8.6 % |
| 1024 × 768 (a tablet, landscape) | 118 px, 15.4 % | 74 px, 9.6 % | 93 px, 12.1 % |
| **844 × 390 (a phone, landscape)** | 118 px, **30.3 %** | 74 px, 19.0 % | 93 px, 23.8 % |
| 390 × 844 (a phone, portrait: the one Antoine likes) | 114 px, 13.5 % | 70 px, 8.3 % | 106 px, 12.6 % |

The same 114 px that reads as light on a phone held upright is a sixth of a
laptop and nearly a third of a phone turned sideways. **The problem is the
landscape window, not the wide one** — which is how Antoine put it.

Screenshots in `design/ds-extension-08/`, from that build (the engine and
the game open, as they will be at launch), all at 2×:

- `landing-fr-1280-top.png` — the landing at the top, 1280 × 720: the header
  at rest, nothing under it yet;
- `landing-fr-1280-scrolled.png`, `result-en-1280-scrolled.png` — scrolled:
  the header over the page, the space band in the Tour's ink;
- `engine-fr-1280-whatif.png` — the engine's page (ultramarine band),
  scrolled through its « Et si » figures, **which stick under the header**
  (at 134 px, the header's 118 + 16);
- `game-hub-en-1280-scrolled.png` — the game's hub (ochre band);
- `glossary-fr-1280-scrolled.png` — a reading page: no band, the header's
  dashed rule, drawn only once the page runs under it;
- `landing-fr-844x390-scrolled.png`, `result-en-844x390-scrolled.png` — a
  phone held sideways: the header is the top third of the screen;
- `landing-fr-390-scrolled.png` — a phone held upright, for reference: the
  band runs on two lines, the race is three numbers. **This one stays as it
  is**;
- `header-*.png` — the header alone at 1280 px, on each kind of page: the
  landing (FR and EN: the longest right-hand side, two links and the primary
  action), the result, the quiz, the engine, the game, a glossary term.

The copy on them is under review (it goes to a proofing sheet with Antoine):
design against its length, not its words.

**Brief 07 sits next to this one** in the project (the growth engine made
simpler, `design/DS-EXTENSION-BRIEF-07.md`), and may be answered at the same
time. The two do not overlap: it redesigns the engine's page under the
header, this one the header over every page. Whatever the engine keeps
sticky under the header after brief 07, mechanic 5 below applies to it.

## What the header is today

From the code (`SiteHeader.tsx`, `SiteHeader.module.css`, `SpaceBand.tsx`,
`SpaceBand.module.css`, synced):

- **One component for every page.** The landing, the content pages, the
  result, the quiz and the Deep dive all render `SiteHeader`; each page puts
  its own controls on the right of one row. The row aligns to the page's
  content column: `wide` (1040 px), `reading` (760 px) or `narrow` (720 px).
- **Sticky, on frosted glass.** `position: sticky; top: 0`, the raised paper
  (`--surface-card`) at 92 % over `backdrop-filter: blur(14px)
  saturate(1.3)`. The 92 % is a contrast bound, not a taste: whatever scrolls
  under it shows through, and the worst ground is solid ink (a card's hard
  shadow, the game's night desk). At 92 % over ink, the row's muted text holds
  6.14:1 and red link text 5.73:1; the design I + B mockup ran 74 %, which put
  them at 4.16 and 3.89. A browser without `backdrop-filter` gets solid paper.
- **The row**, 72 px on a desktop: 14 px of padding above and below a 44 px
  control (the language switch is a 44 px `Segmented`, drawn 32 px). The
  wordmark is 19 px tall. Below 760 px the padding is 12 px (68 px).
- **The space band**, 46 px (a 44 px minimum plus its 2 px solid bottom
  edge), on every page that belongs to one of the three spaces, in the
  space's colour: ink for the Tour, ultramarine for the engine, ochre for the
  game (`tokens/spaces.css`). Left: the space's pictogram (34 × 22), its
  place and kind (« 1/3 · Plaine », mono, capitals), a fine rule, its name
  (« Le diagnostic », the display face). Right: **the race**, a `nav` of three
  28 px pills (pictogram, number, short name), this leg filled, a closed leg
  greyed, dashed and marked « bientôt », never a link. In the quiz and the
  Deep dive the race is a map, not an exit: no links.
- **Narrower**, the band adapts by container query: under 900 px the race
  drops its names (numbers and pictograms), under 560 px the name goes on top
  of its place, on two lines, and the race is three numbers.
- **Without a band**, the header's bottom edge is the dashed rule
  (`--border-rule`), and only once the page runs under it: a
  `scroll-state(stuck: top)` container query (Chromium 133+; elsewhere the
  rule is always there).

What each page puts on the right of the row:

| Page | Space | Right of the row | Notes |
|---|---|---|---|
| The landing (`/fr`, `/en`) | Tour | Language switch, « Glossaire », « Comment ça marche » (quiet links), **« Démarre ton Tour → »** (the primary action, `sm`, hard shadow) | Below 760 px the two links and the primary leave the header (the footer carries the links, the page ends on the primary) |
| The result (`/r/<id>`) | Tour | Language switch, and the state tags: Deep dive, « 🔥 Roast Mode » | Below 760 px the tags move to the top of the page |
| The quiz | Tour, race unlinked | Progress: « Q 1 / 15 — 3 min restantes », then « Plus que deux écrans », « Dernier écran » | Row 47 px: no 44 px control in it |
| The Deep dive | Tour, race unlinked | The Deep dive tag | |
| The engine | Engine | Language switch | |
| The game's hub and levels | Game | Language switch | The level's own phone column sticks under the header |
| Reading pages (glossary, How it works, comparisons, about…) | none | Language switch | |

**What depends on the header's height.** `--sticky-offset` (`globals.css`)
is the height, measured once per kind of header (118 px with a band, 74 px
without) and used by:

- `scroll-padding-top`, so anchors and keyboard focus land below the header
  rather than under it (WCAG 2.4.11, focus not obscured);
- the engine's « Et si » figures, sticky at `--sticky-offset` + 16 px
  (`engine-fr-1280-whatif.png`);
- the game level's side column (the phone, the dashboard), sticky at
  `--sticky-offset` + 22 px.

## What must stay

1. **Where you are.** Antoine's one condition. Today that is said three
   times: the wordmark (the site), the band (the space: pictogram, colour,
   name, its place in the race), and the page's own controls. Which of them
   carries "where you are" in the compact state is yours; at least the space
   must still read on a page that has one.
2. **A phone held upright keeps today's header**, unchanged. Antoine likes it.
3. **The landing's primary action stays in view on a wide screen.** Since
   2026-10-01 (A15.15) the landing's closing « Démarre ton Tour → » block is
   hidden above 760 px *because* the sticky header keeps its own: two
   primaries would be in view. If the compact header drops it, the page loses
   its only primary below the hero. Keep it, or tell us and we reopen A15.15.
4. **The language switch stays reachable.** It is the one control no other
   part of the page carries (the footer has the links, not the switch).
5. **The race stays a map of three legs**, this one filled, a closed one
   greyed and dashed (Antoine, 2026-09-28). Its links stay links where they
   are links today.
6. **44 px targets.** Anything that can be tapped keeps a 44 × 44 target,
   which may be a transparent strip around a smaller drawing
   (`styles/hit.module.css`, `Button` `sm` and `quiet`); no two targets may
   overlap. `e2e/targets.spec.ts` measures it.
7. **AA contrast, checked by our CI with no exception left**
   (`e2e/accessibility.spec.ts`): text 4.5:1, edges and marks 3:1, a
   translucent colour measured composed on its worst real ground. If the
   compact state changes the glass (its opacity, its colour), its numbers
   change with it.

## What it has to survive: the mechanics

The CSS and the script are ours to write; these are the rules any design must
leave room for. Tell us where your design strains one of them.

1. **Nothing under the header moves.** The content must not jump when the
   header changes height, and the change must not feed back into the scroll:
   a header that shortens the page as it shrinks moves the scroll position
   back across its own threshold, and flickers between its two states. In
   practice, the header's box in the page keeps its full height and the
   compact state is what sticks and what is painted. A design that needs the
   content to move up into the freed space has to say how it avoids that loop.
2. **Without JavaScript, or in a browser without the feature, today's header,
   as it is.** The header is server-rendered and the site is readable without
   JavaScript. The compact state is an enhancement on top.
3. **Reduced motion.** The site has one guard: under
   `prefers-reduced-motion: reduce`, every animation and every transition is
   off (`!important`). The compact state still applies there, without motion;
   a scroll-linked animation would be switched off by the same guard. Say what
   the reduced version is.
4. **The motion scale** (`tokens/motion.css`) is named by use: `--ease-out`
   (every settle), `--dur-state` 250 ms (an element changes state in place),
   `--dur-open` 250 ms / `--dur-close` 150 ms (leaving is faster than
   arriving), `--dur-fast` 120 ms (hover, press), `--dist-step` 8 px. Only an
   entrance may overshoot (`--ease-stamp`, the stamp), never an exit; only a
   loop repeats. A new duration or curve is a new token with its use in its
   name. Animate `transform` and `opacity` where you can: the glass blurs
   whatever moves under it, and animating height under a backdrop filter is
   the expensive case.
5. **What sticks under the header follows it.** The engine's figures and the
   game's column must glide with the header into its compact place, not leave
   a gap where the full header was; anchors and focus too. We will make
   `--sticky-offset` follow the state; tell us the compact heights.
6. **Keyboard.** Focus never lands on something hidden: whatever leaves the
   compact header leaves the focus order with it, or the header returns to
   full while focus is inside it (our lean). The skip link (« Aller au
   contenu ») stays the first stop.
7. **One component, both languages.** `SiteHeader` draws the compact state
   once for every page; each page keeps its own right-hand side. Never two
   layouts for two languages. The longest strings are below.

## Both languages

All under review. The band's strings are set in capitals where shown so.

| | Français | English |
|---|---|---|
| Band, place and kind | 1/3 · Plaine · 2/3 · Contre-la-montre · 3/3 · Montagne | 1/3 · Flat · 2/3 · Time trial · 3/3 · Mountain |
| Band, name | Le diagnostic · Le moteur · Le côté obscur | The check-up · The engine · The dark side |
| Race pills | Diagnostic · Moteur · Côté obscur, and « bientôt » | Check-up · Engine · Dark side, and "soon" |
| Race, accessible name | Le Tour en trois parties | The Tour in three parts |
| Landing links | Glossaire · Comment ça marche | Glossary · How it works |
| Landing primary | Démarre ton Tour → | Start your Tour → |
| Quiz progress | Q 1 / 15 — 3 min restantes · Plus que deux écrans · Dernier écran | Q 1 / 15 — 3 min left · Two screens to go · Last screen |
| Result tags | Deep dive · 🔥 Roast Mode (set in capitals) | Deep dive · 🔥 Roast Mode (set in capitals) |

## Questions

These are yours to answer; our lean is given so you can disagree with it.

**When**

1. **Which windows compact?** The table says the problem is a landscape
   window, a phone held sideways worst of all, and a phone held upright is
   explicitly out. Our lean: every landscape window (`orientation:
   landscape`), phones included, and portrait never. Or a height threshold
   (say, windows under 900 px tall), which would leave a 1920 × 1080 screen
   (10.9 %) alone?
2. **What triggers it, and what brings the full header back?** By position
   (compact once the header covers the page, full again at the top: the moment
   the plain header's rule already appears) or by direction (full again as
   soon as the reader scrolls up, as many reading sites do)? Our lean:
   position. It is predictable, it holds without JavaScript where the browser
   supports it, and the header does not move while someone reads back up.
3. **A state or a scrub?** A change of state with one transition once a
   threshold is passed, or a scroll-linked animation that follows the
   scrollbar over its first N pixels? Our lean: a state, for the reduced-motion
   guard (3 above), for a Firefox that lacks scroll-driven animations, and
   because a scrubbed header stops halfway when the reader stops halfway.

**What**

4. **What the compact header keeps, page by page** (the table above). Our
   lean: one line, around 56 px or less, carrying the wordmark, the space
   (pictogram and name in its colour), the race as numbers, and the page's
   action (the landing's primary, the language switch, the quiz's progress).
   The landing's two quiet links can leave: the footer carries them.
5. **The row and the band**: do they merge into one line (the band absorbs
   the wordmark, or the row absorbs the space), does the row go and the band
   stay, or does each slim down? And a page with no band: does its 74 px row
   simply slim, and does the dashed rule stay its edge?
6. **The glass.** Does the compact state keep the frosted paper, or take the
   space's colour across (an ink, ultramarine or ochre bar)? Mind 7 above:
   92 % is a bound.

**How it moves**

7. **The motion itself**: what moves, from where to where, in what order,
   with which tokens, both ways (compacting and expanding). Leaving is faster
   than arriving: which of the two is the "leaving" here?
8. **Anything else** you see on the screenshots that this brief did not ask.

## The states we need

In **paper** (the header is never drawn at night: the game's night is inside
the page, under the glass), in **both languages**, at **1280 × 720, 1440 ×
900 and 844 × 390**, and at **390 × 844** to show it does not change:

- full and compact, for the landing, the result (with both state tags, the
  widest), the quiz, the Deep dive, the engine, the game's hub and a reading
  page without a band;
- the transition between the two, both ways, as a working prototype that
  scrolls, plus its spec (below);
- keyboard focus inside the compact header, and hover on a race pill and on
  the landing's primary there;
- the engine's « Et si » figures under the compact header;
- reduced motion.

## What already exists that you may reuse

`brand/SiteHeader`, `brand/SpaceBand`, `brand/Wordmark` and `WordmarkLink`,
`brand/LocaleSwitcher` (on `core/Segmented`), `core/Button` (`sm`, `quiet`,
`hard`), `brand/MetaLabel`, `brand/ModeTag`, the pictograms of
`space-pictos.ts`, the tokens of `spaces.css` and `motion.css`. Prefer a
composition where one works, and say so.

## What we need back

Same shape as extension 05's return (`design/ds-extension-05-return/`), so
the port is mechanical:

- a `README.md` with a "What is in the bundle" table, an answer to each
  numbered question above, then the mechanics one by one (where your design
  sits against each), the compact heights per kind of header and per window,
  and the contrast measured composed on the real ground;
- **the motion as a spec**: per element, the property, its from and to
  values, the duration and easing by token name, any delay or stagger, and
  what triggers it, in both directions, and the reduced-motion version;
- `components/brand/SiteHeader/` (and `SpaceBand/` if it changes) as React +
  `.d.ts` + `.prompt.md` + CSS — the `.prompt.md` usage rules are the part we
  rely on most: what the compact state keeps, what a page may add to it, what
  never to do; a `*.delta.md` for any other component that changes, or a line
  saying none does;
- any new tokens in `tokens/*.css`;
- the board: `board/index.html`, and a page that **really scrolls**, for each
  page and window above (`board/board.html?page=&lang=&w=&h=`, or your own
  scheme, said in the README). **Keep it openable from its own source in the
  folder**: built PNGs and bundles could not be copied back to the repo twice
  already, so we replay the board from its source;
- inline styles are fine; we port to CSS Modules.

## Handoff back

Write the return under `design/ds-extension-08-return/` in this project; we
copy it into the repo, file by file, at the same paths. The port into
`src/components/brand/`, the tests (the sticky offset, the targets, the
contrast, the two languages, no horizontal scroll at any width) and the
screenshots against the real build are on our side.
