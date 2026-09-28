# Six design alternatives for Tour de Growth: the shared brief

You are designing ONE direction for Tour de Growth, a bilingual (FR/EN) web product.
Antoine, the product owner, chooses between six directions from screenshots of the REAL site with
each direction laid over it. Your job: make your direction look finished, credible and desirable,
at the level of a site featured on godly.design. A recolour is not a direction.

Read first: `/home/user/tourdegrowth/CLAUDE.md` is already in your context.
Then read `../godly/board.md` (section 5 for your direction; sections 2-4 for the references, glyph coverage and contrast).
Also read `../audit2/articulation.md` (why the three spaces need a sign).

## The product in one paragraph
A free 3-minute AARRR diagnostic ("le Tour"): 15 questions, a score /100, the stage that stalls
("l'étape qui freine"), and one action. The result page is designed to be shared: it has a share image.
The product also has two other spaces:
- **the growth engine** ("le moteur"), where you enter 17 real numbers and get a diagnosis plus leadership (CODIR) slides;
- **the game** ("Le côté obscur"): five stages of the Tour, five companies, one CEO who wants the number; you learn to spot dark patterns. Today only one level is playable (Retention, at a streaming app); **four more are coming**, so never describe the game by that one level. The night world is the level's world; the hub is the door to all five.

Antoine's decision: **"Un Tour, trois étapes"**. The three spaces are three stages of one race. Each direction must
propose a **visual sign that tells the three spaces apart**, visible in the header area of each space and
consistent everywhere: Tour = landing, quiz, result; moteur = `/fr/aarrr-funnel-template`; jeu = `/fr/game`.

## The harness (already built; do not rebuild the app, do not stop the server)
- The production build runs at http://localhost:3300 (owner preview cookie handled by the harness).
- `node harness.mjs shoot <id>` captures 7 screens × 2 viewports (1280 desktop, 390 mobile) into `shots/<id>/`:
  - `landing` (/fr) and `landing-en` (/en);
  - `quiz` (first question);
  - `result` and `result-en` (/r/sample);
  - `engine` (the moteur, with example data, top 1.6 screens);
  - `game` (the game hub).
  Takes about 40 s. Look at EVERY capture with the Read tool, in both viewports, after each pass.
- `node share.mjs <id>` renders `share/<id>-fr.html` and `share/<id>-en.html` (1200×630) into `shots/<id>/share-{fr,en}.png`.
  In those HTML files, load fonts with `<link rel="stylesheet" href="/fonts.css">`. Any other asset goes next to the HTML, referenced from `/share/…`.
- The harness sets, on `<html>`:
  - `data-alt="<id>"`;
  - `data-space="tour|moteur|jeu"`;
  - `lang="fr|en"` (the page's own).
  It then injects `fonts.css` plus `designs/<id>.css`, then runs `designs/<id>.js` if it exists.
- **Readable class aliases**: every hashed CSS Module class `Foo-module__h4sh__bar` also gets `Foo--bar`.
  The inventory of modules and classes per screen is in `dom-dump.json`. `data-testid` attributes are also stable hooks.
  Reference captures of today's design are in `shots/current/` and today's share image in `share-current-fr.png`.

## How to write the overlay
- Prefix EVERY rule with `html[data-alt="<id>"]`. Space-specific rules use `html[data-alt="<id>"][data-space="moteur"]`, and so on.
- Tokens first. Override primitives and semantic tokens on `html[data-alt="<id>"]`. The token names are in
  `/home/user/tourdegrowth/src/styles/tokens/*.css`: colors, typography, shape, spacing, world-night.
  - Fonts are bound on `<body>` by next/font, so override `--font-display`, `--font-ui` and `--font-mono` on `html[data-alt="<id>"] body`.
  - The night world (`[data-world="night"]`) redeclares its tokens: override there too if your direction needs it.
- Then components. Restyle freely with the aliases: layout (grid), borders, shadows, backgrounds, pseudo-elements, SVG data-URIs.
- `designs/<id>.js` may add DECORATIVE DOM: a signature element, a space badge, a masthead, a rubric label.
  - It must not remove or rewrite the product's copy.
  - Any text you add must exist in both languages. Read `document.documentElement.lang`.
  - Use NBSP (U+00A0) before « : ; ! ? % € » and inside « … » in French.
  - Keep added text short.
- Fonts available in `fonts.css`: Saira Extra Condensed, Anton, JetBrains Mono, Big Shoulders Stencil, Big Shoulders,
  Source Serif 4, Newsreader, Libre Franklin, Pixelify Sans, Bricolage Grotesque, Inter Tight, Space Grotesk,
  Stardos Stencil, Inter, IBM Plex Mono. Check your choice against the glyph table in board.md §3; the share image needs № and the minus sign.

## Non-negotiables
- **Contrast**:
  - WCAG AA for all text: 4.5:1 for body text, 3:1 for large text (≥ 24 px, or ≥ 19 px bold);
  - 3:1 for meaningful non-text marks.
  - Compute every pair you introduce, and put the ratios in your notes.
- **Mobile at 390 px**: no horizontal scroll, no overlap, no text cut off.
- **Bilingual**: FR and EN both look right.
- **Red has meanings** in the current system: primary action, a diagnosis of the reader's business, advice.
  - A direction that keeps the identity (A, B, I) keeps that grammar.
  - A direction that changes identity may redefine its accent, but must say what carries "action" and "diagnosis".
- **No impersonation**: no logo, name or trade dress of the Tour de France or its organiser, and no real newspaper's masthead or exact pink.
  Generic cycling codes (a yellow, green or polka-dot jersey colour, a kilometre marker, a stage profile) are fine.
- **No person's name added anywhere.**
- **The score stays deterministic and explicable**: design must not imply precision the number doesn't have.

## Deliverables (all inside this folder)
1. `designs/<id>.css`, plus `designs/<id>.js` if needed.
2. `share/<id>-fr.html` and `share/<id>-en.html`: the result's share image (1200×630) in your direction, rendered with `node share.mjs <id>`. The sample content:
   - **FR**:
     - header « TOUR DE GROWTH » and « DIAGNOSTIC AARRR — 3 MIN »;
     - « SCORE GROWTH GLOBAL » with 74/100;
     - « PROCHAINE ACTION · RETENTION · 8/20 »: « Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien sont encore actifs trente jours plus tard. »;
     - « Retention est là où cette croissance cale. Et la tienne ? »;
     - « tourdegrowth.com ».
   - **EN**:
     - « TOUR DE GROWTH » and « AARRR CHECK-UP — 3 MIN »;
     - « OVERALL GROWTH SCORE » with 74/100;
     - « NEXT MOVE · RETENTION · 8/20 »: « Take one month's cohort of new users and count how many are still active thirty days later. »;
     - « Retention is where this growth stalls. Where does yours? »;
     - « tourdegrowth.com ».
3. Final captures: `shots/<id>/*.png` for all 7 screens × 2 viewports, plus `share-fr.png` and `share-en.png`.
4. `notes/<id>.md`, in French, short. Cover:
   - the thesis in two sentences;
   - the palette with measured contrasts;
   - the fonts and their glyph caveats;
   - the signature component;
   - **the sign of the three spaces** and how it reads on each;
   - what changes for the Tour, the moteur and the jeu;
   - the risks;
   - what implementing it for real would cost (tokens only / a few components / new illustration work).

## Working rules
- Work only inside this folder (`scratchpad/alt`). Never modify `/home/user/tourdegrowth`, never run git, never start or stop servers.
- Iterate: capture, look, fix. At least three passes. Stop when every capture of your direction would survive a design review.
- Your final message: the list of files, then five lines on what you would show Antoine first and why.
