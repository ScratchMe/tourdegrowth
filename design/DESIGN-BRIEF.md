> **Note de liaison :** les 10 "Open questions" en fin de ce document ont été
> passées en revue avec Antoine (agent produit). Les résolutions sont dans
> `SPEC.md` §12 à la racine du repo — pas dupliquées ici pour éviter que les
> deux documents divergent. Ce qui reste vraiment ouvert (bibliothèque de
> textes de verdict, copie française finale) est aussi listé là-bas, avec
> l'instruction explicite de ne pas l'inventer côté implémentation.

# Handoff: Tour de Growth — AARRR growth check-up

## Overview

Tour de Growth is a web tool that walks a user through a 15-question guided
questionnaire on growth fundamentals (the AARRR framework: Acquisition,
Activation, Retention, Referral, Revenue) and produces a shareable score out
of 100, broken down into five per-pillar scores out of 20.

The flow is: **Landing → Questionnaire (15 questions, 5 stages) → Tone
selector (Straight up / Roast) → Loading (2–3 s) → Result page → Share**.
The share step generates an Open Graph image; that image is the main
acquisition loop, so it is specified here as an exact 1200 × 630 template.

Visual direction: **"Marquage au sol"** — stencil-painted road numbers, race
bib tags, dashed road lines, stickers/tickets laid on warm stone. The Tour de
France reference is carried by *material only* (stencil type, stone, dashed
borders, bib tags). No bicycles, no yellow jersey, no helmets, no literal
pictograms.

## About the design files

The files in this bundle are **design references created in HTML** —
prototypes that show the intended look, copy, and behavior. They are not
production code to copy.

The task is to **recreate these designs in the target codebase's existing
environment** (React, Vue, Svelte, whatever is already in place), using its
established component patterns, routing, and styling approach. If no codebase
exists yet, pick the framework that best fits the project and implement there.

`Tour de Growth.dc.html` is a single canvas document containing *all* screens
laid out side by side as artboards — it is a design board, not an app. Each
artboard is a static mock; there is no working navigation between them.
`support.js` is the runtime that renders that document; it has no relevance to
the production implementation.

Note on inline styles: the design file uses inline styles exclusively, for
tooling reasons. Do **not** carry that over — implement with the codebase's
normal styling approach and the design tokens listed below.

## Fidelity

**High fidelity.** Colors, typography, spacing, borders, shadows, and copy are
final. Recreate the UI closely using the codebase's own libraries and
primitives. Two caveats, both listed under Open questions:

- The per-pillar verdict sentences ("Strengths" / "Where you're losing time")
  are **example content**, not the real copy library.
- The French screen (artboard 07) is a **layout stress test**, not approved
  translation copy.

---

## Design tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--stone` | `#E7E1D2` | Page background |
| `--stone-2` | `#DED6C2` | Secondary surface, unselected answer buttons, stage tags |
| `--ink` | `#211C15` | Primary text, borders, the stencil score numeral |
| `--ink-soft` | `#5B5346` | Secondary text, captions, dashed borders |
| `--red` | `#D2402C` | Primary accent: CTAs, Roast mode, weak-pillar borders. **Large elements and borders only** |
| `--red-ink` | `#A32E1F` | Small red text (mono labels ≤ 14px) — see Open questions |
| `--red-soft` | `#F3D9D2` | Background of "weak pillar" cards and tags |
| `--paint-white` | `#FBF9F2` | Card background ("white paint / paper laid on stone") |
| `--line` | `rgba(33,28,21,.22)` | Dashed header rules |

Page background is `--stone` plus two very soft radial gradients that fake
uneven stone lighting:

```css
background-image:
  radial-gradient(circle at 18% 14%, rgba(255,255,255,.45), transparent 42%),
  radial-gradient(circle at 86% 72%, rgba(0,0,0,.05), transparent 46%);
```

Contrast: `--red` on `--red-soft` does not pass AA at small sizes. All small
red text in the mocks uses `--red-ink` (`#A32E1F`). Keep that split.

### Typography — three roles, no more

| Role | Family | Weights | Used for |
|---|---|---|---|
| Display / signature | **Stardos Stencil** | 700 | Landing H1, the score numeral, screen-level headings on tone/error screens. Never body text. |
| Body / UI | **Inter** | 400 / 500 / 600 | Paragraphs, buttons, questions, answer options, nav |
| Data / labels | **IBM Plex Mono** | 500 / 600 | Per-pillar scores, stage tags, `Stage 2 of 5`, `№ 15 questions`, technical captions |

```html
<link href="https://fonts.googleapis.com/css2?family=Stardos+Stencil:wght@700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
```

Type scale as used (desktop / mobile):

- Landing H1: 62px / 40px, Stardos Stencil 700, line-height 1.02–1.03
- Score numeral: 144px / 110px, Stardos Stencil 700, line-height .86–.88
- Score `/100` suffix: 38px / 30px, `--ink-soft`, `vertical-align:super`, `margin-left:6–8px`
- Question H2: 28px / 22px, Inter 600, line-height 1.28–1.3
- Body / subtitle: 17px / 15.5px, Inter 500, line-height 1.55, `--ink-soft`
- Card body copy: 15px / 14.5px, Inter 500, line-height 1.5
- Buttons: 15–16px, Inter 600
- Mono labels: 11–12.5px, letter-spacing .06–.12em, often uppercase
- Wordmark: Stardos Stencil, 15–19px, `TOUR DE` in `--ink` + `GROWTH` in `--red`

### Layout & elevation

- **Card**: `background:--paint-white; border:2px solid --ink; border-radius:10px; box-shadow:7px 7px 0 --ink`
  (hard shadow, zero blur — sticker/ticket, not Material). Sub-cards inside a
  screen use `border-radius:8px` and **no** shadow.
- **Dashed borders** (`2px dashed`) mark anything sequential: progress bar
  segments, stage tags, bib tag, header rules.
- **Radii**: 4px (tags, small chips), 6px (buttons), 8px (sub-cards), 10px (main cards). Never 0, never pill.
- **One signature effect per element.** A card gets *either* the hard shadow
  *or* the dashed border — not both, not plus texture.
- Content max width 1040px; mobile designed at 390px (must hold 375–430px).
- Spacing rhythm: 8 / 10 / 12 / 14 / 20 / 22 / 26 / 32 / 44 px. Use flex/grid
  with `gap`, not margins between siblings.

### Spray texture (the score numeral)

Overlay on the numeral only, to suggest irregular spray paint:

```css
position:absolute; inset:0;
background: repeating-linear-gradient(115deg, transparent 0 3px, rgba(33,28,21,.055) 3px 4px);
mix-blend-mode: multiply; pointer-events:none;
```

On the 1200 × 630 share image the stripe is scaled up: `transparent 0 5px, rgba(33,28,21,.06) 5px 7px`.

### Motion — one orchestrated moment only

```css
@keyframes stamp{
  0%{transform:scale(1.18) rotate(-3deg);opacity:0}
  60%{transform:scale(.99) rotate(.6deg);opacity:1}
  100%{transform:scale(1) rotate(0);opacity:1}
}
/* applied to the score numeral */
animation: stamp .26s cubic-bezier(.2,1.4,.4,1) both;
```

Progress bar: the newly completed segment gets a short `pulse`
(`scaleY(1) → 1.35 → 1`, `.4s ease-out`). Nothing else on the site animates.

```css
@media (prefers-reduced-motion: reduce){ *{animation:none !important; transition:none !important} }
```

### Focus

Every interactive element must show a visible focus ring:
`outline:3px solid --ink; outline-offset:3px` on light surfaces;
`outline:3px solid --red; outline-offset:3px` on answer options and tone
options (where the surrounding border is already ink).

---

## Screens

Artboard numbers below match the labels in `Tour de Growth.dc.html`.

### 01 — Landing (`#landing`)

**Purpose:** explain the tool in one screen and start the questionnaire.

**Layout (desktop, 1040px):** sticky-less header (24px vertical padding,
`2px dashed` bottom rule) with wordmark / nav (`How it works`, `Examples`,
`Roast mode`, 13.5px Inter 500 `--ink-soft`) / primary CTA. Hero below at
60px top padding: two-column grid `1.05fr .95fr`, gap 48px, items start-aligned.

**Left column:**
- Bib tag: `№ 15 questions — 3 min — free entry` — IBM Plex Mono 12.5px,
  uppercase, letter-spacing .05em, `--paint-white` bg, `2px dashed --ink-soft`,
  radius 4px, padding 7px 16px, `transform:rotate(-1.2deg)`, 26px bottom margin.
- H1: `Where does your growth stall?` — Stardos Stencil 62px; line break
  after "does"; the word **stall** in `--red`.
- Subtitle: `A guided check-up across Acquisition, Activation, Retention, Referral and Revenue — scored, explained, and built to share.` — max-width 440px.
- Buttons: primary `Start your Tour →` (`--red` fill, `--paint-white` text,
  2px solid `--red`, radius 6px, padding 15px 26px); secondary
  `See a sample result` (transparent, 2px solid `--ink`).

**Right column:** sample score card (the full Card recipe with 7px hard
shadow). Two mono captions on one row: `Overall Growth Score — Sample B2B SaaS`
and `Stage 5/5`. Then the stencil numeral `74/100` at 118px. Then a wrapping
row of five stage tags, gap 9px:
`18 Acquisition · 12 Activation · 8 Retention · 16 Referral · 20 Revenue`.
Each tag: IBM Plex Mono 11.5px, `2px dashed --ink-soft`, radius 4px,
`--stone` bg, `--ink-soft` text, with the number in `--ink` weight 600.
The weak pillar (Retention) instead uses `2px dashed --red`, `--red-soft` bg,
`--red-ink` text.

**Mobile (390px):** single column. Header collapses to wordmark + a
two-dash menu glyph. H1 40px, no forced break. Buttons full-width, stacked,
16px padding. Sample card moves below the CTAs, numeral 84px, shadow 6px,
stage tags abbreviated to `Acq / Act / Ret / Ref / Rev` at 11px.

### 02 — Result, Straight up (`#result-neutral`)

**Purpose:** the most-viewed screen after the landing. Deliver the score,
name the two strengths and the two weak pillars, drive a share.

**Mobile (390px, designed first):** vertical stack, gap 22px.
1. Header: wordmark + mono `Stage 5/5 — finished`, `2px dashed` bottom rule.
2. Score card (7px hard shadow): mono label `Overall Growth Score`; numeral
   `74/100` at 110px with `stamp` animation and spray overlay; one-line
   verdict beneath in Inter 500 14px `--ink-soft`.
3. Pillar grid, `1fr 1fr`, gap 8px, five tags reading `18/20 Acquisition` etc.,
   Retention in the red variant, Revenue spanning both columns.
4. `Strengths` — mono section label, uppercase, letter-spacing .12em. Two
   sub-cards (`--paint-white`, 2px solid `--ink`, radius 8px, padding 14/16):
   mono `Revenue — 20/20` / `Acquisition — 18/20` above a 14.5px sentence.
5. `Where you're losing time` — same structure, sub-cards in `--red-soft`
   with `2px solid --red` and `--red-ink` mono labels
   (`Retention — 8/20`, `Activation — 12/20`).
6. CTAs stacked full-width: `Share my score` (red fill), `Take the Tour again` (outline).

**Desktop (1040px):** header adds `Stage 5/5 — finished · 15/15 answered`.
Two-column grid `400px 1fr`, gap 44px, 44px top padding. Left column: score
card (numeral 144px) then the five pillar tags stacked vertically, gap 8px.
Right column: `Strengths` as a `1fr 1fr` grid of two cards, then
`Where you're losing time` as a `1fr 1fr` grid of two cards, then the two CTAs
in a row. Section gap 32px.

### 03 — Open Graph share image (`#og`) — highest care

**Exact frame: 1200 × 630, `box-sizing:border-box`, 2px solid `--ink`,
padding 48px 56px, `overflow:hidden`, no border-radius.** Verify the rendered
box measures exactly 1200 × 630; the crop matters.

Background: `--stone` + radial gradients at `12% 10%` (white .5) and
`92% 86%` (black .06). One decorative road line: absolutely positioned at
`top:96px`, full width, `border-top:8px dashed rgba(33,28,21,.10)`.

Three rows, `justify-content:space-between`:

1. **Top:** wordmark (Stardos Stencil 28px) left; right, a bib-style tag
   `AARRR check-up — 3 min` (mono 16px, uppercase, letter-spacing .08em,
   `--paint-white` bg, `2px dashed --ink-soft`, radius 4px, padding 8px 16px).
2. **Middle:** left, mono 19px uppercase `Overall Growth Score` above the
   stencil numeral at **268px** with a 76px `/100` suffix and the scaled spray
   overlay. Right, a 400px-wide column of five mono 20px rows, gap 9px, each
   `justify-content:space-between` with the pillar name left and the score
   right; the weak pillar (Retention, `08`) in the `--red-soft` / `2px solid --red`
   / `--red-ink` variant, others `--stone-2` / `2px dashed --ink-soft`.
   Pad the column 14px from the bottom so it optically aligns to the numeral baseline.
3. **Bottom:** left, Inter 600 30px, max-width 640px:
   `Retention is where this growth stalls.` in `--ink` followed by
   `Where does yours?` in `--ink-soft`. Right, `tourdegrowth.com` in mono 19px,
   `--red` background, `--paint-white` text, radius 5px, padding 12px 18px,
   `white-space:nowrap`.

**Feed-size rule:** at ≈320px wide (LinkedIn/X feed) only three things must
survive: the stencil numeral, the red Retention row, and the wordmark. Do not
add elements that compete at that size. The artboard includes a 320 × 168
scaled crop for checking this — reproduce that check in whatever tooling
generates the image.

Dynamic fields: score, five pillar scores, which pillar is flagged weak, and
the bottom sentence (pillar name is injected). Everything else is fixed.

### 04 — Result, Roast (`#result-roast`)

Same layout, same components, same grid as screen 02. **Only the accent
moves** — do not build a second design.

Differences, and nothing beyond them:
- Header right slot becomes a badge: `🔥 Roast Mode` — mono 11px, weight 600,
  uppercase, `--red` bg, `--paint-white` text, radius 4px, padding 6px 10px,
  `transform:rotate(-1.5deg)`.
- Score card border and hard shadow switch from `--ink` to `--red`
  (`box-shadow:7px 7px 0 #D2402C`). The numeral stays `--ink`.
- Verdict line under the numeral goes Inter **600** (from 500):
  `Not bad for someone whose users leave before the second week.`
- Pillar tags: Activation moves to the `--red-soft` variant; **Retention only**
  becomes a stamped tag — solid `--red` fill, `--paint-white` text, weight 600,
  `transform:rotate(-1deg)`, label `08/20 RETENTION — dead last`, spanning both
  mobile columns. This is the one "spray-stamped" element per screen; do not
  rotate anything else.
- `Strengths` is retitled `Credit where it's due` and carries one card instead
  of two.
- CTAs: `Share my roast`, `Switch to straight up`.

Roast tone calibration (voice reference, one of these is shown as the
Retention verdict): *"Your retention took one look at your product and rode
straight past the finish line."*

### 05 — Questionnaire (`#quiz`)

One question at a time, 15 questions grouped into 5 stages of 3.

**Progress bar:** five equal-flex segments in a row, gap 6–8px, height 16–18px,
radius 4px:
- completed → `2px solid --ink`, `--ink` fill
- current → `2px solid --red`, `--red` fill, plays the `pulse` on entry
- upcoming → `2px dashed --ink-soft`, `--stone-2` fill

Below it, mono 12–12.5px uppercase: `Stage 2 of 5 — Activation`.
Header right slot shows `Q 4 / 15` (desktop adds `— 2 min left`).

**Question:** in its own card (`--paint-white`, 2px solid `--ink`, radius 10,
7px hard shadow), Inter 600, 28px desktop / 22px mobile, no other decoration.
Example: `Have you defined a specific "aha" moment for new users?`

**Answers:** full-width stacked buttons, gap 12px, left-aligned text, Inter 500
17px / 16px, padding 20px, radius 8px, `2px solid --ink`, `--stone-2` fill,
**`min-height:64px`** (thumb comfort — never smaller).
- hover: fill `--paint-white` + `box-shadow:4px 4px 0 --ink`
- focus: `outline:3px solid --red; outline-offset:3px`
- selected: same as hover, plus advance to the next question

Example options: `Yes, and we measure it` / `We have one, but don't measure it` / `Not really`.

**Footer (mobile):** `← Back` as an underlined mono text button, and mono
`Answer to continue` on the right.

### 06a — Tone selector (`#states`, first artboard)

Header right slot: mono `15 / 15 answered`.
Title: `How do you want your results?` — Stardos Stencil 34px.
Two option cards, gap 14px, each a full-width left-aligned button, padding 20px,
radius 8px, `2px solid --ink`:
- Title row: Inter 600 19px on the left, radio indicator on the right
  (18px circle; selected = `--ink` fill with `inset 0 0 0 3px --paint-white`
  and `2px solid --ink`; unselected = `2px solid --ink-soft`, no fill).
- Description: Inter 500 14.5px `--ink-soft`.
- Selected card: `--paint-white` fill + `6px 6px 0 --ink` hard shadow.
  Unselected: `--stone-2` fill, no shadow, hover → `--paint-white`.

Copy: `Straight up` / `Clear, constructive, no sugar-coating.` and
`Roast me` (with a small `🔥` red mono chip after the label) /
`Same insights, sharper tongue. All in good fun.`

CTA `Get my score →` (red fill, full width), then mono 11.5px centered:
`You can switch tone on the result page.`

### 06b — Loading (`#states`, second artboard)

Duration 2–3 s. Centered column, gap 26px.
- Placeholder numeral: Stardos Stencil 96px `——` in `--ink-soft` at .45 opacity
  with the spray overlay. **It reserves the score's space so the layout does not
  jump on reveal.**
- Three rotating messages, ~1.3 s each, stacked and full-width:
  active = mono 13.5px `--ink` on `--paint-white` with `2px solid --ink`, radius 6, padding 12/14;
  next = `2px dashed rgba(33,28,21,.25)`, `--ink-soft`;
  pending = same dashed at .5 opacity.
  Copy in order: `Reviewing your answers...` → `Calculating your stage times...` → `Drafting your race report...`
- Three-segment mini progress row, height 12px, filling in step with the
  messages (`--red` solid when filled, `2px dashed --ink-soft` otherwise).

### 06c — Error (`#states`, third artboard)

Header right slot: mono `Error` in `--red-ink`.
Card: `--paint-white`, `2px solid --red`, radius 10, `box-shadow:7px 7px 0 --red`,
padding 24/22.
- Mono 11px uppercase eyebrow: `Detour`
- H2 Stardos Stencil 36px: `Your results took a wrong turn.`
- Body Inter 500 15px `--ink-soft`: `Something broke on our end — try again in a moment.`

CTA `Try again` (red fill, full width). Below, mono 11.5px `--ink-soft`:
`Your 15 answers are still saved on this device — retrying doesn't restart the questionnaire.`

Implementation note: answers persist locally so a retry never restarts the
questionnaire. Honour that promise or change the copy.

### 07 — French layout test (`#fr`)

A 390px result card with French copy, included because French labels run
15–25% longer than English and the mono tags and stencil headings are the
tightest elements in the system. Use it to verify the template holds, **not**
as approved translation copy.

Labels used: `Étape 5/5 — terminé`, `Score growth global`,
`Là où vous perdez du temps`, `Rétention — 8/20`, `Partager mon score`.

---

## Interactions & behavior

| Trigger | Result |
|---|---|
| `Start your Tour →` | Go to question 1 |
| `See a sample result` | Open the sample result (screen 02) with fixed demo data, marked as a sample |
| Answer click | Record answer, `pulse` the progress segment if the stage completed, advance to the next question |
| `← Back` | Previous question, previous answer still selected |
| After question 15 | Tone selector (screen 06a) |
| `Get my score →` | Loading (06b) → result in the chosen tone (02 or 04) |
| Score mount | Play `stamp` once, unless `prefers-reduced-motion` |
| `Share my score` / `Share my roast` | Native share sheet where available, otherwise copy the result URL; the URL must serve the 1200 × 630 OG image |
| `Switch to straight up` / tone switch on result | Re-render the same result in the other tone; no recalculation, no reload |
| `Take the Tour again` | Clear answers, back to question 1 |
| Calculation failure | Error screen (06c); `Try again` re-submits the stored answers |

Responsive: mobile layout up to ~760px, desktop above; content capped at
1040px. The questionnaire keeps one column at every width; only the type scale
and paddings grow.

## State

- `answers: Record<questionId, optionIndex>` — persisted locally (survives reload and error retry)
- `currentQuestion: 0…14` (derives `stage = floor(i/3)+1`)
- `tone: 'neutral' | 'roast'`
- `status: 'idle' | 'calculating' | 'ready' | 'error'`
- `result: { total, pillars: {name, score}[], weakest, strengths[], weaknesses[] }`
- `locale: 'en' | 'fr'`
- Result must be addressable by a shareable URL that also serves the OG meta tags.

## Assets

None. No images, no icon files, no SVG. Every visual element is CSS
(borders, gradients, hard shadows) plus the three web fonts above. The only
glyphs used are the `🔥` emoji in the Roast badge, `→`, `←`, and `№`.

## Files in this bundle

| File | What it is |
|---|---|
| `Tour de Growth.dc.html` | All 9 artboards on one canvas — the design reference |
| `support.js` | Runtime for the file above; irrelevant to production |
| `DESIGN-BRIEF.md` | The original brief (tokens, screen inventory, real copy, tone rules) |
| `direction-b-marquage-sol.html` | The earlier approved direction preview (hero + score card) |

To view: open `Tour de Growth.dc.html` in a browser and pan/zoom the canvas.
Artboard anchors: `#landing`, `#result-neutral`, `#og`, `#result-roast`,
`#quiz`, `#states`, `#fr`.

---

## Open questions — please resolve before building

1. **Verdict copy library.** The Strengths / "Where you're losing time"
   sentences in the mocks are examples I wrote. The real product needs a
   verdict per pillar per score band, in two tones and two languages. How many
   bands, and how many items appear per section? More than two items per
   section changes the desktop result layout from a 2-up grid to a list.
2. **`--red-ink` (`#A32E1F`).** Not in the brief's token table. I added it
   because `--red` on `--red-soft` fails AA below ~18px. Confirm it as an
   official token, or drop small red text entirely.
3. **Score → verdict headline mapping.** I added a one-line summary under the
   numeral ("Solid engine, one flat tyre…") because the number alone says
   nothing on mobile. It is not in the brief. Keep it, and if so, what are the
   bands and their sentences?
4. **French copy.** Screen 07 is a layout test. Real French strings are needed
   for all 15 questions, all answer options, both result pages, and the roast
   voice — the roast tone especially does not survive machine translation.
5. **Scoring model.** 15 questions → 5 pillars × 20 points. Are all questions
   equally weighted (3 questions × ~6.67 pts)? Rounding behavior for pillar
   scores and total? This affects whether `08/20` style values are always integers.
6. **"Weakest pillar" rule.** Ties: if two pillars score the same lowest
   value, which one gets the red treatment and appears in the OG sentence?
7. **OG generation.** Server-rendered (Satori/Puppeteer) or pre-baked? Stardos
   Stencil must be embedded — the numeral is the whole image, and a font
   fallback destroys it. Also confirm whether the Roast variant gets its own
   OG image (red border + badge) or shares the neutral one.
8. **Sample result.** Is `See a sample result` a fixed hard-coded result, or a
   real stored one? It needs to be visibly marked as a sample so it is not
   mistaken for the user's own score.
9. **Landing nav.** `How it works`, `Examples`, `Roast mode` are in the
   approved preview but no pages were specified for them. Anchors on the
   landing, real pages, or cut?
10. **Result persistence.** Does a shared result URL stay live indefinitely?
    That decides whether results need storage or can be encoded in the URL.
