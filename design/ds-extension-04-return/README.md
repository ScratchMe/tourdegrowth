# Extension 04 — the form primitives · return

*Tour de Growth · Claude Design → the codebase · 2026-09-30 · answers
DS-EXTENSION-BRIEF-04*

Same shape as 01 and 03. One component per primitive in `core/`, each with
React, a `.d.ts` and a `.prompt.md`. New tokens are in `tokens/forms.css`.
Every state is drawn in paper and night, at 390 and 1280, in English and
French, in `board/`. The `.prompt.md` files carry the usage rules.

## What is in the bundle

| Path | What |
|---|---|
| `tokens/forms.css` | The new tokens: type, shape, sizes, derived colours. Nothing reads a primitive |
| `components/core/Field/` | **Field**: the label, the hint, the message, the "optional" word and the soft-limit count, around any control or group. It also holds the shared box (`Field_box`) that every one-line control is drawn in |
| `components/core/TextField/` | **TextField**: one line of text, with a soft limit |
| `components/core/NumberField/` | **NumberField**: a count or an amount. Grouped as typed, the unit inside the box, sized to its magnitude |
| `components/core/Select/` | **Select**: the native select, drawn as a field |
| `components/core/DateField/` | **DateField**: a month (one Select) or a day (three native selects), in the page's language |
| `components/core/Choices/` | **Choices**: pick one, as cards. A real radio group with AnswerOption's ring |
| `components/core/Checkbox/` | **Checkbox**: yes / no with its sentence. A drawn square on a native checkbox |
| `components/core/FieldRow/` | **FieldRow**: two fields that make one statement ("26 000 out of 120 000") |
| `components/core/FormSummary/` | **FormSummary**: what stands between the person and saving. It goes above the button, one link per field |
| `components/core/TextArea/` | What changes in TextArea (`TextArea.delta.md`), with its reference CSS and JSX |
| `components/core/Segmented/` | One new prop on Segmented, `labelledBy` (`Segmented.delta.md`) |
| `board/index.html` | All eight boards side by side |
| `board/board.html?world=&lang=&w=` | One board: `paper`/`night`, `en`/`fr`, `390`/`1280` |
| `board/png/` | The eight boards rendered (Chromium, 1×) |

"Composition, no new component": the **slide builder's `AskForm`** and the
**deck screen's five checkboxes** become `Field` + `TextField` / `Select` /
`Checkbox`. `deck/deck.module.css` loses its `Field` and `.control`.
**`CheckField`** becomes `Checkbox`. **`SegmentedField`** becomes
`Field group` + `Segmented labelledBy`. **`MonthField`** becomes `DateField
precision="month"`. No component is needed for any of them.

The CSS uses one flat class name per part (`Field_box`, `Choices_option`),
the way the bundle compiles CSS Modules, so each file becomes
`X.module.css` as it is. The board's forced hover and focus rules live in
`board/board.css` and are **not** part of the port.

---

## The eighteen answers

### Field

**1. Label: a sentence-case UI label in Inter, not the meta-label.**
The new token is `--field-label` (600, 14.5px), and `--field-label-sm` is
13.5px for a sheet. The label is in full ink. A form is a list of questions.
Set as uppercase mono captions, eight of them read as eight people shouting.
In the engine's French they also ran to two or three lines each (« INSCRITS
EN / JUILLET 2026 »). The meta-label keeps its job for section captions
(FORMULE, REPÈRE) and for the soft-limit count. It is never used for a field's
own label. In a group at `md` (a one-question screen), the legend *is* the
question and is set as the card title (`--field-legend`).

**2. Error: colour plus three cues that survive greyscale.** The field's
edge goes from 2px to **3px** (`--field-edge-invalid`, the system's inked
stamp width). The message is set at **600**, while the hint is 500. The
message also sits behind a **3px rule on its left**. The colour only repeats
what these three say. The hint and the message are now told apart by weight,
rule and position: the message comes first, right under the control.

**3. Optional / required: a word, on the optional fields only.**
`optional="optional"` / `"facultatif"` puts a muted word after the label.
Required fields carry no mark and there is no asterisk, because an asterisk
needs a legend to explain it. The rule is "mark the exception". In both
features, optional fields are the minority, except on the engine's metric
sheet, where it is close. If a form ever has mostly optional fields, write
one sentence above it instead of marking every field.

### Text input

**4. The field says "type here" more plainly, with a smaller radius.**
`--radius-field` is 6px, against 12px for a button and 14px for a panel. The
fill stays `--field-bg` (paper-0, so on a card the field is an edge), and
there is no sunken fill and no bottom rule. A sunken fill would make an empty
field look disabled, which is what `--surface-sunken` means below. A bottom
rule would break the system's rule that every edge is 2px all round. With
the radius alone, a field and a button of the same height no longer look like
siblings. The button keeps its hard shadow and red fill, so it stays the loud
one.

**5. The count goes in the label row, and only near the limit.** On a
one-line field the count sits at the end of the label row, on the same
baseline as the label. It appears from **80%** of the limit
(`--field-count-reveal`), turns red past the limit and takes the 3px red edge
with it. It costs no line, and it is never inside the field, so TextArea's
rule holds. TextArea keeps its count under the field and always shown: a
multi-line field has the room.

### Number input

**6. Yes, it looks like a number.** The figures are **tabular, in Inter**,
not mono. Mono is the system's caption voice, and a value is not a caption.
The box is **sized to the magnitude**: the caller passes `digits`, and a
narrow box says "number". The figure is **set against its unit**: right-aligned
before a unit that follows ("26 000 €", "30 %"), left-aligned after a sign that
comes first ("€26,000"). Without that second rule the euro sign sat alone
across an empty box from the figure.

**7. The unit is placed by locale and currency, inside the box.** The
component does not decide. The caller passes `prefix` or `suffix`, and the
prompt gives the table (€26,000 / 26 000 €, and so on). The unit moves
**inside** the box. On a 390px phone, today's "%" beside a full-width field
runs off the screen, which breaks "nothing scrolls horizontally at 360". A
unit inside the box can never be separated from its figure. `unitName`
("euros") gives screen readers the word, and the visible sign is hidden from
them.

**8. One treatment for all of them.** A parse error ("That isn't a readable
number."), a whole-number rule (« Un nombre entier : on compte des
personnes. ») and a range rule all mean the same thing: this cannot be saved
as it is. The words tell them apart. What *does* differ is who owns the
message. A rule about **two** fields ("The minimum is above the maximum.")
belongs to the pair, so it goes under the `FieldRow`, not under one of its
fields.

### Select, month, date

**9. Keep the platform chevron.** Everything else is ours. Drawing our own
chevron would need a glyph that points down, and constraint 6 names only 🔥 →
← №. A CSS-drawn triangle would be an icon under another name. The chevron
belongs to the OS list that opens, like the list itself, which constraint 5
keeps native. Everything else is ours: edge, fill, radius, 16px value, height,
and a measured `--select-inset` that puts the value on the same vertical line
as a text field's value. The audit's mission form shows a 4px step between
them today (see "Measured"). *If Antoine ever adds a down-pointing glyph to
the list, it is a one-rule change, and it is written in the Select prompt.*

**10. One primitive for both, built on native selects.** `DateField
precision="month"` is the engine's list of months, and it stays a Select.
`precision="day"` replaces the audit's native date with three native selects
(day, month, year), each with a visible label, under one legend. That fixes
the "09/29/2026" in a French tool, removes the calendar glyph, and avoids
Safari's bare-text `type="month"`.

### Choices

**11. One radio mark: AnswerOption's ring, drawn on the native radio.**
The radio is `appearance: none`, with a 20px ring in `currentColor` that fills
around a dot once chosen. It is the same drawing as the quiz's, and the input
underneath is still a native radio. The 16px `accent-color` radio no longer
appears anywhere.

**12. A new primitive, not AnswerOption generalised.** The semantic gap is
the reason. AnswerOption is a button that moves the quiz on. Choices is a
radio group that waits for "Save". Merging them would give one component two
keyboard models and a prop that switches its role. They share the look
through tokens (`--size-mark`, `--mark-inset`, `--state-selected-*`), and
AnswerOption can read `--size-mark` in the port so the two can never drift
apart.

### Checkbox

**13. Drawn.** A 20px square with a 2px edge in `currentColor`
(`--radius-mark`, 4px). Once ticked it fills around a smaller square. It is
the radio's family, square where the radio is round. There is no tick,
because the system has no glyph for one. The input underneath stays native.

**14. A fieldset with a legend, and plain rows, not cards.** Cards with the
inverse fill mean "the one chosen". A list of independent yeses drawn as cards
would be five loud boxes, each claiming to be the choice. Rows split by
`--border-rule` read as a list.

### Segmented

**15. Every control gets its visible label from Field.** Segmented keeps its
`aria-label` for headers (ToneToggle, LocaleSwitcher). It gains one prop,
`labelledBy`, which a `Field group` fills with the id of its visible label.
`SegmentedField` goes. One rule for every control is easier to hold than
"some carry their own".

### Across the brief

**16. Naming: `Field`, `TextField`, `NumberField`, `Select`, `DateField`,
`Choices`, `Checkbox`, `FieldRow`, `FormSummary`.** The system names things in
English and by what they are (`Button`, `Card`, `TextArea`, `Segmented`), and
these follow. `Choices` keeps the engine's name, because "RadioGroup" names
the mechanism and not the thing. `DateField` covers both precisions. The
variant props follow the S-16 axes: `size` is the scale (`sm`/`md`). How
wide a field sits in its column is a new axis. It is **`fit`** (`fill` /
`content`) and not `width`, because `width` already names the page column
(`narrow`/`reading`/`wide`). `columns` on Choices stays.

**17. Density: two sizes on one axis.** `size="md"` (the default) is for a
one-question screen: 48px controls, 64px choice rows, the legend as the
question, 26px between fields. `size="sm"` is for a sheet: 44px controls,
44px choice rows, 20px between fields. Every target stays at least 44px in
both. The engine's metric sheet is `sm`. The setup and the questionnaire-like
screens are `md`. Do not mix the two in one form.

**18. What the three copies got wrong that the brief did not ask about:**

1. **The "coming soon" reason was unreadable: 1.91:1.**
   `--state-disabled-opacity` (0.45) was applied to the whole option,
   including its reason, which was already `--text-faint`. CI measures
   colours, not element opacity, so it passed. The disabled label was
   2.82:1 and its dashed edge 2.09:1. **Disabled no longer uses opacity
   anywhere in these controls.** It is dashed, in `--text-muted` and
   `--border-soft`, which measure 7.20 and 7.20 on a card. I suggest a CI rule
   that fails `opacity` on anything carrying text.
2. **15px inputs zoom the page on iOS.** Safari zooms on focus below 16px.
   `--body-md` is 15px, which is why every field here, and TextArea, moves to
   `--field-value` (16px).
3. **The audit's red focus ring gave red a fourth meaning.** Red is the
   primary action, a diagnosis or advice, never "you are here".
   `--focus-ring-invert` should stay for ink- or red-filled surfaces only.
   `--field-focus-ring` (= `--focus-ring`) is now the only ring on a control.
4. **The audit's "missing fields" paragraph was the loudest thing on the
   screen**: 17px red body text, above the group, pointing at nothing. It
   also used red for a state that saves ("La ligne s'enregistre quand
   même"), so it was not an error. It becomes a per-field `missing` state,
   drawn dashed (the system's "not yet"), and a `FormSummary` above the
   button with a link to each field.
5. **The "%" overflowed the phone.** On the engine's "Ta cible", the unit
   beside a full-width field is clipped at the right edge at 390px. The unit
   now sits inside the box.
6. **The select and the text field don't line up.** In the audit's mission
   form, a select's value starts 4px to the right of a text field's (the
   platform's own indent). `--select-inset` takes it back.
7. **Guillemets break at line ends.** In the audit's hints, « euro » wraps
   as "« euro" / "»," at 390px. The copy is missing the no-break space inside
   « ». The component cannot fix copy. The board's French strings use
   U+00A0, and the copy sheet should too.
8. **Hints were set in 11.5px mono, the widest type in the system.** Next to the months, two-column hints ran to three lines at
   1280. Hints are now Inter 13.5px (`--field-hint`).
9. **`role="alert"` on a parse error that appears while typing** interrupts
   a screen reader on every keystroke of "12o". The prompts now say to show
   a parse error on blur and a missing field on save.
10. **The counter showed "0/60" on an empty field.** It now appears near the
    limit (answer 5).
11. **A full-width select for a three-letter currency.** It is
    `fit="content"` now.

**Out of scope, but since you asked**: I agree to port the what-if
**slider** later, with two conditions. It must get its visible label from a
`Field`, and it must always stand beside a `NumberField` holding the same
value, because a slider alone cannot enter an exact number and is hard to use
with a keyboard at fine steps. The two **file** buttons should be a `Button
variant="secondary"` wrapping a visually hidden `<input type="file">` through
its `<label>`. "Import a file" is an action, not a link.

---

## The ten constraints, one by one

1. **Tokens only.** Every value is a token from `tokens/forms.css` or the
   existing layers. No hex appears in any component, and nothing reads
   `--night-*` or `--paper-*`. The typography tokens are `font` shorthands,
   used as `font: var(--field-label)`. The one number a CSS query cannot read
   from a token (the container widths 480 and 560) is written next to the
   token it mirrors.
2. **Contrast.** Every pair is in the table below and passes, with no
   exceptions. The disabled states are drawn with passing tokens instead of
   opacity.
3. **44px targets.** Controls are 44px (`sm`) or 48px (`md`). Choice rows are
   44 or 64. Checkbox rows are 44. FormSummary lines are 44. Segmented is
   unchanged.
4. **A visible label on every control.** Through Field, including the three
   parts of a date, a Segmented (`labelledBy`) and TextArea.
5. **Native underneath.** `<input>`, `<select>`, `<input type="radio">` and
   `<input type="checkbox">`. There is no listbox or custom dropdown.
6. **No icons, no images.** The marks are drawn edges and fills. The select
   keeps the platform's chevron (answer 9), and no glyph is added.
7. **One signature effect.** Fields have no shadow. Choice rows use the hard
   shadow on hover and are dashed only when disabled, never both at once. The
   inset on a checked mark is the same fill-and-gap as AnswerOption's.
8. **Bilingual from the same component.** Every string arrives from the
   caller. `NumberField` takes `locale` only to group digits.
9. **Nothing typed is thrown away.** The soft limits never block. "12o"
   stays on screen. An empty number is `null`. `value` defaults to `null` or
   `""`, and a Select's empty option stays choosable.
10. **The primary action stays the loudest.** Fields have no shadow and no
    fill of their own, and the focus ring is ink. The last section of the
    board puts a compact sheet next to its button in both worlds to check it.
    One caution: at night the amber selected row in a `sm` sheet is large and
    bright. It is the system's own selection language, the same as in the
    quiz, so I left it. Worth a look on the real screen.

## The night

The fields work there by construction, and they have now been checked. The
board's last section at night sits on a raised panel (`--surface-sunken`,
night-2), where the brief said to look first. The results: the field edge is
3.25:1 against night-2 and 3.70 against night-1, and the missing field's
dashed edge is the same line colour. The alert edge is 3.30 on night-2. The
selected amber is 8.26. They all pass, but the margin is thin on night-2. **I
would not put forms on night-2 without a reason.** If one lands there,
`--field-border` is the one token to lighten (to `--night-muted`, 6.76). It is
derived per world, so this needs no component change. Hover at night lightens
the edge (`--state-hover-border`), as the system's night rule requires. The
error text is `--night-bad`, never the brand red.

## Contrast, measured composed on the real ground

| Pair | Paper: card (paper-0) / page (paper-1) | Night: night-1 / night-0 / panel night-2 |
|---|---|---|
| Label (`--text-body`) | 16.06 / 12.97 | 15.22 / 16.38 / 13.37 |
| Hint, optional word, affix (`--text-muted`) | 7.20 / 5.81 | 7.70 / 8.28 / 6.76 |
| Invalid message (`--text-alert`) | 6.72 / 5.42 | 6.19 / 6.66 / 5.44 |
| Missing message (`--text-body`) | 16.06 / 12.97 | 15.22 / 16.38 / 13.37 |
| Placeholder, on the field | 7.20 | 7.70 |
| Typed value, on the field | 16.06 | 15.22 |
| Disabled value on `--field-disabled-bg` | 5.23 | 6.76 |
| Disabled option: label, reason (`--text-muted`) | 7.20 / 5.81 | 7.70 / 8.28 / 6.76 |
| Field edge (`--field-border`) | 16.06 / 12.97 | 3.70 / 3.99 / 3.25 |
| Dashed edge: missing, disabled (`--border-soft`) | 7.20 / 5.81 | 3.70 / 3.99 / 3.25 |
| Invalid edge (`--field-border-alert`) | 4.42 / 3.57 | 3.76 / 4.04 / 3.30 |
| Focus ring | 16.06 / 12.97 | 15.22 / 16.38 / 13.37 |
| Selected fill (`--state-selected-bg`) | 16.06 (ink) | 9.41 / 10.13 / 8.26 (amber) |
| Mark on the selected fill | 16.06 | 10.13 |
| *Was: the disabled reason at 0.45 opacity* | *1.91* | *2.11* |

## Measured

`--select-inset: 4px`. In Chromium (Playwright 1.56), a `Select_control` and
a `Field_box` text input with the same value put the first ink pixel at the
same x (17.5px from the edge) once the inset is taken back. Re-measure in
WebKit and Gecko during the port and set the token. Never set it in a
component.

## For the port

- `FieldRow` uses CSS **subgrid**, and `Choices` and `FieldRow` use
  **container queries**. Both are in every browser the product supports.
  Below them, the fields simply stack.
- The marks use the `lh` unit to sit on the first line of a two-line label.
  Where `lh` is missing, they sit 2px high, which is harmless.
- `NumberField` exports `groupAsTyped`. It keeps the caret between the same
  digits. The engine's parser stays the source of truth for the value.
- `AnswerOption` can read `--size-mark` and `--mark-inset` instead of its
  literals (20px, 4px), so the two marks cannot drift apart.
- Remove from both features: `_engine/_ui/{Field,TextField,NumberField,Select,
  MonthField,Choices,CheckField,SegmentedField}`, `admin/audit/_ui/{Field,
  TextInput,NumberInput,Select,DateInput}`, and `deck/AskForm`'s local
  `Field` and `.control`.
