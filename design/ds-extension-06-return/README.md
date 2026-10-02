# Brief 06 — the growth engine's share image · return

*Tour de Growth · Claude Design → the codebase · 2026-10-02 · answers
DS-EXTENSION-BRIEF-06*

One image per language, 1200 × 630, on paper. It keeps the frame every share
image shares. The engine's ultramarine carries the difference, in three
places:

- the space pill « 2/3 · CONTRE-LA-MONTRE »;
- the word « moteur » / "engine" in the stencil title;
- the stopwatch, drawn large on the right.

There is no question count, no stage tag and no peloton, and no figure of
anyone's.

## What is in the bundle

| Path | What |
|---|---|
| `og/EngineShareImage.og.mjs` | **The frame**, as the port will write it: a tree of `div`s and `span`s, each `display: flex`, placed by flex or by absolute position, every measure in px, every colour by **token name** through `c()`. It takes `h` as an argument, so the same tree runs through Satori, React's `createElement`, or the preview |
| `og/Stopwatch.og.mjs` | **The stopwatch**, redrawn as inline SVG from `brand/Stopwatch`'s own parts: hard shadow, stem, crown and lap buttons, ultramarine bezel, card face, 60 ticks, the run so far as a wedge, the hand and the hub. Also the band's 34 × 22 pictogram, for the pill |
| `og/tokens.og.mjs` | Every colour the image uses, by token name, with the literal it resolves to on paper today, and the two values that are recipes (the ground's lift, the wedge's 14%). It is the only place a colour value is written |
| `og/strings.og.mjs` | Every string drawn, per language, with the alt text. New words are marked `NEW` |
| `preview/index.html` (+ `preview.mjs`, `dom-h.mjs`) | **Source preview**: both images at 1200 × 630, the 320px check of each, and the strings and alt text, all read from `og/`. No build. Serve the folder over http, because ES modules do not load from `file://` |
| `render/engine-og-fr.png`, `render/engine-og-en.png`, `render/*-320.png` | What **Satori itself** drew from `og/` (satori + resvg, with the brief's five static font files), at 1200 and at 320. Reference only: the source is `og/` |

## The four answers

**1. Ground: paper, as you lean.** Paper with its lift, like the page and like
the landing's and the result's images. The difference comes from what sits
on it: an ultramarine pill next to the wordmark, an ultramarine word in the
title, and an ultramarine stopwatch where the check-up has a question and
the result a score.

An ultramarine ground would make the engine a fourth world. It would also
look like the band and not like the page people land on, and at feed size a
blue rectangle reads as an ad before it reads as the Tour. Night is the
game's; paper stays the Tour's.

**2. The picture: the stopwatch alone.** At 320px it is still one clear
shape: a blue-rimmed dial with its button, about 80px wide. It is the
engine's emblem on its page and in its band, and nothing else in the family
has it.

The peloton does not survive the feed:

- four columns of a hundred dots become a grey texture with 2px dots;
- its numbers (100, 18, ?, 6 to 9) are the public example's, but in a feed
  they read as the sharer's. That is the misreading rule 2 exists to
  prevent.

The peloton stays the engine's signature on the page and on slide one, where
there is room to label it « Exemple SaaS ».

**3. The words, in this order:**

1. the **eyebrow** « LE MOTEUR » / "THE ENGINE";
2. the **H1** « Ton moteur de growth » / "Your growth engine", on two set
   lines, with « moteur » / "engine" in ultramarine;
3. **one line** that says it is a tool you fill: « Tape tes chiffres du
   mois : il montre où ton funnel perd le plus de monde. » / "Type in this
   month's numbers: it shows where your funnel loses the most people.";
4. the **promise** in mono capitals: « TES CHIFFRES RESTENT DANS TON
   NAVIGATEUR » / "YOUR NUMBERS STAY IN YOUR BROWSER".

The line and the promise are **new** (they go to the proofing sheet):

- **The line:** the page's own line ("Your Tour tells you whether you
  measure…") needs the Tour to make sense. A stranger in a feed has not taken
  it. The new line uses the brief's own words for what the page does.
- **The promise:** « Rien de ce que tu saisis ne sort d'ici » / "Nothing you
  enter leaves this page" is right on the page, but on an image in a feed
  « d'ici » / "this page" points at the image. « ton navigateur » / "your
  browser" says the same thing in a way that holds anywhere.

The search title (« Modèle de funnel AARRR : chiffres en local ») is not
drawn. It belongs to the page's `<title>` and the image's alt text. Four
lines of text are already the most a feed-size image can carry.

**4. The space pill: yes**, « 2/3 · CONTRE-LA-MONTRE » / "2/3 · TIME TRIAL".
It sits where the result wears « 1/3 · FLAT »: right of the wordmark, filled
in ultramarine with paper text (9.23:1), with the band's stopwatch pictogram.
It is the one place the image says which leg of the race this is.

## Every string drawn

| | Français | English | Status |
|---|---|---|---|
| Wordmark | TOUR DE GROWTH | TOUR DE GROWTH | the frame's |
| Space pill (capitals) | 2/3 · Contre-la-montre | 2/3 · Time trial | the band's |
| Domain badge | tourdegrowth.com | tourdegrowth.com | the frame's |
| Eyebrow (capitals) | Le moteur | The engine | the page's |
| Title | Ton moteur / de growth | Your growth / engine | the page's H1 |
| Line | Tape tes chiffres du mois : il montre où ton funnel perd le plus de monde. | Type in this month's numbers: it shows where your funnel loses the most people. | **new** |
| Promise (capitals) | Tes chiffres restent dans ton navigateur | Your numbers stay in your browser | **new** |

The French follows the house rules: « tu », and a no-break space (U+00A0)
before « : » in the line and inside « » in the alt text. « Moteur de
growth » is lower case in running text; the title is the H1 as it stands.
« Étape » is used nowhere: the space is « 2/3 · Contre-la-montre ».

## Alt text

- **Français.** Tour de Growth, 2/3 · contre-la-montre : « Ton moteur de
  growth ». Un chronomètre à la lunette bleu outremer. Tape tes chiffres du
  mois : il montre où ton funnel perd le plus de monde. Tes chiffres restent
  dans ton navigateur. tourdegrowth.com
- **English.** Tour de Growth, 2/3 · time trial: "Your growth engine". A
  stopwatch with an ultramarine bezel. Type in this month's numbers: it
  shows where your funnel loses the most people. Your numbers stay in your
  browser. tourdegrowth.com

(Exact strings, with their no-break spaces, are in `og/strings.og.mjs`.)

## The 320px check

At 320 × 168 (`render/engine-og-*-320.png`, and the preview), three things
must read:

- **The title:** 104px → about 28px, two stencil lines, the blue word clear.
- **The wordmark:** the same size as on every share image.
- **The stopwatch:** about 80px wide.

The pill reads as a blue tag even where its letters do not. The line and the
promise go quiet at that size, which is what they should do: nothing
competes with the three.

## What it survives: the renderer

- **Flexbox only.** Every element is `display: flex`. The seven blocks are
  placed absolutely; inside them everything is flex. There is no grid.
- **No custom property.** Colours go through `c("--token-name")`, and the
  port writes the literal from `og/tokens.og.mjs`. Two values are recipes,
  named there: the ground's lift (`--ground-lift` on paper) and the wedge
  (`--space-engine-accent` at 14%, which is a `color-mix` in the
  component's CSS).
- **No filter, no blur.** The shapes are a radial gradient for the lift, a
  dashed border for the road line, solid borders, and inline SVG for the
  stopwatch and the pictogram (`circle`, `rect`, `line`, `path`). The
  shadow under the stopwatch is drawn, not blurred.
- **Fonts.** Stardos Stencil 700, Inter 500, IBM Plex Mono 500 and 600 (Inter
  600 is not used). The glyphs outside ASCII are « · » (U+00B7), « ù »
  (U+00F9) and the no-break space (U+00A0). All three are in the Latin
  subset, checked against the font files. There is no arrow, no « № » and
  no « ≈ ».
- **Two things Satori does differently**, both handled in the source and
  commented there:
  1. A trailing space inside a `<span>` is dropped, so the wordmark's word
     space is a 10px `gap`.
  2. `transparent` in a gradient is blended through black and greys the
     lift, so the lift ends on `rgba(255, 255, 255, 0)`.
- **Proof.** The PNGs in `render/` were drawn by Satori 0.33.5 and resvg-js 2.6.2 from
  these exact files, with no change.

## Contrast, on the real ground

The ground is `--paper-1`. The lift only makes it lighter, so the plain
ground is the worst case; the figures in brackets are measured at the lift's
brightest point.

| Text | Ground | Ratio |
|---|---|---|
| Title, ink (`--ink-0`), 104px | paper | 12.97 (15.66) |
| Title word, ultramarine (`--space-ultramarine`), 104px | paper | 7.45 (9.00) |
| Eyebrow and promise, ultramarine mono 600, 20px / 17px | paper | 7.45 (9.00) |
| Line, `--ink-1`, Inter 500 28px | paper | 5.81 (7.02) |
| Space pill, `--paper-0` on ultramarine | the pill | 9.23 |
| Domain badge, `--paper-0` on `--paint-red-action` | the badge | 4.65 |
| « GROWTH », `--paint-red`, 34px stencil bold (large text, 3:1) | paper | 3.57 (4.31) |

Red is used only where the frame already uses it (the wordmark and the
badge). Nothing on the image is a diagnosis, so no other red appears.
