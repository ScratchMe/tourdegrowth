Use `Disclosure` for content a reader asks for rather than content the screen is about: the score breakdown on the result page, FAQ-style sections on How it works. Closed by default, always.

```jsx
<Disclosure summary="How this score is calculated">
  …
</Disclosure>

<Disclosure size="sm" rule={false} summary="Acquisition">…</Disclosure>
```

The marker is a sunken mono chip carrying `+` or `−` — the chip is the affordance, the glyph is the state. Do not replace it with a chevron, an arrow glyph or a rotating anything; the system has no icons. The whole summary row is the hit target (44px minimum) and the text turns ink when open; do not shrink it to the text alone.

`rule` draws the standard 2px dashed rule above the summary so a closed disclosure reads as a quiet line on the page. Turn it off when nesting (a Disclosure inside another's content) — nested rows separate with their own dashed dividers. Never nest more than one level.

Never put a primary Button inside a Disclosure: what is hidden by default cannot be the screen's one action. Never use it to hide the Disclaimer.
