SiteHeader — design system extension 08. The sticky header, and its compact
line once the page scrolls in a landscape window.

## Anatomy

**Full (today's, unchanged).** The row — wordmark left, the page's controls
right, on frosted paper (`--surface-card` at 92%, blur 14px, saturate 1.3) —
then, on a page that belongs to a space, the band: pictogram, place and kind,
the space's name, and the race of three legs. 118px with a band (114px under
760px), 74px without (70px). The quiz's row has no 44px control, so its
header is 93px.

**Compact.** One line of 48px on the same glass, then the edge:

| part | full | compact |
|---|---|---|
| wordmark | left | left, same size, same place in the line |
| the race | in the band, right | after the wordmark: this leg filled in its space's colour with its pictogram and short name, the others a number, a closed one greyed and dashed |
| the page's controls | right | right; what is marked `leave` goes, what stays closes up on the right |
| the band | 46px of colour | folded under the line; its colour stays as the edge: 4px of it over its 2px ink edge |
| plain page | dashed rule (once stuck) | the same dashed rule, under the line |
| height painted | 118 / 74 | **54 / 50** |
| header's box | 118 / 74 | **118 / 74** — never changes (mechanic 1) |

## When

- **Landscape windows only** (`@media (orientation: landscape)`): laptops,
  desktops, tablets on their side, phones on their side. A phone held
  upright keeps today's header (it already takes 13.5% of the screen, and
  its band carries the race).
- **Compact as soon as the page has scrolled** (`scrollY > 0`), full again at
  the very top. Position, not direction: no threshold, no "show on scroll
  up". The box keeps its height, so the state cannot feed back into the
  scroll.
- **Full while keyboard focus is inside** (`:focus-visible` on focusin; back
  to compact when focus leaves). A mouse click does not expand it.
- A page opened halfway down (reload, back button, anchor) starts compact
  without moving: transitions switch on only after the first paint.

## What compact keeps, page by page

| page | compact line (left → right) | leaves |
|---|---|---|
| landing | wordmark · race (linked) · language · **Start your Tour →** | Glossary, How it works |
| result | wordmark · race (linked) · language · Deep dive · 🔥 Roast Mode | — |
| quiz | wordmark (not a link) · race (not linked) · progress | — |
| Deep dive | wordmark (not a link) · race (not linked) · Deep dive | — |
| engine | wordmark · race · language | — |
| game hub, levels | wordmark · race · language | — |
| reading pages | wordmark · language (dashed rule under) | — |

Below 760px the pages already move things out of the row today (the
landing's links and primary, the result's tags); that does not change.

## How a page uses it

```jsx
<SiteHeader locale={locale} space="tour" width="wide">
  <WordmarkLink locale={locale} />
  <LocaleSwitcher locale={locale} path="/" />
  <a className={styles.quiet} data-header-compact="leave" href={…}>{t.glossary}</a>
  <a className={styles.quiet} data-header-compact="leave" href={…}>{t.how}</a>
  <Button variant="primary" size="sm" href={…}>{t.start}</Button>
</SiteHeader>
```

- Keep **today's order**. Mark with `data-header-compact="leave"` only what
  may go: secondary links. Never the language switch, a primary, a state
  tag, the quiz's progress.
- A control that stays and has leaving ones after it **closes up** on the
  right by a transform (`--header-close-up`, measured). SiteHeader sets the
  `transform` and `transition` of what leaves and of what closes up: a
  control with its own (a Button's hover lift, a link's colour fade) is
  wrapped in a `<span>` that carries the mark instead.
- What must fit on one line: wordmark + 20px + the compact race + 16px + the
  kept controls. The race shortens itself on a narrow line (the current
  leg's name goes below a 640px row, its pictogram below 560px — both stay
  for screen readers). If a page's kept controls cannot fit beside it at
  844 × 390, mark more of them `leave`, do not shrink the race.
- Anything that sticks under the header reads `--sticky-offset` and carries
  `transition: top var(--dur-state) var(--ease-out)` (globals.delta.md).
  The offset follows the state; the header's box does not.

## Never

- Never change the header's height, `top`, `position` or padding with the
  state — only the layers inside it move (glass, row, band, edge), by
  transform. A height change would move the page and could flip the state
  back (the feedback loop the brief rules out).
- Never put a focusable control in the compact race. Its links are
  `tabIndex -1`: keyboard users get the full header and the band's race.
- Never colour the glass with the space: the space's colour is the stripe
  and the filled leg; the glass stays paper at 92% (the contrast bound).
- Never compact a phone held upright, or a page without the script.
- Never add a duration: the motion uses `--dur-state`, `--dur-open`,
  `--dur-close`, `--dur-fast`, `--ease-out` (MOTION.md).

## Keyboard and screen readers

- Skip link first, as today ("Aller au contenu" / "Skip to content").
- Only one race is ever exposed: the band's in the full state, the compact
  one in the compact state (the other is `visibility: hidden`).
- Tab from the page into the header: it opens full, the page does not
  scroll (globals.delta.md turns the scroll padding off while focus is in
  the header — today a Tab into the header scrolls the page back up).
- Shift+Tab from the page lands on the last *visible* control (the primary
  on the landing): the band's race is hidden at that instant and is
  skipped once; Tab forward reaches it.
