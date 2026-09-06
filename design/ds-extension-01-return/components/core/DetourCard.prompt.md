Use `DetourCard` for every screen where the road stops: the two 404s and the result-failed state (06c). They are one family — mono eyebrow, stencil title, one calm sentence, one primary Button *below* the card — in two temperatures.

```jsx
// 404 — the reader took a wrong turn. Ink.
<DetourCard eyebrow="Detour" title="This page doesn't exist.">
  The address may be mistyped, or the page may have moved. Everything else is still where you left it.
</DetourCard>
<Button variant="primary">Back to Tour de Growth →</Button>

// Shared result that names nothing. Still ink — nothing broke.
<DetourCard eyebrow="Lost result" title="No result at this address.">…</DetourCard>

// Something broke on our side. Red.
<DetourCard tone="fault" eyebrow="Detour" title="Your results took a wrong turn.">
  Something broke on our end — try again in a moment.
</DetourCard>
```

`fault` is the only card in the system with a red shadow; it is reserved for our failures. A 404 is never `fault` — the reader is lost, not broken, and red would blame them.

**Not-found screen — a composition, not a component.** `Wordmark` (linked home) → `DetourCard` → primary `Button` to the landing, left-aligned in the `--width-desktop` container with 80px vertical padding and `--space-8` gaps; then `SiteFooter width="wide"`. The two 404s share this screen and differ only in strings: unknown address uses eyebrow "Detour" / "Détour"; unknown result id uses "Lost result" / "Résultat introuvable" with the `result.notFound*` strings. The footer stays: a dead link is a real entry point.

The DetourCard is the screen's one raised element; nothing else on a detour screen carries a shadow. Copy is one sentence with its full stop in the title, one or two in the body, never an apology paragraph and never a joke in the `fault` tone.
