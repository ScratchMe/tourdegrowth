# Design brief 06 — the growth engine's share image

*Tour de Growth · from the codebase to Claude Design · 2026-10-01*

## Why this brief

The growth engine is the second leg of the Tour: `/{locale}/aarrr-funnel-template`,
a free page in both languages where a B2B SaaS team types its own monthly
numbers, sees where its funnel loses the most people, and leaves with slides
for its leadership meeting. Nothing typed leaves the browser: no account, no
server. It is built and still closed behind its flag; it opens once its copy
is proofread.

When someone shares that page today, the preview is **the landing's image**
(`share-today-landing-fr.png`, `share-today-landing-en.png`): « Où ta
croissance cale-t-elle ? » / "Where does your growth stall?" and a tag that
reads « № 15 QUESTIONS — 3 MIN — GRATUIT ». That promises the fifteen-question
check-up, which is another page. The game had the same problem and got its
own images (`share-today-game-hub-fr.png`, `share-today-game-level-fr.png`).

Antoine decided on 2026-10-01 that the engine's image is **drawn here first**,
then ported into the code. This brief asks for that one image, in French and
in English.

Screenshots in `design/ds-extension-06/`, from a production build of
2026-10-01 with the engine opened:

- `share-today-landing-fr.png`, `share-today-landing-en.png` — what a link to
  the engine unfurls as today. Every content page (glossary, how it works…)
  shares this image too;
- `share-today-result-fr.png` — a result's image, the richest of the family;
  note the space pill « 1/3 · FLAT » next to the wordmark;
- `share-today-game-hub-fr.png`, `share-today-game-level-fr.png` — the game's
  two images, in its night world;
- `engine-page-top-fr-desktop.png`, `engine-page-top-en-mobile.png` — the top
  of the engine's page: the ultramarine band, the stencil title, the
  stopwatch;
- `engine-peloton-fr-desktop.png`, `engine-peloton-en-mobile.png` — the
  « peloton » of the public example, the engine's signature visual;
- `engine-slide-peloton-fr.png` — the same peloton as the first slide of the
  example's deck.

All copy on them is **under review** (it goes to a proofing sheet with
Antoine): design against its length, not its words.

## What the engine looks like on its page

- **The space.** The site has three spaces, one race in three legs (design
  I + B): 1 · the Tour (flat stage, ink), **2 · the engine (time trial,
  ultramarine `--space-ultramarine`, #1d3f8f)**, 3 · the game (mountain
  stage, ochre). The engine's page is paper, with the ultramarine band under
  the header and ultramarine as its accent for labels and rules (9.23:1 on a
  card, 7.45:1 on the page).
- **The emblem.** A stopwatch (`brand/Stopwatch`, synced): an SVG drawing,
  300 × 310, ultramarine rim, the run so far as a wedge.
- **The picture.** The peloton (`viz/DotGrid` and `viz/DotLegend`, synced):
  four columns of one hundred dots — sign-ups, activated, active at day 30,
  paying at day 30 — on the public example (« Exemple SaaS »): 100, 18, ?, 6 to 9.
  The « ? » is a hatched block: a number the example did not measure.
- **The type.** Stardos Stencil for the title and the big numbers, Inter for
  prose, IBM Plex Mono for labels.

## The frame every share image shares

From the code (`src/lib/og/`), to keep:

- 1200 × 630, a 2 px ink border;
- the wordmark top left, « TOUR DE GROWTH », « GROWTH » in the brand red;
- the dashed « road line » across, under the header;
- the domain badge, « tourdegrowth.com », white on the red action fill;
- paper ground with its lift (landing, result) or the night world (game);
- **feed-size rule**: at about 320 px wide, the headline, the wordmark and
  one mark must still read. Nothing else competes with them.

## What the image must and must not say

1. **It is the engine's, not the check-up's.** At a glance in a feed, it must
   read as a tool you fill with your own numbers — not as fifteen questions.
2. **Never real numbers.** The image is one static picture per language,
   the same for everyone. No one's engine can ever reach it: nothing leaves
   the browser, and the page promises it in writing. If it draws a peloton,
   it is the public example's (100, 18, ?, 6 to 9) — or no numbers at all.
3. **The page's title, in both languages.** The strings that exist today
   (all under review):

   | | Français | English |
   |---|---|---|
   | Page title (H1) | « Ton moteur de growth » | "Your growth engine" |
   | Its eyebrow | « Le moteur » | "The engine" |
   | Its line | « Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres. » | "Your Tour tells you whether you measure. The engine shows what your numbers say." |
   | Search title (the query people type) | « Modèle de funnel AARRR : chiffres en local » | "AARRR funnel template: numbers kept local" |
   | The band | « 2/3 · Contre-la-montre » | "2/3 · Time trial" |
   | The promise | « Rien de ce que tu saisis ne sort d'ici » | "Nothing you enter leaves this page" |

   New words are welcome; say which, they go to the proofing sheet. We also
   need the image's **alt text** in each language.
4. **The house rules for French**: « tu », a non-breaking space before « : »,
   « ; », « ? » and « ! » and inside « », « étape » (never « pilier »),
   « slides » (never « deck »). The engine's name is « Moteur de growth »,
   lower case in running text.

## What it has to survive: the renderer

The image is rendered by Satori (`next/og`), not a browser. Whatever you draw
must fit inside these rules, or it cannot be ported:

- **flexbox only**: every element is `display: flex`; absolute positioning
  is fine; no grid;
- no CSS custom properties: give each colour **by its token name**, we write
  the literal value;
- no filters, no blur; linear and radial gradients, box shadows, dashed
  borders and inline SVG paths are fine (the stopwatch and the dots are
  SVG or flex and port as they are);
- **fonts**: Stardos Stencil 700, Inter 500 and 600, IBM Plex Mono 500 and
  600, static weights only, Latin subset plus « № ». Any other glyph (an
  arrow, « ≈ », a symbol) must be named: a glyph missing from the subset
  renders as an empty box;
- **contrast**: any text passes AA on its real ground (the project checks
  it). The brand red holds for large display text, as in the landing's
  « cale-t-elle ? », and for fills; smaller red text is the deep red.
  Ultramarine reads as text on paper and on a card.

## Questions for you

These are yours to answer; our lean is given so you can disagree with it.

1. **Ground.** Paper, like the page, with ultramarine as the accent — or an
   ultramarine ground? The game took night so as not to look like the
   check-up. Our lean: paper, and let the ultramarine band, the stopwatch or
   the peloton carry the difference.
2. **The picture.** The stopwatch, a peloton of the example, both, or
   neither?
3. **The words.** Which of the strings above, or new ones, and in what order?
4. **The space pill.** The result's image wears « 1/3 · FLAT ». Should this
   one wear « 2/3 · Contre-la-montre » / "2/3 · Time trial", in ultramarine?

## What we ask back

- The image in French and in English, 1200 × 630, built from the synced
  components and tokens.
- Each as a frame we can port: flex and absolute positioning only, every
  measure in px, every colour by its token name.
- The 320 px check of each.
- The alt text, French and English, and the list of every string drawn, per
  language.
- Your answers to the four questions, in a short README, like the return of
  extension 04 (`design/ds-extension-04-return/README.md`).
- Everything as **source files** we can read from the project, not only as
  built images: the return of extension 04 could not bring its built board
  back (`design/ds-extension-04-return/COPIE.md`).

## What happens next

The return lands in `design/ds-extension-06-return/`. A session ports it as
the engine's own `opengraph-image.tsx` (chantier T6.2): one image per
language, a 404 while the engine is closed, its strings covered by the font
test. Its copy joins the engine's proofing sheet before the page opens.
