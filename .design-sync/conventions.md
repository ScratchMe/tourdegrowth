# Tour de Growth — how this design system is meant to be used

A three-minute AARRR growth diagnostic. Bilingual FR/EN, and the language is a
property of the reader, not of the design: every string a component prints
arrives already translated, from the caller.

The look is a cycling race bulletin — stencil numerals, dashed route rules,
paper stock, one brand red. It is deliberately not a SaaS dashboard.

## The rules that are not preferences

**One loud thing per screen.** Exactly one `Card elevation="raised"` and at most
one `ScoreDisplay`. On a result that is the score card; in the quiz it is the
question. A second raised card does not read as "also important", it reads as a
mistake.

**Red means one of three things, never a fourth.** Solid red fill = the primary
action. Red wash or solid red edge (`Card tone="alert"`, `InsightCard
kind="weakness"`) = a diagnosis about the reader's business. Dashed red on paper
(`tone="outlineAlert"`, `PriorityMove`) = advice. Our own failures get the one
red-shadowed card in the system, `DetourCard tone="fault"` — and a 404 is never
that: the reader is lost, not broken, and red would blame them.

**Scoring is invisible during the questionnaire.** Never label an `AnswerOption`
with its point value; showing the arithmetic changes the answers. The score
breakdown after the fact is the one place points are printed, because explaining
the arithmetic is that screen's entire purpose.

**Never claim more than the numbers support.** `Bottleneck` takes a required
`sharpness` for exactly this reason: `clear` names one stage, `shared` names the
whole tied group, `level` names none. A stage name set in 36px stencil is a
claim, and the prop is what keeps it honest. There is no default — defaulting to
the loudest state is the failure the prop exists to prevent.

**One emoji in the entire brand: the 🔥 on "Roast me".** Do not introduce a
second. There are no icon files either — a disclosure marker is a typographic
`+` / `−`, not a chevron.

**Contrast is checked in CI with no exceptions left.** Every pair meets WCAG AA
today. A quieter shade means a new token that passes, not an exception —
`--paint-red` is the display/accent red and fails for body text, which is why
`--paint-red-action` (buttons) and `--paint-red-deep` (red text on paper) exist
as separate tokens.

**Pillar names stay in English on French screens.** Acquisition, Activation,
Retention, Referral, Revenue — that keeps the AARRR acronym legible, and the
product's own French prose uses them that way.

## Language

Components take resolved strings, not locale keys — `shareLabel="Share this
result"`, not `shareLabel={t.share}`. The few that take a `locale` do so because
they render whole screens (`NotFoundScreen`, `ErrorScreen`, `SiteFooter`,
`ContentHeader`, `LoadingScreen`) or resolve content by id (`GlossaryTerm`).

French runs roughly 15–20% longer than English. Anything with a fixed width
should be checked in French before it is called done.

## Responsive

Sizing is CSS-only. `ScoreDisplay`, `PillarChip`, `QuestionCard`,
`AnswerOption`, `StageProgress` and `Bottleneck` shrink themselves below 760px —
you do not detect a viewport in JS. `size="mobile"` is the explicit override for
the rare case of forcing the small scale on a wide screen (the landing's preview
card, which is intentionally smaller than the real result screen).

`DefinitionPopover` renders both placements at once and lets CSS choose. Anything
that moves focus has to be guarded to the placement actually on screen.

Target 390px. Nothing may scroll horizontally at 360px.

## Composition

- `Segmented` is the one segmented control. `ToneToggle` and `LocaleSwitcher` are
  two skins of it — use those where they apply.
- `Card` is the one surface. Anything panel-shaped is `Card` with different
  props, not a new component.
- `DetourCard` is the one dead-end. 404s and error screens are the same family
  at two temperatures.
- Pillar-and-sentence is `InsightCard`. Pillar-and-score is `PillarChip`.
- A result screen shows **exactly two** calls to action. Sharing lives in
  `ShareCard`, whose button is never primary — the image sells the share.

## Accessibility, where it is load-bearing

`TextArea` requires `label` and `StageProgress` needs `aria-label`: in both the
visible prompt sits in a sibling component, so without them the control has no
accessible name at all. Focus moves deliberately between quiz questions, and the
glossary popover returns focus to the trigger that opened it.

## What is not in here

No dark mode, no theming, no icon set, no data-visualisation, no modals. If a
design needs one of those, that is a product decision to raise, not a component
to invent.
