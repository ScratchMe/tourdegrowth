# design-sync notes — Tour de Growth

Repo-specific gotchas for `/design-sync`. Read this before re-running.

## This repo is an app, not a component package

There is no `dist/`, no `exports`, no `main`, no Storybook. The design system
lives at `src/components/**` and is consumed only by the Next app in the same
repo. Consequences, all already encoded in `config.json`:

- **`--entry` must be given, and must NOT exist.** The converter derives
  `PKG_DIR` by walking up from `dirname(--entry)` to the nearest named
  `package.json`; without `--entry` it looks for `node_modules/tour-de-growth`
  and dies with `ENOENT`. But if `--entry` *resolves*, `resolveDistEntry`
  succeeds and the synth-from-src path never runs — you get
  `[ZERO_MATCH] no component exports` and a tokens-only bundle. So pass a
  deliberately absent path inside the repo:

  ```sh
  node .ds-sync/package-build.mjs --config .design-sync/config.json \
    --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle
  ```

  The `[NO_DIST] --entry ./dist/index.js doesn't exist` line is expected, not
  a failure.
- **`srcDir` is `src/components`, not `src`.** Scanning all of `src/` sweeps
  in every page component (`ResultPage`, `RootShell`, `PreviewCard`, …). The
  seven subdirectories become the seven groups the repo already uses —
  `brand`, `core`, `game`, `glossary`, `quiz`, `result`, `viz` — because
  `GENERIC_DIR` in `lib/source-kit.mjs` skips a `components/` level. The
  game's engine components live under `src/app/**/_engine` and are out of
  `srcDir` on purpose: they read game state, they are not primitives.
- **`cfg.buildCmd` emits declarations, and it is load-bearing.** It runs
  `npx tsc -p .design-sync/tsconfig.dts.json`, which writes real `.d.ts` into
  `dist/types/`. That is where the emitted contracts come from — see
  "The emitted contracts come from `dist/types`" below for what happens
  without it. `npm run build` builds the *app* and produces nothing the
  converter uses.

## `next/link` is shimmed — this is the one that costs a whole afternoon

Six components render a Next `Link` when given an `href` (`Button`,
`WordmarkLink`, `LocaleSwitcher`, `SiteFooter`, `TrackedLink`, `LegalPage`).
Next's compiler replaces a dozen `process.env.__NEXT_*` constants inside that
module; plain esbuild leaves them as real reads, so the IIFE threw
`ReferenceError: process is not defined` **before assigning
`window.TourDeGrowth`**. Symptom: `[BUNDLE_EXPORT] 35/35 not a component`
plus `[RENDER_ERRORS]` on all 35 previews — one root cause, 36 error lines.

`.design-sync/shims/next-link.tsx` renders the `<a href>` that `next/link`
renders anyway; what it drops is client-side routing, which a design canvas
has no use for. Wired by `paths` in `.design-sync/tsconfig.ds.json`. Bundle
went 280 KB → 127 KB (the whole router graph left with it).

**`tsconfig.ds.json` must be standalone and must contain no `"//"` key.**
`tsconfigPathsPlugin` reads the file directly — it does not follow `extends`,
so the `@/*` alias has to be repeated there. And its comment-stripper
(`/(^|[^:])\/\/.*$/gm`) eats a `"//": "..."` documentation key, the JSON then
fails to parse, and the plugin returns `null` **silently**: no alias fires,
`next/link` comes back, and nothing in the log says why. Cost me one full
rebuild to spot.

## Tokens come in through the JS graph, not `cssEntry`

`cfg.cssEntry: src/app/globals.css` **appends** that file verbatim to
`_ds_bundle.css`, where its five `@import "../styles/tokens/*.css"` lines no
longer resolve — `[CSS_IMPORT_MISSING]` ×5 and 95 undefined custom
properties. `cfg.tokensGlob` cannot fix it either: `copyTokens` returns early
unless `cfg.tokensPkg` names a package under `node_modules`, and these tokens
live in the repo.

Fix: `.design-sync/shims/ds-styles.ts` imports `globals.css`, and is wired via
`cfg.extraEntries`. esbuild then resolves and inlines the whole `@import`
chain exactly as it does each component's `.module.css`. Result: 123 tokens
defined against 105 referenced.

## Fonts ship as files

`.design-sync/fonts/` holds four woff2 (104 KB total) and `brand-fonts.css`,
wired through `cfg.extraFonts`. The converter copies them to `ds-bundle/fonts/`
and rewrites the `src` paths.

The app self-hosts these through `next/font/google`, which binds
`--font-ui`/`--font-mono`/`--font-display` on `<body>` at build time. None of
that exists in a canvas, and `typography.css`'s `:root` fallback would have
rendered every design in system-ui, silently.

**Shipped rather than `@import`-ed from the font host**, which is what this
first did: a remote import makes every headless render wait on the network,
and the render check went from about two minutes to an estimated eighteen.

**Inter is ONE file, not four.** Google serves the latin subset as a variable
font and returns the same URL for all four weights — verified against the
css2 endpoint, not assumed. It is declared once as `font-weight: 100 900`,
which instantiates the wght axis; four single-weight faces shipped the same
48 KB four times. Plex Mono is not variable, so 500 and 600 are genuinely
different files. Verified in Chromium by measuring rendered text: Inter gives
four distinct widths across 400/500/600/700, and the two Plex Mono weights
render different pixels (a monospace font has one advance width, so width
alone proves nothing there).

Use `format("woff2")`, not `format("woff2-variations")` — the latter is
deprecated syntax that some parsers reject, and Google's own CSS uses the
plain form for this same variable file.

The five `.ttf` files in `src/lib/og/fonts/` are **not** usable here: they are
~230-glyph subsets cut for Satori's share images. Fine for that image's fixed
strings, a silent glyph hole for anything a designer types.

`"Impact"` shows up in `[FONT_MISSING]` and stays there — it is the middle of
`--font-display: "Stardos Stencil", "Impact", sans-serif`, a system-font
fallback. It is also a proprietary Microsoft face we have no right to
redistribute, so this warning is permanent and correct.

**Font debugging trap.** Fonts are always fetched in CORS mode, and
`page.setContent()` gives a page `origin: null` — so a harness built that way
reports every family falling back to the same substitute, which looks exactly
like broken `@font-face` rules. Serve the test page from the same origin as
the fonts. Three unrelated typefaces measuring identical widths is the tell.

## The emitted contracts come from `dist/types`

`findTypesRoot` prefers `dist/types` over the package root, and the ts-morph
project loads **only `.d.ts`, never `.tsx`**. If `dist/types/` is missing or
stale, the search falls back to the repo root — where the only `.d.ts` files
are the handoff bundles under `design/ds-extension-0{1,3}-return/`. Those
describe the API the design *asked for*, not the one that shipped, and the
converter will happily emit them: measured drift included `ScoreDisplay`
still carrying `verdict` (removed in extension 03), `PriorityMove` missing
`pillar`/`score`/`total`/`upgrade`, and `Button` missing `href`/`compact`.

Check the build log for `[DTS] parsed N .d.ts files from .../dist/types` — if
that path is not `dist/types`, the contracts are wrong.

**The driver does not run `cfg.buildCmd`.** `resync.mjs` reads whatever
`dist/types/` holds; only `package-build.mjs` runs the build command. Measured
on 2026-09-30: after merging A5, the render was current (it is built from
`src/`) while the contracts still said `Button compact`, `Segmented size="md" |
"compact"` and `ClickPill size="compact"`, because `dist/types/` dated from the
previous merge. So before any driver run that follows a source change, run the
build command by hand:

```sh
npx tsc -p .design-sync/tsconfig.dts.json && node .design-sync/relativize-dts.mjs && node .design-sync/check-inventory.mjs
```

and check it: `grep -rl 'compact?: boolean' ds-bundle/components/` (or any
prop the change retired) must return nothing after the rebuild.

`tsconfig.dts.json`'s `include` is narrowed to `../src/components/**/*` on
purpose. Widening it reaches `src/proxy.ts` and `lib/i18n/meta.ts`, which
import Next, which pulls in `@vercel/og`'s `declare module 'react'` — and a
Tailwind `tw?: string` prop then appears on 21 of the 34 contracts. Verify
with `grep -rl 'from "next' dist/types/` returning nothing.

`next-env.d.ts` is deliberately out of the graph (it drags in Next's global
JSX augmentation); `.design-sync/types/css-modules.d.ts` replaces the part
that is actually needed.

## `LegalPage` is excluded on purpose

`componentSrcMap: {"LegalPage": null}`. It is the only component with an
inline destructured prop type instead of a named `<Name>Props` interface, so
`propsBodyFor` finds nothing and emits `[key: string]: unknown` — a contract
that says nothing. It also imports a page-level CSS module. It renders whole
legal documents from data and is not a design primitive.

## Every component is pinned in `componentSrcMap` — and a guard keeps it so

The converter has a trap that looks like a config typo. In synth-from-src
mode (`--entry` absent, see above), `lib/source-kit.mjs#resolvePackage`
derives the component list from `srcDir` **only if `componentSrcMap` adds
nothing non-null**. The moment one entry pins a file, the pinned entries
become the WHOLE list. The first DS v3 pass pinned four components to fix
their contracts and the bundle silently shrank from 70 components to 4 —
with 36 previews left pointing at components that no longer existed.

So `componentSrcMap` now pins all 90 exported components to their file
(`"LegalPage": null` stays), and `.design-sync/check-inventory.mjs`, chained
last in `cfg.buildCmd`, fails the build if a component exported from
`src/components/**` is missing from the map, pinned to the wrong file, or
pinned but no longer exported. Its success line is
`[inventory] 90 components pinned, 1 excluded on purpose, none missing`.
`QuarterNews` (the game's news screen, 2026-09-26) shipped without its entry
and broke this build for two days — caught by the design audit of
2026-09-27, not by anything that runs on a PR, since CI does not build the
bundle.
Adding a component therefore means adding it to the map, which is the point:
a new component shows up in Claude Design by decision, not by accident.

## `process-env.ts` must stay first in `extraEntries`

`SiteFooter` reads `process.env.TDG_GAME_OPEN_AT_BUILD` at module scope (the
form Next inlines at build time). The converter's esbuild defines only
`NODE_ENV`, so in the IIFE that was a read of a global that does not exist
in a browser: a `ReferenceError` while the bundle evaluates, before
`window.TourDeGrowth` is assigned — every preview blank, one cause.
`.design-sync/shims/process-env.ts` installs an empty `process.env` and is
listed FIRST in `cfg.extraEntries` (ES modules evaluate in import order). The
file's header says the same; do not reorder the list.

## The four standing validate warnings

All four are non-blocking and all are expected:

- `[FONT_MISSING] "Impact"` — the system-font fallback above.
- `[GRID_OVERFLOW] DefinitionPopover (Docked)` — the check is a **property**
  test, not a geometry one: `package-validate.mjs` flags any visible
  descendant with computed `position: fixed`, which the docked placement has
  by design. The suggested fix (`cardMode: "single"`) would show one story and
  hide the other three. The `Docked` story instead frames the sheet in a
  transformed, clipped 300×240 box that stands in for a phone viewport, which
  was **checked in the screenshot** and presents correctly. Keeping the grid
  also keeps the card under `compare.mjs`'s `[PORTAL?]` monitoring, which
  `single` would exempt it from.
- `[GRID_OVERFLOW] QuarterNews` — the same property test. The component is
  the system's one modal: `showModal()` lifts it into the top layer, which
  escapes any transformed ancestor, so every story would cover every other
  card. The preview's `InFrame` shadows `showModal` on that one dialog
  instance (a layout effect runs before the component's own effect), the
  component takes its documented fallback (`open`, a fixed layer), and a
  transformed, clipped 760×720 frame contains it. Checked in the screenshot
  on 2026-09-28: three stories, each inside its frame, none over another.
- `[GRID_OVERFLOW] GlossaryTerm (Open)` — since A4 (2026-09-29) the term
  opens ONE `DefinitionPopover`, `placement="auto"`, in the top layer, and a
  page shows one panel at a time: opening a second closes the first. In the
  column card that meant `French` showed closed although its code opened it,
  and `Open`'s panel hung under its cell. Decided by Antoine on 2026-09-30
  (accept, and make the card honest): `French` now renders its trigger closed
  on purpose (the French definition is `DefinitionPopover`'s `French`), and
  `Open` keeps 200px of room under its paragraph so the panel lands inside
  its own cell. Checked in the screenshot. The property test still flags it,
  and `cardMode: "single"` stays refused for the same reason as the others.

Wide components get `cardMode: "column"` in `cfg.overrides` (one full-width
card per story) — 30 of them now (counted in `config.json` on 2026-10-01; each
carries `viewport="900x700"` in its `@dsCard` marker): most of `game` (`ActionCard` joined on
2026-09-29, once its cards took their real 294px width), the two charts,
`Button` (its `States` grid) and `GlossaryTerm`. Add one when validate prints
`[GRID_OVERFLOW] … stories render wider than their grid cells`; that warning
is always a real crop. `QuarterReport` and `Hand` were not flagged but still
need it: squeezed into a third-width cell, their desktop layout (chosen by a
viewport media query, not the cell) overlapped its own figure labels.

## Previews are all repo-owned

All 91 live in `.design-sync/previews/` — none are generated (cell count: see
"Synced"). Copy is the product's own and numbers are the model's own — **and
that was not true until the 2026-09-29 re-sync**: this paragraph already said
so, while 64 of 245 cells carried retired copy, mockup copy, hand-typed game
numbers the model cannot reach, or a prop passed at its default. Grading found
them; reading the sources had not (see "Found in the 2026-09-29 re-sync").

**How the props are produced now — the method, not the result, is what keeps
this true.** Strings come from the product modules (`dictionary.ts`,
`copy-library.ts`, `how-it-works.ts`, `glossary-terms.ts`, `next-moves.ts`,
`free-context.ts`, `content/game/*.ts`), imported or copied verbatim. Numbers
and whole prop objects come from **running the product's own functions** and
pasting their output:
- game: a reference year played through the reducer
  (`lib/game/__tests__/paths.ts`: `PATH_A`, `PATH_C`, `PATH_M`, fired years…),
  turned into props by the island's builders
  (`app/[locale]/game/_island/island-view.ts`: `dashboardProps`, `handView`,
  `journalEntries`, `newsContent`, `reportContent`, `decemberContent`,
  `bossMessage`, `moodNow`);
- result: `computeScore`, `resolveBottleneck`, `buildQuickVerdict`,
  `resolveNextMove` on a board the quiz can produce (reachable pillar scores
  are 0/2/5/7/9/11/13/16/20 — the `/r/sample` board 18·12·8·16·20 is fixed
  display data and is NOT one; the result previews use 20·13·9·16·16 = 74);
- engine: `kpiRows` and the scenario view.
Run them with `node --experimental-strip-types --import ./register.mjs x.mts`,
where `register.mjs` installs a resolve hook (`@/` → `src/`, add `.ts`, stub
`.css`) — or bundle a scratch entry with `.ds-sync/node_modules/.bin/esbuild
--bundle --platform=node` (for the engine, no hook is needed: `--format=esm
--tsconfig=./tsconfig.json --alias:@=./src --loader:.css=empty`, then
`resolveTree(ENGINE_COPY, locale)` for the copy and `exampleEngine` from
`lib/engine/example.ts` for real chosen values — sources, repairs, targets). Paste the JSON as inline JSX props (contextual
typing keeps the unions) and name the path or board in the story's doc
comment. Keep scratch scripts in a per-batch folder: parallel agents share the
scratchpad.

French strings carry U+00A0 before `: ; ! ? % »`, after `«`, in digit groups
and before units. Check it in Python (`re` on each `"…"` literal, looking for
`[0-9A-Za-zé] [:;!?%»]`, `« ` and `\d \d{3}`), not with `grep -P`: in byte
mode `»`'s first byte is also U+00A0's, so grep reports every correct
insécable as a hit.

Game components that live at night are previewed inside `NightSurface`, so
they get the night tokens exactly as in the page; `EventClipping` stays paper
inside the night, which is its whole point. The paper ones (`ZoneNav`, the
December components) are previewed bare.

Three kinds of state a still cannot show, and each story says so rather than
pretending: **viewport** forms (`ActionBar`'s phone bar with counter and
clicks pill, `ZoneNav`'s compact line — both chosen by `@media`, not by the
card width; `RevealCells` stacks on a container query, so a card 520px wide
or less would draw it), **closed disclosures** (`ChartFrame`'s
data table, `GameJournal`'s entries, `PatternCatalogue`'s turned-down and
unseen groups), and **hover/press/animation** (`Button`'s `HoverAndPress`,
`VideoCall`'s typing and clock, the December unblur and stamp).

**What the per-story capture cannot see.** `package-capture.mjs` shoots each
story alone at 900×700 (`fullPage: false`), and the review sheet caps a cell at
520px. So:
- `SpaceBand`'s wide form (the legs' names) needs about 950px — a container
  query at 900px on `.inner` plus its 24px side padding. Its Tour, Engine, Game
  and NotOpenYet cells are clipped in the per-story shots and whole in the
  1200px render-check shot (`_screenshots/brand__SpaceBand.png`), which is
  what they are graded on. Narrowing the wrapper would switch them to the
  narrow form, which `Narrow` already shows. `SiteHeader` WithBand,
  `ContentHeader` InTheEngine and `ProsePage` NightIntro show the band in its
  narrow form at card width, and say so.
- Tall cells lose their bottom (`ProsePage` Page and NightIntro, all three
  `QuarterReport` cells, both `PatternCatalogue` cells since B6 showed all eight
  tricks, `PhoneMock` Dark):
  graded from the render-check shots or a scratch full-page shot, never from
  the cut sheet alone.
- `Hand` shows 6 of its cards for the same reason; its doc says which.

`ShareCard.tsx` imports `share-sample.png`, a real 1200×630 render of
`/r/sample` captured from a production build; esbuild inlines it as a data URI
via the same `.png` loader the bundler uses. **Do not** reuse the OG captures
in `design/ds-extension-03/` for this — they predate extension 03 and still
show the five pillar rows that release removed.

`PillarChip`'s `Stretch` story used to reproduce a real production defect (the
row spaced all four children apart instead of pairing the score). Fixed in the
component's CSS on 2026-09-11; the story now shows the intended shape, and its
doc comment says why the layout uses an auto margin rather than
`justify-content`.

## Synced

Project `23b9671c-a55b-452e-aa41-39906ee71ba8` ("Tour de Growth"), pinned as
`projectId` in `config.json`. **Last upload: 2026-10-01, B6 (A15 and
C33)**, from a claude.ai/code cloud session — **90 components, 303 story
cells**, all graded good. The driver keyed 13 components as changed
(`ErrorScreen`, `LoadingScreen`, `MetaLabel`, `GameEntry`, `NumberField`,
`FieldRow`, and the seven game previews regenerated from the model, see
"Found in the 2026-10-01 re-sync (B6)"), all regraded. `NightSurface` went up
with them: its emitted `.d.ts` and `.prompt.md` differed from the anchor's
while its sources and render hash did not (not chased further). 14
components uploaded, 76 carried forward. 463 files, no delete, `design/` untouched. Three driver
runs; `report_validate`: 90 total, 0 bad, 0 thin, 0 identical; anchor
`bundleSha12` `edc539adcbbf`. **A second pass the same evening** carried the
two tokens A14 T6 (#264) added while B6 was in review, `--paper-white` and
`--surface-white`: no component changed (0 changed, sources and render hashes
identical), so only the shared files went up (`_preview/`, `_vendor/`,
`fonts/`, bundle, CSS, README: 101 files), between the two sentinels, then
`_ds_sync.json`. Render check 90/0/0/0; anchor `6da5e42a15ef`. **None of these
uploads reached the Design System pane**, which still shows what was compiled on
2026-09-11. Writing `_ds_manifest.json` by hand later that evening (90 cards)
did not change it either; the design agent, though, reads the live files (see
"`_ds_manifest.json`" below). Earlier uploads: 2026-10-01 B4, the game's
level 2 and A7.3.c's engine (90, 303, 19 components uploaded, eight driver
runs, `fee6cc7084fe`), 2026-09-30 after A11 (88, 292, `8235f4e6de01`),
2026-09-30 B3 (88, 292, `d1835d51cffd`), 2026-09-30 before A10 (79
components, 244 cells, anchor `f3b4bf9eb3c5`), 2026-09-29 (77, 238,
`17cca5e0909b`), 2026-09-11 (34, 116).

The cell count is what the previews export, not a sum of what each session
announced. `CHANTIERS.md` B3 expected 284 (244, plus `ShareCard.Owner`, plus
the 39 cells A10.a wrote from the board); the rebuild from the product's call
sites ended at 292: the eleven form components went from 46 cells to 54
(`DateField` 2 → 6, `FieldRow` 2 → 4, `TextArea` 4 → 5, `Select` 5 → 6,
`Field` 3 → 4, `Choices` 4 → 5; `NumberField` 8 → 6; the others unchanged in
number). The 2026-09-29 note on 245 → 238 → 244 is in the journal.

**The project also holds `design/`, which is not part of the bundle.** On
2026-09-30 brief 04 went in at the paths it has in this repo:
`design/DS-EXTENSION-BRIEF-04.md` and the nine PNGs under
`design/ds-extension-04/` (ten files, written alone under their own plan,
anchor untouched), and Claude Design wrote its return next to them,
`design/ds-extension-04-return/` (56 files). On 2026-10-01 brief 05 (the stage
chips, B7) went in the same way: `design/DS-EXTENSION-BRIEF-05.md` and the ten
PNGs under `design/ds-extension-05/` (eleven files, their own plan, no delete,
anchor `6da5e42a15ef` untouched), and Claude Design wrote its return next to
them on 2026-10-02, `design/ds-extension-05-return/` (22 files, all source,
copied to the repo the same day; nothing outside that folder changed). Brief 06 (the growth engine's share image,
B5) followed the same evening: `design/DS-EXTENSION-BRIEF-06.md` and the ten
PNGs under `design/ds-extension-06/` (eleven files, their own plan, no delete,
anchor untouched); Claude Design returned it the same evening, under
`design/ds-extension-06-return/`, copied into this repo and ported (T6.2). A
re-sync must leave them: before applying
`upload.deletePaths`, check it names nothing under `design/`. Remove them on
purpose once the return is ported, not as a side effect of a sync.

**T6.2 (2026-10-01) moved two drawings into data, with the same markup.**
`brand/Stopwatch` reads its shapes from `stopwatch-geometry.ts` and
`brand/SpaceBand`'s three pictograms come from `space-pictos.ts`, because the
engine's share image draws them too. The rendered SVG is the same, attribute
for attribute (an explicit `fill="none"` on three open lines of the
pictograms aside), so no re-sync is owed for it; the next one uploads the two
components with nothing to see.

**Sessions do upload now.** The `DesignSync` tool answered from a cloud session
with the claude.ai login — no `/design-login`, no local machine. The
authorization that blocked the first attempt (2026-09-11) came from an
interactive session on Antoine's machine; it is no longer a prerequisite. The
upload asks its own approval once per run (`finalize_plan`).

The upload path for a pinned project is the skill's **atomic** one: re-fetch
`_ds_sync.json` right before `finalize_plan` (a moved `bundleSha12` means a
concurrent sync), sentinel `_ds_needs_recompile` first, content in chunks,
`upload.deletePaths` verbatim, sentinel again, **`_ds_manifest.json` from
`build-manifest.mjs`** (see "`_ds_manifest.json`" below: Claude Design does not
rebuild it), `_ds_sync.json` last, `list_files` and a `get_file` of the
manifest to confirm. No size error in either upload of 2026-09-30: first
two chunks of 200 then `styles.css` then `fonts/`; at B3, `_preview/` +
`_vendor/` + the root files in one call (94 files, 2.3 MB), `fonts/`, then
`components/` in two halves of 176. Build the chunk lists from the live
`ds-bundle/` into `.design-sync/.cache/`, never from memory.

## A fresh clone needs two installs before anything runs

`npm ci` (the repo's own deps — `cfg.buildCmd` shells out to `npx tsc`, and the
converter resolves React out of `./node_modules`), then the converter's own
deps in `.ds-sync/`. Neither directory is committed.

Playwright's browser is **not** in the repo either. `package-validate.mjs` and
`package-capture.mjs` need Chromium; the repo pins `playwright-core@1.56.1`,
which wants chromium build **1194**. `npx playwright install chromium` from the
repo root gets the matching one. Nothing was cached on this machine on the
first run — do not assume a sandbox has it.

**In a claude.ai/code cloud session** (2026-09-29) both are there: the
`/design-sync` skill ships the converter in its own base directory (stage it
into `.ds-sync/` as usual), and Chromium build 1194 is preinstalled under
`/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH`) — do not run `playwright
install`.

## `relativize-dts.mjs` — without it, half the contracts are useless

`tsc` copies path aliases into the emitted declarations verbatim, so
`dist/types/**` was full of `import type { Locale } from "@/lib/i18n/locale"`.
The converter reads that tree with ts-morph in a project that has **no `paths`
mapping**, so every aliased import was unresolved, every referenced type became
an error type, and the extractor printed the bare alias name instead of
expanding it. The emitted contracts — the thing the design agent codes against
— said `locale: Locale` and `sharpness: Sharpness` with neither type defined
anywhere in the file.

`.design-sync/relativize-dts.mjs` rewrites those specifiers to relative paths
and is chained into `cfg.buildCmd` after `tsc`. With it, `Locale` expands to
`"en" | "fr"` across 9 components and `Sharpness` to
`"clear" | "shared" | "level"`. Do not drop it from `buildCmd`; the failure is
silent and only visible by reading a `.d.ts`.

**Still unresolved, deliberately:** `BottleneckPillar`, `SegmentedOption` and
`ToneToggleValue` (the last only inside an `onChange` signature). These are
interfaces and non-union aliases, and ts-morph's `getText()` prints the alias
name for those even when resolvable — only `dtsPropsFor` can inline them. Left
alone because both previews pass the literal shape (`{ pillar, score }`,
`{ id, label, href? }`) and those examples are carried into the `.prompt.md`,
so the agent has the shape from the code that actually runs. Hand-writing the
bodies would duplicate the contract and silently rot.

Eight components **are** pinned in `cfg.dtsPropsFor`: `NotFoundScreen`
(below), `ProseText`, `ProseActions`, `StatTile` (a union of known / unknown /
hidden), `Sparkline`, `EventClipping` (a discriminated union on `kind`),
`PhoneMock` and `ShopPhone` (both phones' element unions live in `lib/game/`).
Other named object types (`HandCard`, `DashboardMetricTile`,
`DataTableColumn`, `ChartLegendItem`, `TypingPace`, …) still print as bare
names; their previews pass the literal shape. Each pin is a drift risk.

`cfg.dtsPropsFor.NotFoundScreen` **is** pinned, because that one had neither:
four props typed `Translatable` (a `Record`, so never expanded) and examples
that spread a `{...UNKNOWN_PAGE}` constant defined off-screen. **Drift risk:** a
prop added to `NotFoundScreen` will not appear in its contract until this entry
is updated by hand.

## No guidelines are shipped: `guidelinesGlob` is `[]` on purpose

The converter's default `guidelinesGlob` includes `docs/*.md`. This repo had
no `docs/` until 2026-10-01, when the journal's archived volumes and the
decisions index moved there; the B4 build then copied `docs/decisions.md`
(the product decisions' index) into `guidelines/`, ready to upload as design
guidance. It is not design guidance, and nothing in `docs/` is. The design
agent's guidance is `conventions.md` (the README's header) and each
component's `.prompt.md`. If a real design guideline is ever written, point
`guidelinesGlob` at that file by name rather than restoring the default.

## Per-component docs are deliberately NOT wired

`[DOCS_UNMAPPED]` lists all 70, and that is correct — do not "fix" it by
pointing `cfg.docsDir` at `design/ds-extension-0{1,3}-return/`. Those 29
handoff `.prompt.md` files describe the API the design asked for, not the one
that shipped, and 25 of them would *replace* a synthesized doc that is strictly
better: the components carry rich JSDoc, so the synthesized `.prompt.md` gets
that prose **plus** the real props from `dist/types` **plus** worked examples
lifted from the authored previews. Compared side by side on `PriorityMove`, the
synthesized file wins on every axis.

## Traps the previews hit — all six found by grading, none by reading code

The render check passed 34/34 on the first run with zero flags. Every one of
these was a card that rendered perfectly and said something false:

- **`Disclosure.rule` defaults to `true`.** The story named `NoRule` omitted the
  prop and therefore drew a rule. Pass `rule={false}`.
- **`PillarChip.total` defaults to `20`.** `Chips` and `WithTotal` were
  byte-identical; the second was dropped. There is no prop that yields a bare
  "18" — the denominator always prints.
- **`TextArea` over-limit needs `length > maxLength`.** The `OverLimit` story
  was 490/500, i.e. it never showed the red state it is named for. Now 567.
- **`TrackedLink` ships no styles at all.** It is a bare `<a>` that inherits
  colour from its container, so previewed standalone it renders browser-default
  blue. The preview applies `--text-link` the way the real containers do.
- **A French story had an English link label** ("voir How it works"). Test the
  FR cells, not just that they render.
- **`DefinitionTrigger open`** only shifts a border on a 16px glyph — invisible
  unless the closed and open states sit side by side, which the story now does.

Two components have no way to show their most useful state without help:
`Disclosure` (no `open` prop — `<details>` owns it) and any leaf that needs a
parent. For `Disclosure` the preview passes the **native** `open` attribute,
which reaches the element through the component's `...rest`. That is not in
`DisclosureProps`, and it type-checks only because TypeScript's `include` globs
skip dot-directories, so `.design-sync/previews/**` is outside the repo's
`tsc`. If that ever changes, this line errors.

Because the repo's `tsc` never sees the previews, type-check them by hand
after writing one: a scratch `tsconfig.json` that extends the repo's, maps
`tour-de-growth` to an index re-exporting every file in `componentSrcMap`,
and includes `.design-sync/previews/*.tsx`. Keep only lines starting with
`.design-sync` (component files error on CSS-module types without
`next-env.d.ts`, which is noise here). Expected residue: the two `Disclosure`
`open` lines above and `ShareCard`'s `.png` import. Anything else is a real
contract mismatch — this is what caught an undefined month in `ChartFrame`.

### Found in the DS v3 pass, all by reading the screenshots

- **`ActionBar`'s counter and pill are phone-only.** The first stories were
  named for the red "over the law" pill; the desktop canvas never draws it.
- **`GameJournal` entries are closed disclosures**, so "the two cards and
  what happened" were not on the card the doc described.
- **`PatternCatalogue`'s `ThreeGroups` showed two groups** until an unseen
  entry was added — a group with no member is not drawn.
- **Invented numbers creep in.** Hidden effects in `Playbook` and
  `PatternCatalogue` were first written by hand; they now match the level's
  constants. Same for copy: a catalogue `tell` was paraphrased until checked
  against `retention.ts`.

### Found in the 2026-09-29 re-sync, all by grading

64 of 245 cells, in 43 components, rendered cleanly and said something false.
Four agents graded them from the sheets, each finding was checked against the
source before anything was changed, and every one was fixed in the preview —
except the first, which was the product's:
- **A component bug.** `EventClipping`, and the CEO quote boxes of
  `QuarterNews` and `QuarterReport`, read `--radius-tag`, which design I (#177)
  turned into a 999px pill: the clipping became an ellipse spilling its text
  onto the night. Fixed in the components (PR #192), with an e2e guard that
  measures multi-line pills on screen.
- **A prop passed at its default** makes two identical cells: `total={20}` in
  `InsightCard` and `StampedPillar` (`WithTotal` removed), the same trap as
  `PillarChip` above.
- **Copy from the mockups, or retired from `src/`**: Bottleneck's "Solid
  engine, one flat tyre", ProseSection's "three per pillar", PriorityMove's
  upgrade copy, the game's "your two actions", a "Leave the call" hint.
- **A plausible number is not the model's number**: a radar at 81 (the
  inspection fires at its threshold and resets it), a €450,000 fine (the range
  is 97,500–110,000), a miss that beats its target, a June firing the model
  cannot produce, moods the CEO never has on that call.
- **Doc comments that promise more than the cell shows**: "the only place"
  when there are four, "mid-sentence" for a last word, a ✕ that needs
  `onClose`, "five pillars" over three chips.
- **Cells identical to their neighbour** (EN/FR wordmark, a link that differs
  only by `href`): removed rather than kept.
- **French typography**: three plain spaces before `?` or `:`.

### Found in the 2026-09-30 re-sync (B3), by grading and by the check capture

The nine form primitives, `TextArea.InAField` and `Segmented.InAForm` had
been written from brief 04's board (`design/ds-extension-04-return/board/`)
BEFORE A10.b and A10.c wired them, and type-checked but never rendered. Three
agents rebuilt them from the product's call sites (engine and audit), with
the copy verbatim and the values from the product's functions. Same root
cause in eight components:
- **Copy from the board, or from memory**: « Northwind », "Spend that month",
  « Début de la mission », a source list with "Everything else", and the
  audit's missing message typed with a colon where `FORM_COPY.missing` has
  an em dash.
- **A message that contradicted its own cell**: `Field`'s error said "Keep it
  under 120 characters" over a counter reading 104/120.
- **States no call site produces**, dropped rather than rewritten, because a
  card teaches the design agent a usage: `disabled`/`disabledReason` on
  `TextField`, `Select`, `Checkbox`; `Select missing`; `Choices
  disabledLead`; `Checkbox invalid`; `FormSummary`'s `invalid` line. If one
  of these gets wired, add its cell then, from that call site. (`optional`
  was in the same case until C29, the same evening: the engine now passes
  it, and so do the previews that mirror those four fields.)
- **Duplicates across components**: `Segmented.InAForm` repeated
  `Field.AroundSegmented`; it is now the audit's mandate.

The check capture of components whose code had changed while their preview
had not (Re-sync risks, second bullet) found two more, both in carried grades:
- **The game's fine**: A7.8 (C14) set it to €75,000, the legal maximum, in
  `levels/retention.ts`; `EventClipping` and `QuarterNews` still said
  €106,000 and the old « 60,000 + 500 per radar point ». No component changed.
- **`SpaceStrip`'s doc** still said « the cards are not links » after A7.9
  made every open card a door. The cells rendered identically; the words
  going to the design agent were false.

And one component defect, fixed in the same PR with a guard
(`form-controls.test.ts`): `Checkbox`'s rows were rounded, so the dashed rule
drawn on their top edge curled down at both ends, in every list of boxes.

Seen and reported, never « fixed » in a preview (the previews show the
product as it is): the 6px between a unit and its figure (« € 500 »; the
return's own CSS), `FieldRow`'s joiner sitting after the longer of label and
box, no red edge on an impossible day, « 1 days » in the engine's duration
estimate, and « facultatif » written inside four labels. Antoine decided C28
and C29 the same evening and all of it was fixed in the product (A11), then
re-synced: the previews moved with the product, not ahead of it.

A native `<select>` is closed in a still: its groups and order are never on
the card, so the `Select` stories say in their doc comments what the list
holds.

### Found in the 2026-10-01 re-sync (B4), by regenerating and by the drift search

B4 was meant to recapture the nine components A12 had changed and the two it
added. Two methods found more, and neither was reading a sheet:

- **The drift search** (Re-sync risks, third bullet, run as a script: every
  string literal of 10+ characters removed from `src/content`, `src/lib/i18n`
  and the game and engine libs since the last upload, looked up in the
  previews). It found `ZoneNav` still showing the acquisition zone « coming
  soon » (open since A12.f.1), `Choices` quoting the engine's model list that
  A7.3.c replaced by a type of company plus two motion checkboxes, and `Tag`
  labelling its outline tone with a « coming soon » no call site prints any
  more. Reading the new call sites added `Checkbox.LastMotion`: A7.3.c wired
  `disabled` + `disabledReason` (the last motion left in the settings), the
  state B3 had dropped for want of a call site.
- **Regenerating every game preview in scope** with the island's own builders
  (`dashboardProps`, `decemberContent`, `reportContent`, `newsContent`,
  `timelineSegments`, `journalEntries`, `phoneView`, `shopPhoneView`,
  `basketFor`, `clicksFor`) and comparing string by string, NBSP included.
  Most matched exactly. Two held numbers no year reaches, and both had been
  graded good since 2026-09-29: `RevealCells` (4.1% / 18 / 81 and
  4,4 % / 71 / 6 — no year ends there; 81 is the very radar the 09-29 pass
  flagged elsewhere) and `QuarterTimeline` (5.7% then 5.0%, and 5,7/5,0/4,4/4,3
  — no reference year plays those quarters). Both now come from a played
  year. A third, `PhoneMock`, had the right states but wrote its phone number
  with plain spaces where the copy has no-break ones.
- **A product defect**, seen by measuring `LastMotion` in a browser: a box
  both ticked and disabled lost its fill, because `.disabled .input` (same
  weight as `.input:checked`, later) repainted it beige, so the one motion
  left in the engine's settings read as unticked. Fixed in
  `Checkbox.module.css` (`.disabled .input:checked`, fill clipped inside the
  dashed edge) with an e2e measure in `engine-hybrid.spec.ts` (non-vacuity:
  1 test of 11 fails without the rule).

What to take from it: **a carried grade says the sheet looked right, not that
its numbers are the model's.** (Done in B6, below.) The game previews B4 did NOT regenerate —
`ActionCard`, `DgFace`, `DgMail`, `EndingHero`, `EventClipping`, `Hand`,
`PatternCatalogue`, `Playbook`, `ResumePrompt`, `ShareRow`, `TourLoop`,
`VideoCall` — are the next sync's first job, with the same scripts: bundle a
scratch entry with `.ds-sync/node_modules/.bin/esbuild --bundle
--platform=node --format=esm --tsconfig=./tsconfig.json --alias:@=./src
--loader:.css=empty`, play the path the story's doc names
(`lib/game/__tests__/paths.ts`, `paths-acquisition.ts`), call the builder,
and check that every string it returns is in the preview byte for byte. A
story whose doc names no path, or names one that does not produce it, gets a
real one: a random walk over the reducer (`handIds` + `toggle` + `run`)
finds a year with the wanted shape in seconds.

### Found in the 2026-10-01 re-sync (B6), by the drift search and by regenerating

B6 carried A15 (`ErrorScreen` `retry`, `LoadingScreen` told by the clock,
`Button` `sm`'s 44px strip, `MetaLabel` `as`) and C33 (`GameEntry` `eyebrow`).
What the three methods found beyond that:

- **The drift search** found `NumberField` and `FieldRow` still quoting the two
  engine messages A15.2 and A15.3 rewrote (« Ce n'est pas un nombre lisible »,
  « Le minimum dépasse le maximum »). Parse errors never render in a still, so
  no sheet could show it: the strings were going to the design agent through
  the `.prompt.md` examples.
- **The spot check** of components whose code changed without their preview
  (`Button`, `MetaLabel`, `SpaceBand`, `WordmarkLink`) rendered as graded, but
  `MetaLabel`'s doc said « It is not a heading », false since A15.13; its
  `Tracking` story now draws the result's two titles as `ResultView` does
  (`as="h2" wide`, default size).
- **Regenerating the twelve game previews B4 left** (three agents in parallel,
  `playPath` / `finalState` / `endingState` and the island's builders, every
  leaf compared byte for byte, then the lists by length): seven matched
  (`Playbook` 38/38, `EndingHero`, `DgMail`, `Hand` 96/96, `TourLoop`;
  `ActionCard` and `DgFace` right but with comments naming no year, or a wrong
  place), five did not, all graded good since 2026-09-29:
  `ShareRow` (a share text typed by hand, « 3.9 %, trust at 71 »: the model says
  « 4.0 %, trust at 83 / 100 »), `ResumePrompt` (5.7 % then 5.0 %, which no
  year reaches: the same invented pair as `QuarterTimeline` in B4),
  `PatternCatalogue` (4 and 3 entries under « the eight tricks », pre-2026-09-25
  cases, splits no year produces; `ThreeGroups` now comes from a year found by
  a random walk, named in the story), `EventClipping` (one of the quarter's two
  clippings in French) and `VideoCall` (`Ringing` passed `message=""`, the
  island always passes `bossMessage`).
- **A product doc defect**, fixed in the same PR: `DgFace`'s `framing` JSDoc
  placed the avatar in « the journal », which draws no face (it is the report
  and the news screen). It never reached Claude Design: the emitted `.d.ts`
  cuts a JSDoc at about 120 characters, before that clause. A long JSDoc is
  read in full only in the repo.
- **Seen, left to the product** (`CHANTIERS.md`): nothing passes
  `TourLoop.refId`, so the end-of-level « Où en est ta croissance ? » link never
  carries `?ref=` though GAME-BRIEF 13.3 D says it should when a result id is
  known; and « 83 / 100 » keeps plain spaces around the slash in French
  (`december.cells.outOf`), outside the NBSP list above.

## `_ds_manifest.json` — Claude Design never rebuilt it, and writing it was not enough

**What Antoine saw on 2026-10-01**: no kilometre marker anywhere in the
project. The `Bottleneck` card opened on a stencil numeral with « Solid engine,
one flat tyre » (mockup copy removed on 2026-09-29), and `LoadingScreen` still
showed three messages and three bars (before A15). Every file under them was
current: `_preview/Bottleneck.js` opened on `ScoreDisplay variant="marker"`,
`_preview/ScoreDisplay.js` exported `Marker` and `MarkerSmall`, and
`_ds_sync.json` held the B6 anchor with 90 components.

**The cause**: `_ds_manifest.json`, the index the Design System pane builds
its cards from, was still the one of the **2026-09-11** upload: 34 components,
34 cards in five groups (no `game`, no `viz`, none of extension 04's form
primitives, no `SpaceBand`…), and 123 tokens at their September values (`--radius-tag: 4px`,
`--radius-panel: 8px`). The `_ds_needs_recompile` sentinel, which asks Claude
Design to recompile that index from the cards' `@dsCard` first lines, was
still there. No upload since 2026-09-11 had been indexed, across six syncs.
Nobody saw it because every sync checked `list_files` (the files) and
`_ds_sync.json` (the anchor), and neither says what the pane shows. A public
report describes the same thing: nothing triggers the compile for files
written through `DesignSync` alone, and the workaround is to write the
manifest.

**The fix, 2026-10-01**: a new manifest went up alone, under a plan that named
only `_ds_manifest.json`. It was first built by a scratch script from the 90
markers read live; `build-manifest.mjs` was then written and produces the same
file byte for byte. That upload had no delete and
did not touch the sentinel, the bundle, `_ds_sync.json` or `design/`. It holds
90 components and 90 cards in seven groups, and 368 tokens (the :root
declarations, `:root, [data-world="paper"]` included). Read back with
`get_file`, it is byte-identical to the file sent. The September manifest was
kept only in that session's scratchpad: it described a bundle that no longer
exists, so there is nothing to roll back to.

**Every upload now ends with it**, after the converter and before
`_ds_sync.json`:

```sh
node .design-sync/build-manifest.mjs --bundle ./ds-bundle
```

It reads each card's own first line from the bundle (without `--bundle` it
derives them from `config.json`: group = the component's folder,
`viewport="900x700"` iff `cardMode: "column"`, checked against all 90 live
cards on 2026-10-01). Put `_ds_manifest.json` in the plan's writes, then
`get_file` it after the upload: its card count must equal the component
count. If the converter ever ships its own `_ds_manifest.json` again, diff
the two before choosing one.

**What the manifest did not fix** (checked by Antoine the same evening): after
the write and a reload, the pane was unchanged. It neither reads the
project's `_ds_manifest.json` live nor renders the project's card files: it
shows a copy compiled on 2026-09-11, and the sentinel was still there
afterwards. **The design agent is not affected**: brief 05's return carries
`design/ds-extension-05-return/board/system-snapshot.css`, its own copy of the
live `_ds_bundle.css` dated 2026-10-02, with `--radius-tag: 999px`,
`--paper-white` and the night world. Designs are built on the current
system; only the pane's catalogue is stale.

**Where it breaks: Claude Design's refresh on open.** The skill's own text
says the sentinel "fences the app's manifest/copy machinery against a
half-uploaded state", that "the app clears the sentinel whenever the user
opens the project", and that new cards "appear next time the user opens or
refreshes the project". On this project none of that happens. Antoine opened
it in the project itself, clicked its « Actualiser » button, and tried a
private window: no publish button or draft state exists, the pane is
unchanged, and the sentinel written by B6 is still there. Since the pane
also shows content removed on 2026-09-29, the refresh has failed since at
least the first upload after 2026-09-11, before `design/` held anything. No
file the sync can write restarts it. It is a Claude Design defect to report
(`CHANTIERS.md`, B8 and D13), not a step this repo is missing.

## Re-sync risks

- **`list_files` and the anchor do not prove what the pane shows**, and neither
  does `_ds_manifest.json` (section above). Six uploads passed every check while
  the pane stayed on 2026-09-11. Only someone looking at the pane can say.
- **Merging `main` in the middle of a re-sync.** A5 renamed variant props and
  stories (`mobile`/`desktop`/`compact` → `sm`/`md`, `Frame` → `Call`,
  `tone="red"` → `alert`, `DotGrid size` → `medium`, `DgFace size` →
  `framing`) in the same previews this sync had corrected: eleven conflicted.
  Keep the product-true content and apply the renames — and then grep **every**
  preview for the retired values, because a cleanly auto-merged file can still
  carry an old value on a line only this branch added (it happened in
  `StatTile`, `size="responsive"`, and `QuarterNews`, `DgFace size="avatar"`).
  The table of retired names is in `conventions.md`, "Variant names". An old
  value renders nothing wrong-looking: an unknown `size` falls back to the
  default, silently.
- **A component changed, its preview did not: the grade is carried.** Grades
  follow the preview sources, not the component's. After a merge, list the
  components whose `src/components/` files changed (`git diff --name-only`)
  and spot-check the ones the driver did not queue:
  `package-capture.mjs --components A,B --spot-check-components A,B`. On
  2026-09-30 that is how `GlossaryTerm`'s one-panel-at-a-time card was seen.

- **Previews drift from the product silently.** A change to the game model,
  the copy library or a component's defaults does not touch
  `.design-sync/previews/`, and nothing fails: the cell still renders. When
  those sources change, regenerate the affected props with the method in
  "Previews are all repo-owned" and re-grade — every preview's doc comment
  names the path or board it was built from. How to find them (it found the
  €106,000 fine on 2026-09-30): from the commit that recorded the last upload
  (`git log -S"<its cell count> story cells" -- .design-sync/NOTES.md`), run
  `git log <that>..HEAD -- src/lib/game src/content src/lib/i18n src/lib/engine`,
  read what each commit changed, and grep the previews for the old values.

- **`cfg.buildCmd` is two commands now**, and the second one is load-bearing.
  Simplifying it back to a bare `tsc` degrades a dozen contracts silently — no
  warning, no failed check, just alias names where unions should be. After any
  build change, spot-check that
  `ds-bundle/components/brand/ContentHeader/ContentHeader.d.ts` says
  `locale: "en" | "fr"` and not `locale: Locale`.
- **The eight `cfg.dtsPropsFor` entries are hand-written** and will not follow
  their components. If one gains or renames a prop, update the config entry
  or the contract lies.
- **`componentSrcMap` is the component list** (see above). `check-inventory`
  fails the build on drift; do not weaken it to a warning.
- **The Chromium build is pinned by the repo's `playwright-core`.** Bump that
  dependency and the cached browser stops matching (`browserType.launch:
  Executable doesn't exist`); re-run `npx playwright install chromium`.
- **The grades in `.design-sync/.cache/` are not committed.** What makes
  verification durable is the uploaded `_ds_sync.json`. If that anchor is ever
  lost or the project is recreated, every component (90 on 2026-10-01) re-verifies from scratch —
  which is a few hours of reading sheets, not minutes.
- **The `--entry ./dist/index.js` trick breaks the day the repo gains a real
  `dist/`.** If a build is ever added, drop the flag and set `cfg.buildCmd`.
- **`next-link.tsx` mirrors an API surface that can drift.** If a component
  starts using a `next/link` prop the shim doesn't accept, TypeScript in the
  app stays happy and only the converter notices. Re-read it against
  `next/link`'s props on any Next major.
- **The shipped fonts are a snapshot.** They were downloaded from Google
  Fonts once. Nothing re-fetches them, which is the point — but if Inter's
  latin subset is ever re-cut upstream, this copy will not follow.
- **`dist/types/` is generated, not committed.** `cfg.buildCmd` regenerates
  it, but a run that skips the build step against a stale or missing
  `dist/types/` silently emits the wrong contracts (see above).
- **Nothing pins the converter's own version.** `.ds-sync/` is re-copied from
  the skill on every run, so a future skill release can change the output
  contract under an unchanged config.
