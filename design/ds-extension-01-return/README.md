# Tour de Growth — Design System

The visual system behind Tour de Growth, an AARRR self-assessment that gives founders a growth score out of 100 in three minutes. The aesthetic is **road marking on warm paper**: stencil display type, hard 2px edges, unblurred offset shadows, one road-paint red.

Everything here is extracted from the shipped iteration 1, the iteration 2 additions (glossary, How it works, Deep dive) and extension 01 (the five pieces built in production from tokens alone, now brought into the system). No token was invented for this document — the values are the ones in the build, plus the ones extension 01 adds and names below.

## The idea in one paragraph

A cycling road marking is painted once, quickly, to be read at speed. That is the whole system: warm paper grounds, black stencil numerals with a faint spray texture, and a single red that means "act here". Nothing is soft, nothing is blurred, nothing gradients into anything else. When a screen needs hierarchy it uses a harder edge or a hard shadow, not a lighter grey.

## Files

```
styles.css              — imports every token file; link this first
tokens/
  fonts.css             — the three families, from Google Fonts
  colors.css            — paper, ink, road-paint red + semantic aliases
  typography.css        — display / UI / mono scales as font shorthands
  spacing.css           — spacing scale, component padding, layout widths
  shape.css             — radii, borders, hard shadows, spray texture
  motion.css            — two keyframes, four durations, reduced-motion reset
components/             — 24 components
  brand/                — Wordmark, ModeTag, MetaLabel, LocaleSwitcher, SiteFooter
  core/                 — Button, Card, Tag, Disclosure, Segmented, TextArea, DetourCard
  glossary/             — DefinitionTrigger, DefinitionPopover
  quiz/                 — QuestionCard, AnswerOption, StageProgress
  result/               — ScoreDisplay, PillarChip, InsightCard,
                          PriorityMove, ToneToggle, Disclaimer, ScoreBreakdown
guidelines/             — visual reference boards + voice.md
```

Each component ships three files: the `.jsx` implementation, a `.d.ts` with documented props, and a `.prompt.md` explaining when to use it and what not to do. Read the `.prompt.md` before using a component — the constraints in there are the system.

## Non-negotiables

**One primary button per screen.** Filled road-paint red is the single "do this" element in a view. A second one halves the value of both.

**One raised card per screen.** The 7px hard shadow marks what the screen is about — the score, or the current question. Elevation is a budget.

**Every border is 2px.** Solid ink means a decided edge; dashed ink-1 means pending or secondary; dashed at 22% is a rule, not an edge. There is no 1px border in this system and no borderless card.

**Solid red is diagnosis, dashed red is advice.** A weak pillar sits on a red wash with a solid red edge. The priority move sits on paper with a dashed red edge. Keep that distinction — it is doing real work on the result screen.

**Mono labels, Inter sentences, stencil numbers.** IBM Plex Mono uppercase for anything scanned, Inter sentence case for anything read, Stardos Stencil 700 for the wordmark, headlines and the score numeral. Never mix those jobs.

**The disclaimer ships with the score.** Any screen showing a number carries the "quick estimate, not an audit" line linking to How it works.

**Deep dive adds insight, not points.** The 10 extra questions produce strengths, weaknesses and a priority move. The score does not move — a link shared before or after the deep dive shows the same number.

## Using it

```html
<link rel="stylesheet" href="path/to/styles.css">
```

Then compose with the components, or with the tokens directly:

```jsx
<Card elevation="raised">
  <ScoreDisplay score={74} label="Overall Growth Score" verdict="Solid engine, one flat tyre." />
</Card>
<PillarChip pillar="Retention" score={8} weak />
<Button variant="primary" size="lg" fullWidth>Share my score</Button>
<Disclaimer align="center">A quick estimate, not an audit — <a href="/how-it-works">see How it works</a>.</Disclaimer>
```

Components read CSS custom properties, so a screen only needs `styles.css` loaded once. They carry no external dependencies beyond React.

## Extension 01 — what changed

Tokens: `--paint-red-action` (primary button fill, AA), `--text-link` now `--paint-red-deep`, `--ink-faint` at .65 with a `--text-faint` alias, `--display-title` (36px stencil, detour cards), `--hit-compact`, `--field-*` and `--pad-field`, `--pad-footer`. No new hex beyond the two named here.

New primitives: `Disclosure` (summary + `+`/`−` chip), `Segmented` (the base `ToneToggle` and `LocaleSwitcher` share), `TextArea` (the system's only input), `DetourCard` (404 and error 06c as one family). Compositions documented in prompts, not shipped as components: the not-found screen (`DetourCard.prompt.md`), the result-page header (`LocaleSwitcher.prompt.md`).

Product decisions taken with extension 01: the result-page header carries no stage label; the free-context screen has two actions (`← Back`, primary), no Skip; the result-not-found 404 uses the eyebrow "Lost result" / "Résultat introuvable".

## Content lives elsewhere

Copy is not part of this system. Verdicts and roast lines come from `content/copy-library.js`, the 15 definitions from `content/glossary.js`, the How it works page body from `content/how-it-works.js`, and the deep questions from `content/deep-mode-questions.js`. Components render those strings verbatim. See `guidelines/voice.md` for how to write a new one.

## Known gaps

The three fonts load from the Google CDN — no binaries were supplied with the brief. Self-host them with real `@font-face` rules before launch if the site must work offline or under a strict CSP.

There is no chart or data-visualisation component. The pillar breakdown is deliberately five chips rather than a radar plot; if a future screen genuinely needs a graph, it needs a design decision first, not a library.
