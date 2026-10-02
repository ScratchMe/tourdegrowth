EngineLanding — design system extension 07. The top of the engine's page, for a first visit and for a return, from one HTML.

The page is the search landing and the tool at one URL, prerendered, the same
HTML for everyone. Whether this device holds an engine was known only after
hydration, so a returning person got the first visit's 1,267px of
introduction (1,849px on a phone). EngineLanding answers brief 07's Q1.

## The flag, before the first paint

Put `engineKnownScript(ENGINE_STORAGE_KEY)` in `<head>`, inline, before the
stylesheets paint anything. It asks only whether the key **exists** — no
value read, nothing parsed, nothing sent, nothing in a URL (constraint 10) —
and sets `data-engine="known"` on `<html>`. Everything else is CSS on
`[data-engine=known]`, so the first frame a returning person sees is already
the short one: **nothing jumps under their eyes**.

- A search engine has no storage: it always reads the first visit's page —
  H1, promise, positioning — in the server HTML (constraint 12).
- If storage throws (private mode, blocked), the script does nothing: the
  person gets the first visit's page, which is right, since the engine
  cannot be read either.
- If the key exists but the engine turns out unreadable, the app shows the
  board's "refused" state (NextStep) — never the first visit again.

## What each visit shows

| | First visit | Returning (`data-engine=known`) |
|---|---|---|
| Eyebrow, H1 | yes, H1 at `--display-hero` | yes, H1 at `--engine-landing-title` |
| Lede, positioning | yes | hidden (still in the HTML) |
| The promise | the raised card | **one line**, same words, never folded |
| Call to action | "Enter your numbers →", **secondary** (an anchor) | hidden: NextStep holds the primary |
| Stopwatch (aside) | desktop | hidden |
| The tool's reserve | — | dashed box, `--engine-reserve` tall, until the board renders |

## Rules

- **One primary on the page**: the start card's "Start with your first
  number →". The hero's "Enter your numbers →" only scrolls to the tool,
  and at 1280 the start card is 640px under it — both would share a screen
  if both were red. So the hero's is secondary (ink outline).
- **The promise comes before the call to action and never folds**
  (constraint 11): first visit, the card; return, the line. Never put either
  in a Disclosure.
- The reserve is dashed because it is "not yet" (constraint 7). The app
  removes it as soon as the board renders; its height keeps what follows
  from jumping above the fold.
- "How long it takes" (two counts and four cases) moves **under the tool**,
  with the catalogue and the FAQ: EngineStart says the same counts in one
  line. Its HTML stays.
- The page's own sections under the tool (catalogue, FAQ, the Tour callout)
  are unchanged and stay in the server HTML.
