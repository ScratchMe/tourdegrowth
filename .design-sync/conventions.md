# Tour de Growth — how this design system is meant to be used

A three-minute AARRR growth diagnostic. Bilingual FR/EN, and the language is a
property of the reader, not of the design: every string a component prints
arrives already translated, from the caller.

The look is a cycling race bulletin — stencil numerals, dashed route rules,
paper stock, one brand red. It is deliberately not a SaaS dashboard.

## The rules that are not preferences

**One loud thing per screen.** Exactly one `Card elevation="raised"` (or
`"hero"`, 8px instead of 6, for a card that IS the screen: the landing's preview
of a result) and at most one `ScoreDisplay`. On a result that is the score card;
in the quiz it is the question. A second raised card does not read as "also important", it reads as a
mistake. Everything else is flat or panel: a `Callout` is never raised, and a
dashboard is a row of flat `StatTile`s — a row of equals.

**Red means one of three things, never a fourth.** Solid red fill = the primary
action. Red wash or solid red edge (`Card tone="alert"`, `InsightCard
kind="weakness"`) = a diagnosis about the reader's business. Dashed red on paper
(`tone="outlineAlert"`, `PriorityMove`) = advice; `PriorityMove`, the one next
action, also stands on a hard red shadow (`--shadow-advice`). In a chart, the one
red mark (`--viz-highlight`) is the stage that stalls or the objective aimed at —
a diagnosis, labelled in words. Our own failures get the one card with a SOLID
red edge on a red shadow, `DetourCard tone="fault"` — the dash is what tells
advice from fault — and a 404 is never that: the reader is lost, not broken, and
red would blame them.

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

« Étape » / "stage" names the five AARRR stages and nothing else (Antoine,
2026-09-28). The three spaces are never « étapes »: the space band says
« 1/3 · Plaine », and the profile of the five scores is « Profil du
parcours », never « profil de l'étape ».

Each space wears its colour and its sign, and only where it is the subject:
the Tour in ink (its pictogram red), the engine in ultramarine
(`--space-engine-accent`, its labels and rules, and the `Stopwatch` beside its
intro), the game in ochre on paper and amber at night (`HubMountain` on its
hub's night poster, `ProsePage introWorld="night"`). `SpaceStrip` is the one
place the three stand side by side, on the landing. Ochre is never text on
paper (1.87); the night's amber never leaves the night.

## Responsive

Sizing is CSS-only. `ScoreDisplay`, `PillarChip`, `QuestionCard`,
`AnswerOption`, `StageProgress`, `Bottleneck` and a `hero` `StatTile` shrink
themselves below 760px — you do not detect a viewport in JS. `size="sm"` is
the explicit override for the rare case of forcing the small scale on a wide
screen (the landing's preview card, which is intentionally smaller than the
real result screen).

A component that is set in different frames (a 1 040px board, a 760px column,
a phone) lays out on its own width with a container query, never on the
window's: `SpaceBand`, `SpaceStrip`, `GameEntry`, `RevealCells`,
`PatternCatalogue`. Viewport queries are a short written list, each for a
reason: 760 (the phone line), 640 (the glossary popover docks to the bottom
of the window), 960 (a page breaks out of its reading column) and 1100 (the
engine page's stopwatch).

`GlossaryTerm` opens ONE `DefinitionPopover`, `placement="auto"`: a popover in
the top layer (no z-index) that CSS shapes — anchored under its trigger from
641px where anchor positioning exists, the docked sheet otherwise. The
`anchored` and `docked` placements draw each shape in place, for a story.

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
- A count out of 100 (the funnel's « peloton ») is a `DotGrid`: ten dots to a
  row, a solid dot counted, a hatched one estimated, an outline not counted,
  and « not measured » a whole hatched panel with a « ? » — never 100 empty
  dots, which read as nobody. Its legend is a `DotLegend`, drawn by the same
  rules. `medium="slide"` is the same grid on a 1920px slide.
- The five pillar scores as a shape are `StageProfile` (« Profil du
  parcours » / "Route profile") — one climb per stage,
  as high as the points it is missing, the named stage flagged « HC ». It
  sits over the five `PillarChip`s, which are its table: it is hidden from
  assistive technology and never shown without them.
- On a result, the score is a kilometre marker (`ScoreDisplay
  variant="marker"`) standing beside the stage that stalls: it goes in
  `Bottleneck`'s `lead`, never on its own.
- A result screen shows **exactly two** calls to action, and one primary.
  Sharing lives in `ShareCard`: its button is secondary for a visitor, whose
  primary is their own Tour, and primary on the owner's own result
  (`shareVariant`, C16), where "Take the Tour again" becomes secondary.
  The offer to play the game (`GameEntry`) is not a third: a flat paper card
  with one secondary button per level it offers, each under its stage's name
  when there are several, and a thin band of night across its top.
- The `game` group is presentation only. Every string arrives resolved, and
  every number arrives formatted — a game component never computes a score,
  a date or a sentence. They are drawn inside a `NightSurface` except the
  ones that are paper on purpose (`EventClipping`, `GameEntry`'s body).

## Accessibility, where it is load-bearing

`StageProgress` needs `aria-label`, and a `TextArea` that stands alone under a
`QuestionCard` needs `label`: the visible prompt sits in a sibling component,
so without them the control has no accessible name at all. In a form, every
control gets its **visible** label from a `Field` instead (below), and a
`TextArea` or a `Segmented` inside one takes its name from it. Focus moves deliberately between quiz questions, and the
glossary popover returns focus to the trigger that opened it.

Every interactive target is at least 44×44px. The compact controls draw
smaller than that and extend their hit area on the element itself: a
`Segmented size="sm"` track is 32px, each option reaches 44px into the
room the group keeps above and below it; the 16px `DefinitionTrigger` glyph
takes taps on a 44px disc around it; `Button variant="quiet"` is drawn as a
line of underlined text (31px, 27px at `sm`) and takes taps on a 44px strip
centred on it. Never strip that surrounding room to tighten a header — it is
where the taps land. The system has one text button, `quiet`: an action in
text is that, never a styled `<button>` of its own. A link inside a sentence
is a link, set in the sentence's type.

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
- The two phones (`PhoneMock`, Flixo's streaming app in level 1, and
  `ShopPhone`, Pédalix's bike shop in level 2) are someone else's product:
  white, with their own `--app-*` tokens (the shop adds its green,
  `--shop-brand`), and they do not follow the world around them.
- There is still no user-facing dark mode. The night is a place in the story,
  not a theme preference.

## Motion: one scale, named by use

Every duration is a token of `tokens/motion.css`, never a literal:
`--dur-fast` (hover, press), `--dur-open` and `--dur-close` (arriving,
leaving — leaving is faster), `--dur-state` (a change in place),
`--dur-stamp` with `--ease-stamp` (the stamp overshoots once; only an
entrance may overshoot), `--dur-shake`, `--dur-pulse`, `--dur-reveal`,
`--dur-draw`, and three loops for waiting (`--dur-wait`, `--dur-breathe`,
`--dur-dots`). An arrival rises by `--dist-step` (8px). The shared keyframes
(the score's `stamp`, the verdict's `slam`, the progress `pulse`) reach a
component through `composes` from `styles/motion.module.css`. Reduced motion
switches all of it off; every element rests in its final state, so nothing
is lost.

Hover at night cannot live in the shadow (black on black): a control's edge
lightens instead, through `--state-hover-border`, which on paper is simply
the edge it already has.

## One selection language, and honest button states

Selected is the inverse fill with its own text (`--state-selected-*`): an
answer, a segment, a ticked game card all look selected the same way — ink on
paper, amber at night. **Hover never touches the fill**: it only lifts the
hard shadow, and it is off on touch screens, where a stuck hover would pass for
a choice.

`Button`: hover peels it up over a hard ink shadow, press flattens it back
onto the page, disabled fades and never lifts. `quiet` has no box to lift:
muted at rest, it turns body ink with a 2px underline on hover, and the
underline draws in against the letters on press. `loading` sets `aria-busy` and
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
target in October", not "Monthly churn"). `StatTile`, `Sparkline`,
`BulletChart` and `DotGrid` are drawn by hand, in ink with one red highlight;
there is no chart library, and no categorical or sequential palette: a series
is named, a count is a shape (the DS v3 scales went unused and were removed on
2026-09-29).

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
- The five AARRR pillars are ordered stages: they are named, not coloured.
  There is no categorical or sequential palette: a series is told apart by a
  dash pattern and a direct label, a count by a shape.

## Forms: one set of primitives (extension 04)

Every control in a form gets its **visible** label from a `Field` — an
accessible name alone is anonymous to half the people using it. `TextField`,
`NumberField`, `Select`, `DateField` and `Choices` render their own; wrap a
`TextArea`, a `Segmented` (`labelledBy`) or a list of `Checkbox`es in one.
The label is a sentence in Inter, never the mono meta-label; an optional
field says so with Field's `optional` word ("optional" / « facultatif »),
drawn quieter after the label and never written inside it; a required one
carries no mark. The one exception is a one-question screen whose question
is the label: the quiz's free context writes « (optionnel) » in the question
itself (`TextArea`, `Empty`).

- **Native underneath, always**: `<input>`, `<select>`, radios, checkboxes.
  No custom dropdown or listbox; the select keeps the platform's chevron,
  the one glyph the system does not draw.
- **Two messages, never colour alone**: `error` (cannot be saved as it is: a
  3px red edge, a 600 message behind a red rule) and `missing` (still to fill
  in, saves anyway: dashed, « not yet », in body ink — not red). Show a parse
  error on blur and a missing field on save, never on each keystroke. What
  stands between the person and saving is a `FormSummary` just above the
  button, one link per field.
- **Nothing typed is thrown away**: soft limits never block, « 12o » stays on
  screen, an empty number is `null` and never 0, and nothing is pre-selected
  for the person.
- **Two densities on one axis**: `size="md"` for a one-question screen (48px
  controls), `sm` for a sheet of fields (44px). Never both in one form.
- **Numbers look like numbers**: tabular Inter, a box as wide as the
  magnitude (`fit="content"`, `digits`), the unit inside it where the caller's
  locale puts it (€26,000 / 26 000 €). The `prefix`/`suffix` string carries
  the space its language writes — none in "€500" or "140%", a no-break space
  in « 500 € », « 20 % », « 3 jours » — and the box adds none. A count out of
  a count is a `FieldRow`; its joiner sits against the first box.
- **One focus ring and one selection language**: `--field-focus-ring` is the
  system's ink ring on every control (the red `--focus-ring-invert` is for
  ink- or red-filled surfaces only); a chosen option is the inverse fill.
  Disabled is dashed in muted ink that passes, never faded by opacity.

## What is not in here

No icon set, no user-facing dark mode, no chart library, no blurred shadows
(the night changes the shadow's colour, never its hardness; the game's call
rings and angers in a hard ring, not a glow). Lines have four weights, each
a token: `--border-width` (2px, every edge), `--border-width-stamp` (3px, an
inked mark over an edge: a rubber stamp, an accent band, the angry edge),
`--border-width-hairline` (1px, under the content: a chart's grid, a table's
rows) and `--border-width-fine` (1.5px, the space band's strokes only). Type
never goes under 11px, and Inter text never under 13.5px, with two named
exceptions: the small (`sm`) button's label and the result's « built by » credit. If a design
needs one of those, that is a product decision to raise, not a component to
invent.

One modal, and only one: `QuarterNews`, the game's end-of-quarter news
(Antoine's decision, 2026-09-26). Full screen, a native `<dialog>` opened
with `showModal()`, Escape means « skip to the report », and the report stays
underneath for re-reading. A second modal is the same product decision as
any item of the list above.

## Variant names: one word per axis

A prop that picks a variant says which axis it moves, and each axis has one
vocabulary (design audit S-16, 2026-09-29). Four vocabularies had grown for
the same thing — `desktop`/`mobile`, `sm`/`md`/`lg`, `md`/`compact`, and
proper names — and `alert` and `red` named the same role.

| Axis | Prop | Words | What it means |
|---|---|---|---|
| Scale | `size` | `xs` · `sm` · `md` · `lg`, and `auto` | How big it is drawn, and nothing else. `md` is the default wherever it exists, and the one that shrinks on a phone by itself; `sm` is small at every width; `auto` picks one per width where no size shrinks by itself. Never a device, never an adjective |
| What it is drawn for | its own prop, never `size` | the medium's words | A variant that changes more than the scale: `DotGrid`'s slide grid has the thicker stroke of a projected slide, so it is `medium="slide"`, not a size |
| Role colour | `tone` | `muted` · `ink` · `alert` · `good` · `bad` · `neutral`, and a surface's own (`paper`, `sunken`, `outlineAlert`; `caveat`, `cta`) | `alert` is the red of a diagnosis, everywhere. There is no `red` |
| Hierarchy | `variant` | `primary` · `secondary` · `quiet` | How loud an action is, beside the others |
| Column | `width` | `narrow` · `reading` · `wide` | The page column a frame sits in |
| Field width | `fit` | `fill` · `content` | How wide a form field sits in its column: all of it, or as wide as what it holds (a number, a currency). Not `width`, which names the page column |

Retired names, and where each went, one family at a time
(`variant-names.test.ts` holds the list of what is still to move):

| Was | Now | Family |
|---|---|---|
| `size="desktop"` / `"mobile"` | `size="md"` / `"sm"` | quiz and result: `AnswerOption`, `QuestionCard`, `StageProgress`, `Bottleneck`, `PillarChip`, `ScoreDisplay`, `ShareCard` — done |
| `size="compact"`, `Button compact` | `size="sm"` | core: `Segmented`, `ToneToggle`, `Button` — done |
| `tone="red"` | `tone="alert"` | core: `Tag` — done |
| `size="hero"` / `"compact"` / `"responsive"`, `size="mini"` | `size="lg"` / `"sm"` / `"auto"`, `size="sm"` | viz: `StatTile`, `BulletChart` — done |
| `size="screen"` / `"slide"` | `medium="screen"` / `"slide"` | viz: `DotGrid`, `DotLegend` — done |
| `size="frame"` / `"avatar"`, `size="compact"` | `framing="call"` / `"avatar"`, `size="sm"` | game: `DgFace` (what is in the picture, not a scale), `ClickPill` — done |

## Contracts: two things to know when reading a `.d.ts`

- The contracts are generated in non-strict mode, so a prop that accepts
  `null` can print as the bare type (`refId?: string`, `voice: VoiceSettings`).
  The prop's doc comment says when `null` means something.
- Named object types (`DataTableColumn`, `HandCard`, `ReportFigure`, …) print
  as their name. The previews show every one of them with its real shape — copy
  from those. The few whose contract would otherwise be wrong (`StatTile`,
  `Sparkline`, `EventClipping`, `PhoneMock`, `ShopPhone`, `NotFoundScreen`)
  are written out in full.
