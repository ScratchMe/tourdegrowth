# globals.css — delta (design system extension 08)

Two rules, both about the page under the header. The board loads them as
`board/globals-compact.css`.

## 1. What sticks under the header follows it

Today `--sticky-offset` is 118px on a page with a band and 74px without
(`html:has(header[data-site-header=band|plain])`), and three things read it:
`scroll-padding-top` (anchors, focus), the engine's « Et si » figures
(`top: calc(var(--sticky-offset) + 16px)`), the game level's phone column
(`+ 22px`).

Add, after today's two rules:

```css
@media (orientation: landscape) {
  html:has(.SiteHeader_header[data-compact=true]) {
    --sticky-offset: var(--sticky-offset-compact, 54px);
  }
}
```

`--sticky-offset-compact` is set on `<html>` by the header's script
(compactHeader.js), from what it measures: **54px** with a band (48 + 4 + 2),
**50px** without (48 + 2). The fallback is the band's 54px.

Each thing that sticks under the header adds one line, so it glides with the
header instead of jumping:

```css
transition: top var(--dur-state) var(--ease-out);
```

— the engine's « Et si » figures and the game level's phone column (the
board's engine page shows the figures doing it). Reduced motion: today's
global guard turns it off with the rest.

`top` is not a transform: it is the one property here that moves layout.
It moves only the sticky element, by the 64px (or 24px) the header gives
back, at the speed of the header; nothing else on the page reflows, and the
header's own box never changes, so the state cannot feed back (mechanic 1).

## 2. The header is never under itself

Today a Tab into the sticky header scrolls the page back up: the focused
control sits inside `scroll-padding-top` (the header's height + 12px), so the
browser "reveals" it by scrolling — from 800px down, three Tabs land at the
top (Chromium; measured on today's header and on this one). Add:

```css
html:has(header[data-site-header]:focus-within) {
  scroll-padding-top: 0;
}
```

The padding is off only while focus is inside the header, which is always
in view; it is back the moment focus moves into the page, so content
focused or jumped to still lands below the header.

## Nothing else

`scroll-padding-top`, the skip link, the reduced-motion guard and today's
two `--sticky-offset` rules stay as they are.
