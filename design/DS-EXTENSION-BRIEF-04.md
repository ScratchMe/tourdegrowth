# Design system extension brief 04 — the form primitives

*Tour de Growth · from the codebase to Claude Design · 2026-09-29*

## Why this brief

The system you synced has exactly one place a person types: `core/TextArea`,
from extension 01, whose own doc says it "also defines what any future input
looks like here". Next to it, `core/Segmented` answers two or three options
and says of itself "never for on/off (that is a checkbox, which this system
does not have)".

Since then, two features that are nothing but forms have shipped, and each
built its own inputs from the tokens, **locally and on purpose**:

- **the growth engine** (`/aarrr-funnel-template`, a public page in both
  languages, still closed behind its flag): seventeen numbers to collect, each with a status,
  a count, a source and a note. Its spec recorded the choice as decision D17:
  "the design system has no `<input>` besides `TextArea`; a Claude Design
  brief would delay us by days". Promotion to the system was deferred to
  "v1.1, if the engine finds its public".
- **the audit instrument** (`/admin/audit`, one user, French only): the tool
  Antoine uses to run a growth diagnostic inside a company. Same reasoning,
  plus "a tool for one user is not a product surface" (AUDIT-PLAN §3.3,
  decision 1).

Both decisions were right when they were taken. They have now produced
**three** style sheets for the same field, which have started to disagree
(below), and the design-kit audit of September recorded it as finding S-15.
Antoine has decided to bring them into the system. This brief asks you to
design the primitives once, in `core/`, so both features — and whatever form
comes next — port onto them.

Screenshots in `design/ds-extension-04/`, all 2×, from a real production
build (2026-09-29), the engine opened through the owner preview:

- `engine-setup-en-desktop.png`, `engine-setup-fr-mobile.png` — the engine's
  first screen: `Choices` with three disabled options, two month lists, a
  `Select`, two `SegmentedField`, a `TextField` with its counter;
- `engine-sheet-empty-en-desktop.png`, `engine-sheet-empty-fr-mobile.png` —
  one metric's sheet before anything is chosen (the 2×2 status question);
- `engine-sheet-filled-invalid-en-desktop.png`,
  `engine-sheet-filled-invalid-fr-mobile.png` — the same sheet filled: a
  count grouped as typed ("26,000" / "26 000", its field focused), a second
  count that cannot be read ("12o", red edge and message), a source chosen;
- `audit-new-mission-fr-desktop.png` — the audit's mission form, "Entreprise"
  focused (note the red ring);
- `audit-row-editor-fr-desktop.png`, `audit-row-editor-fr-mobile.png` — the
  audit's row editor with a status chosen and its missing fields reported.

The engine copy on them is **under review** (it is on a proofing sheet with
Antoine right now): design against its length, not its words.

## Where they live today

| Role | Engine — `_engine/_ui/` | Audit — `admin/audit/_ui/` | Used |
|---|---|---|---|
| Label + hint + error around a control | `Field` (label, hint, error) | `Field` (label, hint — no error) | 40 × engine, 83 × audit |
| One line of text | `TextField` (soft limit + counter) | `TextInput` | 5 × / 25 × |
| A number | `NumberField` (text input, groups as you type, unit outside, parse error) | `NumberInput` (`type="number"`) | 15 × / 8 × |
| A closed list past three values | `Select` (placeholder, option groups) | `Select` (flat) | 7 × / 17 × |
| A month / a date | `MonthField` (a `Select` of the last 18 months) | `DateInput` (native date) | 2 × / 8 × |
| Pick one of a handful, as cards | `Choices` (radios in a fieldset, 1 or 2 columns, disabled with a note) | — | 9 × |
| Yes / no with its sentence | `CheckField` | a bare checkbox, twice | 1 × / 2 × |
| `Segmented` with a visible label | `SegmentedField` | — | 4 × |

A **third** copy lives in the engine's slide builder. Its "what you're asking
for" form (`deck/AskForm.tsx`) declares its own `Field` and its own `.control`
in `deck/deck.module.css`, and writes its `<input>`, `<select>` and
checkboxes by hand; the deck screen next to it adds five more hand-written
checkboxes.

Out of scope, but tell us if you disagree: the engine's what-if **slider**
(a native range, tinted `--viz-ink`, 44px tall) and the two **file** buttons
(import a saved engine, import an audit mission). We will port them onto
whatever you define for the rest.

## Where the copies already disagree

This is why it cannot wait for "v1.1". Each line below is the same field,
styled three times, differently:

| | Engine `_ui` | Audit `_ui` | Slide builder (`deck/`) |
|---|---|---|---|
| Focus ring | `--focus-ring` (ink) | `--focus-ring-invert` (red) | `--focus-ring-invert` (red) |
| Background | `--field-bg` | `--surface-card` | `--field-bg` |
| Height | `--hit-min` | `44px`, literal | `--hit-min` |
| Label tracking | `--meta-tracking` | `0.08em`, literal | `0.08em`, literal |
| Invalid state | red edge + message, announced with the control | none | none |
| A missing field | the error line under that field, `--meta-xs` | a paragraph in red body text above the group, naming every missing field | — |
| Numbers | "26 000" is read, and grouped as it is typed | `type="number"`: most browsers reject "26 000" and the field reads as empty | — |
| Currency | a `Select` (EUR, USD, GBP, CHF) | a free text field | — |

`TextArea`, the one system input, sits next to these fields (24 × in the
audit, 2 × in the engine). Its own `label` is an accessible name only, so both
features wrap it in their local `Field` to show one — the system's own input
cannot be used as the system intends without a primitive the system does not
have.

---

## 1. Field — the label, the hint, the error

**Where**: around every control in both features. The one rule both learned,
three times over in the audit: *a control without a visible label is
anonymous to half the people using it.*

**Current build** (engine): a column, `--space-2` gap; label in `--meta-xs`,
uppercase, `--meta-tracking`, `--text-muted`; hint under the control in
`--meta-xs --text-faint`; error under it in `--meta-xs --text-alert`, with
`role="alert"`; the control's `aria-describedby` points at hint and error so
they are read with it.

**What feels right**: it reads like the rest of the system's labels (the
meta-label family), and it is quiet.

**What feels off**: an uppercase mono label over every field makes a long form
read as a column of shouting captions. The hint and the error are the same
size and weight, told apart by colour alone. Nothing marks a field as
optional or required — the engine writes "(optional)" into the label text.

**Questions**
1. Label: keep the meta-label (mono, uppercase), or does a form deserve a
   sentence-case UI label (`--label-*` in Inter) — the questionnaire's
   questions are sentences, not captions?
2. Error: colour alone, or colour plus something that survives greyscale (a
   prefix, a rule, the field edge — which already turns red)?
3. Optional / required: a word in the label, a mark, or nothing (every field
   optional unless said)?

---

## 2. Text input — one line

**Where**: engine (your company name, a channel's name, a metric that is a
word — the activation event —, the detail on a missing number, the box where
you type a word to confirm erasing everything); audit (company, scope,
currency, units, roles — 25 fields).

**Current build**: `--body-md` on `--field-bg`, `--border-solid`,
`--radius-button`, padding `--space-4` / `--space-5`, full width, at least
`--hit-min` tall; placeholder `--field-placeholder`. The engine version has
`TextArea`'s **soft limit**: a mono counter `0/60` under the field, right-
aligned, that turns `--text-alert` past the limit together with a
`--field-border-alert` edge — typing is never blocked, the save refuses and
says why (a hard `maxlength` silently cut a pasted definition mid-word).

**What feels right**: it is `TextArea`, one line tall — the family is
visible.

**What feels off**: the radius is the button's, so a field and a button of the
same height side by side read as two buttons. The counter sits under the
field for a one-line input, which costs a whole line for a number nobody
reads until it turns red.

**Questions**
4. Should a field and a button look like siblings, or should the field say
   "type here" more plainly (a sunken fill, a bottom rule, a smaller radius)?
5. Soft-limit counter on a one-line field: under it, inside the right edge
   (which `TextArea`'s rules forbid for itself: "no count inside the field"),
   or only once the limit is close?

---

## 3. Number input

**Where**: the engine's heart — every count and amount (15 ×: visitors,
sign-ups, "out of", MRR, spend); the audit's measured values (8 ×).

**Current build** (engine): a text input with `inputmode`, **not**
`type="number"`, because the person types numbers the way they write them.
Thousands are grouped as they type ("2 000 000", not a row of zeros — a
request from Antoine on 2026-09-26), with a non-breaking space in French and
a comma in English. An empty box is `null`, which is **not zero**: "0
referred sign-ups" is a finding. A unit ("%", "€") sits **outside**
the field in `--meta-md --text-muted`, never typed. If what was typed cannot
be read, a line under it says so (`That isn't a readable number.` / `Ce n'est
pas un nombre lisible.`), and the text stays on screen as typed.

**What feels right**: nothing the person typed is ever thrown away.

**What feels off**: nothing distinguishes a number field from a text field
until you type into it. The unit outside the box, after it, is right for "%"
and for a French amount ("26 000 €"), and wrong for an English one, where the
sign comes first ("€26,000", "£26,000" — the engine offers EUR, USD, GBP and
CHF). And the engine's commonest shape — a count **out of** another count,
two fields side by side — falls apart on a phone
(`engine-sheet-filled-invalid-fr-mobile.png`): the two labels wrap to
different heights, so the two boxes no longer line up, and the error under
the second one wraps to four short lines.

**Questions**
6. Should a number field look like one — right-aligned figures, tabular
   numerals (`--font-mono`?), a narrower width sized to the magnitude?
7. The unit: always outside and after, or placed by locale and currency?
8. The parse error and a validation error (below the minimum, "the minimum
   is above the maximum") — one treatment, or two?

---

## 4. Select — and the month and date built on it

**Where**: a closed list past three values (`Segmented` covers two or three):
the currency, the source of a number (grouped: "the tools this usually
comes from" first, the rest under a heading), who holds a missing number,
the audit's statuses (seven),
causes (four), source kinds (six). The engine's months are a `Select` of the
last eighteen months; the audit's dates are a native date input.

**Current build**: always the **native** `<select>` — keyboard, type-to-find
and screen readers work without a line of ours — styled like the text field.
An optional empty first option ("Choose…") makes "not chosen yet" a legal
value: a source nobody picked is not the first tool in the list.

**What feels right**: native, so it works everywhere, including on a phone
where the OS list is better than anything we would draw.

**What feels off**: the platform draws its own chevron, and it differs by
browser. That chevron is the only glyph in the product we did not choose, in
a system with no icons — and the audit's native date adds a second one, a
calendar. The native date also speaks the **browser's** language, not the
page's: `audit-new-mission-fr-desktop.png` shows "09/29/2026" in a tool that
is French throughout.

**Questions**
9. The select's affordance under the no-icon rule: accept the platform
   chevron, hide it (`appearance: none`) and draw one from text (`▾`, `↓`,
   a mono `⌄`?), or a border cue?
10. Month and date: keep the engine's list of months (Safari on desktop draws
    `<input type="month">` as a bare text box) and the audit's native date —
    or one primitive for both?

---

## 5. Choices — pick one, as cards

**Where**: the engine's four-way status question ("Where are you with this
number?" — I have it / I can estimate it / I'll ask for it / I can't find
it), its triage (six reasons), the setup's business model (one live option,
three "coming soon" ones shown disabled with a note).

**Current build**: native radios in a `<fieldset>` whose **visible**
`<legend>` is the question. Each option is a card-like row: `--surface-card`,
`--border-solid`, `--radius-button`, the radio at 16px (ink-tinted via
`accent-color`) beside the label, the whole row at least `--hit-min` tall and
clickable. Selected uses the system's one selection language (the
questionnaire's, DS v3 §5.4): the inverse fill `--state-selected-bg` with
`--state-selected-text`. Hover lifts `--state-hover-shadow` and never touches
the fill; off on touch screens. A disabled option is dashed (the system's
"not yet") at `--state-disabled-opacity`, with its note under the label.
`columns={2}` makes the status question a 2×2 above 760px, one column on a
phone. Nothing is pre-selected unless the caller says so.

**What feels right**: it uses the questionnaire's selection language, so the
engine feels like the Tour it grew from.

**What feels off**: the round mark is drawn twice in the system, two ways.
`quiz/AnswerOption` (the quiz, the Deep dive and the audit's own Tour) draws
it — a 20px ring in `currentColor`, filled around a dot once chosen (Design I,
2026-09-28). `Choices` shows the platform's 16px radio, tinted with
`accent-color`. Same meaning, two drawings, side by side in the same product.

**Questions**
11. One radio mark for the system: `AnswerOption`'s drawn ring on a native
    radio, or something else?
12. Is this a new primitive, or `quiz/AnswerOption` generalised? Note the
    semantic gap: `AnswerOption` is a button with `aria-pressed` (the quiz
    moves on after one tap), `Choices` is a real radio group (arrow keys move
    between options, nothing moves on until "Save").

---

## 6. Checkbox — yes / no with its sentence

**Where**: the engine's setup ("Compare with that Tour" / « Comparer avec ce
Tour »), its slide builder ("Company name on the slides", "High definition",
one per slide to include or leave out), the audit ("Montrer le score du Tour
dans le livrable"). Nine uses in all; only one goes through `CheckField`, the
other eight are written by hand.

**Current build**: a native checkbox at 16px, ink-tinted, beside its sentence
in `--body-md`; the whole label row is the target, `--hit-min` tall.

**What feels off**: it is the one control with no card, no border, no
system mark — a platform checkbox in a system that designed everything
else.

**Questions**
13. A system checkbox: native and tinted (today), or drawn (a 2px ink square
    that fills, in the `Tag` / `Segmented` language)?
14. A list of checkboxes (the slide builder's "What to measure first", one
    per missing number): a fieldset with a legend like `Choices`, or cards
    like `Choices`?

---

## 7. Segmented with a visible label

**Where**: engine, four uses (the activation window, the payment window, a
duration's unit, what a number counts). `Segmented` names itself for
screen readers only (`aria-label`), which is right in a header and wrong in a
form, so `SegmentedField` wraps it with the `Field` label shown and passes the
same string as its accessible name.

**Question**
15. A `label` that can be **visible** on `Segmented` itself (a prop), or keep
    the wrapper — i.e. does every control get its visible label from `Field`,
    or does each carry its own?

---

## The states we need, for every control above

Please draw each one, in each world:

- **empty** (placeholder, or nothing chosen);
- **filled**;
- **hover** (pointer only — nothing may look selected on a stuck touch hover);
- **focus-visible** (one ring for the whole system — see the disagreement
  above);
- **invalid**, with its message (parse error, validation error);
- **over the soft limit** (text input and `TextArea`);
- **disabled**, and **disabled with a reason** (the "coming soon" option);
- **selected** (choices, checkbox).

## Both languages

The engine is bilingual; the audit is French only. French runs 10–20% longer
and is set with a non-breaking space before `: ; ! ? %` and in digit groups.
Real strings, so you can set them rather than imagine them (engine copy under
review — design against the length):

| | English | French |
|---|---|---|
| Legend | Where are you with this number? | Où en es-tu avec ce chiffre ? |
| Choices | I have it · I can estimate it · I'll ask for it · I can't find it | Je l'ai · Je peux l'estimer · Je le demande · Je ne le trouve pas |
| Disabled option + note | B2B with a sales team — Coming soon — their funnel has a different shape. | B2B avec une équipe commerciale — Bientôt — leur funnel n'a pas la même forme. |
| Label + hint | Month for flows — Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month. | Mois des flux — Visiteurs, inscriptions, dépense, churn et ARPA de ce mois-là. Par défaut : le dernier mois terminé. |
| Label (select) | Where does it come from? | D'où vient ce chiffre ? |
| Label (optional) | Your definition (optional) | Ta définition (facultatif) |
| Parse error | That isn't a readable number. | Ce n'est pas un nombre lisible. |
| Validation error | The minimum is above the maximum. | Le minimum dépasse le maximum. |
| Number, grouped as typed | 26,000 · 2,000,000 | 26 000 · 2 000 000 |

## The night version

Forms never appear at night **today** — the game has no field. We want the
night drawn anyway: the night world ships to you in the synced system
(`NightSurface`), so the first time someone designs a form at night it should
be a decision, not an accident. The tokens already re-resolve there (the night
world rebinds the semantic layer; `--field-bg`, `--state-selected-*` and
`--border-solid` follow on their own), so a night field "works" by
construction — nobody has looked at one.

Measured today, translucent inks composed on the ground they land on (the
label, hint and error sit on the page; the placeholder and the typed text in
the field):

| Pair | Paper — page `--paper-1`, field `--paper-0` | Night — page `--night-0`, field `--night-1` |
|---|---|---|
| Label (`--text-muted`) | 5.81 | 8.28 |
| Hint (`--text-faint`) | 5.02 | 5.55 |
| Error (`--text-alert`) | 5.42 | 6.66 (`--night-bad`) |
| Placeholder (`--field-placeholder`) | 7.20 | 7.70 |
| Typed text (`--text-body`) | 16.06 | 15.22 |
| Field edge (`--border-hard`) against the page | 12.97 | 3.99 |
| Alert edge (`--field-border-alert`, the brand red) against the page | 3.57 | 4.04 |
| Focus ring (`--focus-ring`) against the page | 12.97 | 16.38 |
| Selected fill (`--state-selected-bg`) against the page | 12.97 (ink) | 10.13 (amber) |

The night edge (3.99) and both alert edges clear the 3:1 a component edge
needs, and not by much: a field on a raised night panel (`--night-2`) is where
to look first.

Two night rules bite here: the brand red is **never text** at night (3.76:1 —
the error text is `--night-bad`), and a component edge carries its 3:1 by
`--border-hard`, never by a shadow, which is why hover at night changes the
edge (`--state-hover-border`) rather than lifting.

---

## Constraints that are not up for discussion

1. **Tokens only.** Any new value is a new token in `tokens/*.css`, never a
   hex inline; components read semantic names, never a `--night-*` primitive
   (a test holds that). The typography tokens are `font` **shorthands**:
   `font-size: var(--meta-xs)` is silently invalid.
2. **Contrast is checked in CI with no remaining exceptions.** Text 4.5:1
   (3:1 at ≥ 24px, or ≥ 18.66px bold); every field edge, focus ring, checkbox
   and radio 3:1 against what is next to it. A quieter shade needs a token
   that passes, never an exception. Translucent colours are measured
   **composed on their real ground**.
3. **44px targets** (`--hit-min`) on every control and every option row,
   including a 16px checkbox — the row is the target.
4. **A visible label on every control.** An accessible name alone is not
   enough in a form (the audit learned it three times).
5. **Native elements underneath** — `<select>`, radios, checkboxes. No custom
   dropdown or listbox: keyboard, type-to-find and screen readers must keep
   working without code of ours.
6. **No icons, no images.** The glyphs are `🔥` (roast only), `→`, `←`, `№`.
7. **One signature effect per element**: hard shadow *or* dashed border,
   never both. Dashed already means "not yet" (the disabled option).
8. **Bilingual from the same component** — never two layouts for two
   languages.
9. **Nothing the person typed is thrown away**: soft limits never block
   typing, a number that cannot be read stays on screen, an empty number is
   not zero, and nothing is pre-selected for them.
10. **The primary action stays the most prominent thing on its screen** — a
    field must never out-shout the button that saves it.

## What already exists that you may reuse

`core/TextArea` (the soft-limit counter, the red edge past it; both features
already give it a visible label through their `Field`), `core/Segmented`
(two or three options, `md` in the engine, `sm` in the audit's mission
form), `core/Button` (including
`variant="quiet" size="sm"`, the system's one text button, tapped 44px tall —
the engine's "I only have the rate" under a field), `core/Card`,
`core/Callout`, `quiz/AnswerOption` (the selection language), `brand/MetaLabel`,
and the night world's `NightSurface`. Prefer a composition where one works,
and say so.

## What we need back

Same shape as extensions 01 and 03, so the port is mechanical:

- one component per primitive in `core/` (or a note saying "composition of X
  and Y, no new component"), as React + `.d.ts` + `.prompt.md` — the
  `.prompt.md` usage rules are the part we rely on most: when to use which,
  and what never to do;
- every state above, in **paper and night**, at **390px and 1280px**, in
  **both languages**;
- any new tokens in `tokens/*.css`;
- a line on `TextArea`: does it change to match, or do the new fields match
  it?
- inline styles are fine; we port to CSS Modules.

## Open questions — please resolve before delivering

The fifteen numbered above, plus three that cut across:

16. **Naming.** `TextField` / `NumberField` / `Select` / `Choices` /
    `Checkbox` / `Field`, or the system's own words? We mirror yours in
    `src/components/core/`.
17. **Density.** The engine's metric sheet stacks eight fields on a phone. Is
    there a compact form of the field (for a sheet) and a roomy one (for a
    one-question screen), or one size?
18. **Anything the three copies got wrong that this brief did not ask
    about.** They were built by an engineer from tokens. Say so where it
    shows.

## Handoff back

Drop the bundle under `design/ds-extension-04-return/`, or send it through
"Send to Claude Code Web". The port into `core/`, the migration of the engine
and the audit, the tests and the screenshots against the real build are on
our side.
