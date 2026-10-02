# The compact header — motion spec (extension 08)

Two states, not a scrub: the header is either full or compact, and moves
between them with CSS transitions. Everything below is in
`components/brand/SiteHeader/SiteHeader.css` (and `SpaceBand.css` for the
race's own look), under `@media (orientation: landscape)` and
`[data-compact-ready]`.

**Tokens only, none new.** `--dur-state` 250ms, `--dur-open` 250ms,
`--dur-close` 150ms, `--dur-fast` 120ms, `--ease-out`, `--dist-step` 8px
(as `--header-step`). No overshoot: `--ease-stamp` is for entrances that
should be noticed, and this happens on every scroll.

**Transform and opacity only** on the header's parts (plus `visibility`,
flipped at the start or end, never animated). The header's box never
changes. The one `top` transition is on what sticks *under* the header
(globals.delta.md).

## Triggers

| state | when |
|---|---|
| → compact | the window has scrolled (`scrollY > 0`, read in a passive listener, applied on the next frame), in a landscape window, and keyboard focus is not in the header |
| → full | back at the very top (`scrollY = 0`), or keyboard focus enters the header (`focusin` with `:focus-visible`) |
| no motion | the first state of a page (load, reload, back, anchor): transitions switch on only after two frames (`data-compact-ready`) |

## Compacting (full → compact) — 370ms in all

| t (ms) | element | property | from → to | duration · easing · delay |
|---|---|---|---|---|
| 0–150 | controls marked `leave` (landing's two links) | opacity · transform | 1 → 0 · `translateY(0)` → `translateY(-8px)` | `--dur-close` · `--ease-out` · 0 — then `visibility: hidden` at 150 |
| 0–250 | `.SiteHeader_glass` (the frosted paper) | transform | `scaleY(1)` → `scaleY(48 / row)` from the top: 72 → 48px (68 → 48 under 760px; the quiz's 47 → 48) | `--dur-state` · `--ease-out` · 0 |
| 0–250 | `.SiteHeader_row` (wordmark + controls) | transform | `translateY(0)` → `translateY((48 − row) / 2)`: −12px (−10px; quiz +0.5px) | `--dur-state` · `--ease-out` · 0 |
| 0–250 | `.SiteHeader_band` | transform | `translateY(0)` → `translateY(54 − full)`: −64px (−60px; quiz −39px) — it folds up *under* the glass, hanging from the edge | `--dur-state` · `--ease-out` · 0 — then `visibility: hidden` at 250 |
| 0–250 | `.SiteHeader_edge` (band: 4px of the space's colour + 2px ink; plain: the dashed rule) | transform | `translateY(0)` → same as the band (plain: 50 − 72 = −22px) | `--dur-state` · `--ease-out` · 0 |
| 0 | plain header only: today's stuck rule → the edge | opacity | rule 1 → 0, edge 0 → 1, in the same place | instant |
| 120–370 | `.SpaceBand_raceCompact` (the race in the line) | opacity · transform | 0 → 1 · `translateY(-50% + 8px)` → `translateY(-50%)` | `--dur-open` · `--ease-out` · `--dur-fast` — `visibility: visible` at 120 |
| 120–370 | kept controls before leaving ones (landing's language switch) | transform | `translateX(0)` → `translateX(room)`: +248px FR, +188px EN | `--dur-state` · `--ease-out` · `--dur-fast` |
| 0–250 | anything sticky under the header (engine's « Et si » figures) | top | `--sticky-offset` + 16: 134 → 70px | `--dur-state` · `--ease-out` · 0 |

What leaves goes first and faster; what changes in place (glass, row,
band, edge) moves together; what arrives (the race) and what closes up wait
`--dur-fast`, so nothing crosses a control that is still fading.

## Expanding (compact → full) — 370ms in all

| t (ms) | element | property | from → to | duration · easing · delay |
|---|---|---|---|---|
| 0–150 | `.SpaceBand_raceCompact` | opacity · transform | 1 → 0 · `translateY(-50%)` → `translateY(-50% + 8px)` | `--dur-close` · `--ease-out` · 0 — `visibility: hidden` at 150 |
| 0–250 | glass, row, band, edge | transform | the reverse of the above | `--dur-state` · `--ease-out` · 0 — the band is `visible` from 0 |
| 0–250 | kept controls that closed up | transform | `translateX(room)` → `translateX(0)` | `--dur-state` · `--ease-out` · 0 (the room opens before the links come into it) |
| 120–370 | controls marked `leave` | opacity · transform | 0 → 1 · `translateY(-8px)` → `translateY(0)` | `--dur-open` · `--ease-out` · `--dur-fast` — `visibility: visible` at 120 |
| 250 | plain header only: the edge → today's rule | opacity | edge 1 → 0, rule 0 → 1 (where stuck) | instant, at 250 |
| 0–250 | sticky under the header | top | 70 → 134px | `--dur-state` · `--ease-out` · 0 |

Because the band hangs from the edge and slides under the glass, what shows
of it at any instant is exactly the room between the line and the edge:
there is never a gap where the page shows through, and the band never
crosses the wordmark.

## Interruptions

A scroll back to the top halfway through compacting reverses from where
each property is (CSS transitions reverse from their current value). The
state is a boolean set at most once per frame, so a jittery trackpad near
the top cannot queue motions. The header's box never changes height, so
the scroll position cannot be moved by the motion and re-trigger it.

## Reduced motion

`prefers-reduced-motion: reduce` → today's global guard
(`* { transition: none !important }`). The header still compacts and
expands — it is a layout state, not a decoration — but instantly, and the
sticky figures jump with it. Nothing else to add. The board's
`?motion=reduce` replays the guard; the real media query works too.

## Without the script, before hydration, upright phones

No `data-compact-ready`, no `data-compact="true"`, or no landscape: none of
the rules above apply, and the header is today's. A page restored halfway
down shows today's header until hydration, then the compact line at once
(no transition: the content does not move, only the header's paint).
