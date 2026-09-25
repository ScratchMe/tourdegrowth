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
mistake. Everything else is flat or panel: a `Callout` is never raised, and a
dashboard is a row of flat `StatTile`s — a row of equals.

**Red means one of three things, never a fourth.** Solid red fill = the primary
action. Red wash or solid red edge (`Card tone="alert"`, `InsightCard
kind="weakness"`) = a diagnosis about the reader's business. Dashed red on paper
(`tone="outlineAlert"`, `PriorityMove`) = advice. In a chart, the one red mark
(`--viz-highlight`) is the stage that stalls or the objective aimed at — a
diagnosis, labelled in words. Our own failures get the one
red-shadowed card in the system, `DetourCard tone="fault"` — and a 404 is never
that: the reader is lost, not broken, and red would blame them.

**Scoring is invisible during the questionnaire.** Never label an `AnswerOption`
with its point value; showing the arithmetic changes the answers. The score
breakdown after the fact is the one place points are printed, because explaining
the arithmetic is that screen's entire purpose.

**Never claim more than the numbers support.** It is the rule behind the data
components too (see "Data" below). `Bottleneck` takes a required
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
`AnswerOption`, `StageProgress`, `Bottleneck` and a `hero` `StatTile` shrink
themselves below 760px — you do not detect a viewport in JS. `size="mobile"` is
the explicit override for the rare case of forcing the small scale on a wide
screen (the landing's preview card, which is intentionally smaller than the
real result screen).

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
- A prose page is `ProsePage` plus `ProseSection`/`ProseText`/`ProseList`/
  `ProseActions`; its aside is `Callout`.
- A figure is `StatTile`; a series over time is `Sparkline`; a value against a
  target is `BulletChart`; any chart sits in a `ChartFrame`, whose data opens
  as a `DataTable`. Five tiles and a chart are still flat, on one surface.
- A result screen shows **exactly two** calls to action. Sharing lives in
  `ShareCard`, whose button is never primary — the image sells the share.

## Accessibility, where it is load-bearing

`TextArea` requires `label` and `StageProgress` needs `aria-label`: in both the
visible prompt sits in a sibling component, so without them the control has no
accessible name at all. Focus moves deliberately between quiz questions, and the
glossary popover returns focus to the trigger that opened it.

Every interactive target is at least 44×44px. The compact controls draw
smaller than that and extend their hit area on the element itself: a
`Segmented size="compact"` track is 32px, each option reaches 44px into the
room the group keeps above and below it; the 16px `DefinitionTrigger` glyph
takes taps on a 44px disc around it. Never strip that surrounding room to
tighten a header — it is where the taps land.

## Tokens: three layers, and worlds rebind only the middle one

1. **Primitives** (`--paper-*`, `--ink-*`, `--paint-red*`, `--night-*`) —
   raw values on `:root`. Components never read them; CI fails a component
   stylesheet that does.
2. **Semantic** (`--surface-*`, `--text-*`, `--border-*`, `--action-*`,
   `--focus-ring`, `--viz-*`) — what components read. This is the layer a
   world rebinds.
3. **Derived** (`--state-selected-*`, `--field-bg`, `--shadow-card`, …) —
   built from semantic tokens and redeclared on every world container, so they
   re-resolve inside a world on their own.

A new colour is a semantic token with its contrast measured on the ground it
lands on — never a hex in a component.

## Two worlds: paper and night

Paper is the default and the whole Tour. **Night** is the game's world
(dashboard, video call, the hand of cards): ink asphalt with amber for the
selection, derived from the brand's ink so the brand is still recognisable.

A world is an attribute on a container, never a component variant:
`NightSurface` is `<section data-world="night">` painting its own ground and
text colour, and nothing else. Inside it, every `Card`, `Tag`, `Button`,
`StatTile` reads the same semantic tokens, which now resolve to night values
— there is no "dark Button" to reach for, and a component that needs one is
reading a primitive. Paper can come back inside the night
(`data-world="paper"`): the press clippings of the game are paper on purpose,
because the outside world shows the cost the dashboard hides; December is the
return to paper.

Rules the night world adds:

- `--paint-red` is never text at night (3.76:1). Red text is the night's
  `--text-alert`; the primary button keeps its red fill because its label sits
  on its own fill.
- The phone mock (`PhoneMock`) is someone else's product: white, with its own
  `--app-*` tokens, and it does not follow the world around it.
- There is still no user-facing dark mode. The night is a place in the story,
  not a theme preference.

## One selection language, and honest button states

Selected is the inverse fill with its own text (`--state-selected-*`): an
answer, a segment, a ticked game card all look selected the same way — ink on
paper, amber at night. **Hover never touches the fill**: it only lifts the
hard shadow, and it is off on touch screens, where a stuck hover would pass for
a choice.

`Button`: hover peels it up over a hard ink shadow, press flattens it back
onto the page, disabled fades and never lifts. `loading` sets `aria-busy` and
`disabled` together — it cannot be sent twice — and adds an ellipsis to the
label; there is no spinner, because there are no icons. A link is never
"loading".

## Prose pages

`ProsePage` is the frame of every content page (How it works, About, glossary,
comparisons, legal): the reading column, running text at 400 weight in full ink
within a reading measure. `ProseSection`, `ProseText`, `ProseList`,
`ProseActions` go inside it. Grey is for the lead and captions only.

The aside of a prose page is `Callout`, and `tone` is required: `caveat`
(dashed ink — what to know before trusting the page) or `cta` (a plain panel
leading into its one button). **Neither is red**: a caveat is not a diagnosis
of the reader's business, and a red frame around a red button is two loud
things.

## Data

`DataTable` is the ruled table (one solid rule under the header, dashed rows,
tabular mono figures, opt-in sorting announced with `aria-sort`), and it is
also the text equivalent of every chart. `ChartFrame` puts it behind "See the
data" under the chart, with a title that states the insight ("Churn fell under
target in October", not "Monthly churn"). `StatTile`, `Sparkline` and
`BulletChart` are drawn by hand, in ink with one red highlight; there is no
chart library.

The honesty rules are the same as `Bottleneck`'s — never draw more than the
numbers support:

- **Unknown is not zero.** A value not measured is `null`: a tile shows a long
  dash and a "not measured" word, a meter is hatched, a sparkline leaves a gap.
  Drawing `0` would be a measurement.
- **Hidden means absent.** A hidden `StatTile` takes no value at all — the
  number is not in the DOM, not in an attribute. A blurred decoy of shapes
  stands in, with a sharp label saying why.
- **Change is a word, not only a colour.** A delta carries its sign and a word
  ("−0.4 pt · better"); colour is direction × sentiment and only repeats it.
- **The scale is the caller's, never fitted to the data**, so a small change
  cannot look like a cliff. A value past it sits on the edge and says so
  (a hollow end marker, a pointed bar end).
- **A reference line is labelled.** The dashed red objective always carries
  its words; red alone never speaks.
- The five AARRR pillars are ordered stages: they are named, not coloured. The
  categorical `--viz-cat-*` palette is for nominal series only, and every
  series also gets a dash pattern and a direct label.

## What is not in here

No icon set, no modals, no user-facing dark mode, no chart library, no
blurred shadows (the night changes the shadow's colour, never its hardness).
If a design needs one of those, that is a product decision to raise, not a
component to invent.

## Contracts: two things to know when reading a `.d.ts`

- The contracts are generated in non-strict mode, so a prop that accepts
  `null` can print as the bare type (`refId?: string`, `voice: VoiceSettings`).
  The prop's doc comment says when `null` means something.
- Named object types (`DataTableColumn`, `HandCard`, `ReportFigure`, …) print
  as their name. The previews show every one of them with its real shape — copy
  from those. The few whose contract would otherwise be wrong (`StatTile`,
  `Sparkline`, `EventClipping`, `PhoneMock`, `NotFoundScreen`) are written out
  in full.
